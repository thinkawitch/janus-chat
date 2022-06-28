<?php

namespace App\Controller;

use App\Common\JanusConstants;
use App\Service\JanusAdminApiService;
use App\Service\JanusUserApiService;
use Doctrine\DBAL\Connection;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Annotation\Route;

#[Route(path: '/textroom', format: 'json')]
class TextRoomController extends AbstractController
{
    #[Route('', methods: ['GET'])]
    public function index(
        JanusUserApiService $janusUserApi,
        JanusAdminApiService $janusAdminApi,
        Connection $conn
    ) : JsonResponse
    {
        #$serverInfo1 = $janusUserApi->getInfo();
        #$serverInfo2 = $janusAdminApi->getInfo();

        $rooms = $janusUserApi->getRooms();

        $status = $janusAdminApi->getStatus();
        $sessions = $janusAdminApi->listSessions();
        $handles = [];
        $handlesInfo = [];
        /*foreach ($sessions as $sessionId) {
            $handles[$sessionId] = $janusAdminApi->listHandles($sessionId);
            foreach ($handles[$sessionId] as $handleId) {
                $handlesInfo[$handleId] = $janusAdminApi->getHandleInfo($sessionId, $handleId);
            }
        }*/

        $conn->fetchAllAssociative('SELECT * FROM rooms');

sleep(5); // to test abort controller

        return $this->json([
            'textroom' => 1,
            #'server_info_1' => $serverInfo1,
            #'server_info_2' => $serverInfo2,
            'rooms' => $rooms,
            'admin' => [
                'status' => $status,
                'sessions' => $sessions,
                'handles' => $handles,
                'handlesInfo' => $handlesInfo,
            ]
        ]);
    }

    #[Route('', methods: ['POST'])]
    public function create(
        Request $request,
        JanusUserApiService $janusUserApi,
        Connection $conn
    ) : JsonResponse
    {
        //$roomId = 22;
        $secret = null;
        $pin = null;
        $private = true; // true
        $history = 25;
        $post = null;
        $permanent = false; // false
        $description = null;

        $data = $request->toArray();
        $description = $data['description'] ?? null;
        $history = $data['history'] ?? 0;
        $secret = $data['secret'] ?? null;
        $pin = $data['pin'] ?? null;

        try {
            $conn->beginTransaction();
            $conn->insert('rooms', [
                //'id' => $roomId,
                'user_id' => $this->getUser()->getId(),
                'created' => date('Y-m-d H:i:s'),
                'secret' => $secret,
                'pin' => $pin,
                'private' => $private ? 1 : 0,
                'history' => $history,
                'post' => $post,
                'permanent' => $permanent ? 1 : 0,
                'description' => $description,
            ]);
            $roomId = $conn->lastInsertId();
            $result = $janusUserApi->createRoom(
                $roomId,
                description: $description,
                secret: $secret,
                pin: $pin,
                history: $history,
                //private: $private,
                //permanent: $permanent
            );
            $conn->commit();
        } catch (\Exception $e) {
            $conn->rollBack();
            switch ($e->getCode()) {
                case JanusConstants::JANUS_TEXTROOM_ERROR_ROOM_EXISTS:
                    break;
            }
            throw $e;
        }

        return $this->json($result);
    }

    #[Route('/{roomId}', requirements: ['roomId' => '\d+'], methods: ['DELETE'])]
    public function destroy(
        int $roomId,
        JanusUserApiService $janusUserApi,
        Connection $conn
    ) : JsonResponse
    {
        // only creator or admin can destroy the room
        $deleteFromDb = true;

        try {
            $result = $janusUserApi->destroyRoom($roomId);
        } catch (\Exception $e) {
            $deleteFromDb = false;
            switch ($e->getCode()) {
                case JanusConstants::JANUS_TEXTROOM_ERROR_NO_SUCH_ROOM:
                    $deleteFromDb = true;
                    $result = [
                        'textroom' => 'destroyed',
                        'room' => $roomId,
                        'permanent' => false,
                    ];
                    break;
                default:
                    throw  $e;
            }
        }

        if ($deleteFromDb) {
            //$conn->delete('rooms', ['id' => $roomId]);
            $conn->update('rooms', ['deleted' => 1], ['id' => $roomId]);
        }

        return $this->json($result);
    }
}
