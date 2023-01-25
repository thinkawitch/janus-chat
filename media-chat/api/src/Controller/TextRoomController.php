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
use Thinkawitch\JanusApi\JanusHttpClient;
use Thinkawitch\JanusApi\JanusHttpAdminClient;

#[Route(path: '/textroom', format: 'json')]
class TextRoomController extends AbstractController
{
    #[Route('', methods: ['GET'])]
    public function getRooms(
        JanusUserApiService $janusUserApi,
        JanusAdminApiService $janusAdminApi,
        JanusHttpAdminClient $janusAdmin,
        Connection $conn
    ) : JsonResponse
    {
        // janus
        #$serverInfo1 = $janusUserApi->getInfo();
        #$serverInfo2 = $janusAdminApi->getInfo();
        $janusRooms = $janusUserApi->getRooms(true);
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

        //$ac = new JanusHttpClient('', '');
        $status = $janusAdmin->getStatus();
        $sessions = $janusAdmin->getSessions();
        foreach ($sessions as $sessionId) {
            $handles[$sessionId] = $janusAdmin->getHandles($sessionId);
            foreach ($handles[$sessionId] as $handleId) {
                $handlesInfo[$handleId] = $janusAdmin->getHandleInfo($sessionId, $handleId);
            }
        }


        $user = $this->getUser();
        $isAdmin = $this->isGranted('ROLE_ADMIN');
        $sql = 'SELECT * FROM text_rooms WHERE deleted=0';
        if (!$isAdmin) $sql .= ' AND user_id=' . $user->getId();
        $sql .= ' ORDER BY id';

        // db
        $dbRooms = $conn->fetchAllAssociative($sql);

        // combine db data with janus live data
        $rooms = [];
        foreach ($dbRooms as $dbRoom) {
            $room = $dbRoom;
            $liveRoom = getJanusRoomById($janusRooms, $dbRoom['id']);
            if ($liveRoom) {
                $room['num_participants'] = $liveRoom['num_participants'];
            }

            if (!$isAdmin) {
                //unset($room[''])
            }
            $rooms[] = $room;
        }

//sleep(5); // to test abort controller

        $result = [
            'textroom' => 1,
            'rooms' => $rooms,
            'janusRooms' => $janusRooms,
        ];

//        return $this->json($result);

        return $this->json([
            'textroom' => 1,
            'rooms' => $dbRooms,
            #'server_info_1' => $serverInfo1,
            #'server_info_2' => $serverInfo2,
            'server_rooms' => $janusRooms,
            'db_rooms' => $dbRooms,
            'admin' => [
                'status' => $status,
                'sessions' => $sessions,
                'handles' => $handles,
                'handlesInfo' => $handlesInfo,
            ]
        ]);
    }

    #[Route('/{roomId}', requirements: ['roomId' => '\d+'], methods: ['GET'])]
    public function getRoom(
        int $roomId,
        Connection $conn,
        JanusUserApiService $janusUserApi,
    ) : JsonResponse
    {
        // janus
        $janusRooms = $janusUserApi->getRooms(true);

        $user = $this->getUser();
        $isAdmin = $this->isGranted('ROLE_ADMIN');
        $sqlParams = ['id' => $roomId, 'user_id' => $user->getId()];
        $sql = 'SELECT * FROM text_rooms WHERE deleted=0 AND id=:id';
        if (!$isAdmin) $sql .= ' AND user_id=:user_id';

        $room = $conn->fetchAssociative($sql, $sqlParams);
        if (!$room) return $this->json(['textroom' => 1, 'status' => 404, 'title' => 'Not found', 'detail' => "Room $roomId not found"], 404);

        $liveRoom = getJanusRoomById($janusRooms, $roomId);
        if ($liveRoom) {
            $room['num_participants'] = $liveRoom['num_participants'];
        }

        $result = [
            'textroom' => 1,
            'room' => $room,
        ];
        return $this->json($result);
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
        $isPrivate = true; // true
        $history = 25;
        $post = null;
        $permanent = false; // false
        $description = null;

//        throw $this->createAccessDeniedException();
//sleep(5); return $this->json(['test']);

        $data = $request->toArray();
        $description = !empty($data['description']) ? trim($data['description']) : null;
        $history = !empty($data['history']) ? intval($data['history']) : 0;
        $secret = !empty($data['secret']) ? trim($data['secret']) : null;
        $pin = !empty($data['pin']) ? trim($data['pin']) : null;

        try {
            $conn->beginTransaction();
            $conn->insert('text_rooms', [
                //'id' => $roomId,
                'user_id' => $this->getUser()->getId(),
                'created' => date('Y-m-d H:i:s'),
                'secret' => $secret,
                'pin' => $pin,
                'is_private' => $isPrivate ? 1 : 0,
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

    #[Route('/{roomId}', requirements: ['roomId' => '\d+'],  methods: ['PUT'])]
    public function update(
        int $roomId,
        Request $request,
        JanusUserApiService $janusUserApi,
        Connection $conn
    ) : JsonResponse
    {
        $data = $request->toArray();
        $newRoom = getGoodRoomDataForUpdate($data);
        if (empty($newRoom)) return $this->json(['textroom' => 1, 'status' => 400, 'title' => 'No data to update room', 'detail' => "No data to update room #$roomId"], 400);

        $user = $this->getUser();
        $isAdmin = $this->isGranted('ROLE_ADMIN');

        // only creator or admin may update the room
        $sqlParams = ['id' => $roomId, 'user_id' => $user->getId()];
        $sql = 'SELECT * FROM text_rooms WHERE deleted=0 AND id=:id';
        if (!$isAdmin) $sql .= ' AND user_id=:user_id';
        $room = $conn->fetchAssociative($sql, $sqlParams);
        if (!$room) return $this->json(['textroom' => 1, 'status' => 404, 'title' => 'Room not found', 'detail' => "Room #$roomId not found"], 404);

        // validate
        foreach (['description', 'pin', 'secret'] as $field) {
            // janus does not set empty value back, only non-empty values will be updated
            // this will make room non-editable non-deletable
            if (!empty($room[$field]) && array_key_exists($field, $newRoom) && strlen($newRoom[$field]) == 0) {
                return $this->json(['textroom' => 1, 'status' => 400, 'title' => 'Can not make field empty', 'detail' => "Field #$field can not be set empty"], 400);
            }
        }

        //dd($newRoom);
        try {
            $conn->beginTransaction();
            $result = $janusUserApi->updateRoom($roomId, $room['secret'], $newRoom);
            $conn->update('text_rooms', $newRoom, ['id' => $roomId]);
            $conn->commit();
        } catch (\Exception $e) {
            $conn->rollBack();
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
        $user = $this->getUser();
        $isAdmin = $this->isGranted('ROLE_ADMIN');

        if ($roomId == 1234) {
            throw $this->createAccessDeniedException('This room should stay!');
        }

        // only creator or admin may destroy the room
        $sqlParams = ['id' => $roomId, 'user_id' => $user->getId()];
        $sql = 'SELECT * FROM text_rooms WHERE deleted=0 AND id=:id';
        if (!$isAdmin) $sql .= ' AND user_id=:user_id';
        $room = $conn->fetchAssociative($sql, $sqlParams);
        if (!$room) return $this->json(['textroom' => 1, 'status' => 404, 'title' => 'Room not found', 'detail' => "Room #$roomId not found"], 404);


        $deleteFromDb = true;

        try {
            $result = $janusUserApi->destroyRoom($roomId, $room['secret']);
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
                    throw $e;
            }
        }

        if ($deleteFromDb) {
            //$conn->delete('text_rooms', ['id' => $roomId]);
            $conn->update('text_rooms', ['deleted' => 1], ['id' => $roomId]);
        }

        return $this->json($result);
    }

    #[Route('/info', methods: ['GET'])]
    public function getInfo(
        JanusUserApiService $janusUserApi,
        JanusAdminApiService $janusAdminApi,
        Connection $conn
    ) : JsonResponse
    {
        $user = $this->getUser();
        $isAdmin = $this->isGranted('ROLE_ADMIN');

        $sqlParams = ['user_id' => $user->getId()];
        // total
        $sql = 'SELECT COUNT(id) FROM text_rooms WHERE deleted=0';
        if (!$isAdmin) $sql .= ' AND user_id = :user_id';
        [$totalRooms] = $conn->fetchFirstColumn($sql, $sqlParams);

        // active
        $sql = 'SELECT COUNT(id) FROM text_rooms WHERE deleted=0 AND active=1';
        if (!$isAdmin) $sql .= ' AND user_id = :user_id';
        [$activeRooms] = $conn->fetchFirstColumn($sql, $sqlParams);

        // deleted
        $sql = 'SELECT COUNT(id) FROM text_rooms WHERE deleted=1';
        if (!$isAdmin) $sql .= ' AND user_id = :user_id';
        [$deletedRooms] = $conn->fetchFirstColumn($sql, $sqlParams);

        return $this->json([
            'textroom' => 1,
            'total_rooms' => $totalRooms,
            'active_rooms' => $activeRooms,
            'deleted_rooms' => $deletedRooms,
        ]);
    }
}


function getJanusRoomById($janusRooms, $id) : ?array {
    if (!$janusRooms) return null;
    foreach ($janusRooms as $jr) {
        if ($jr['room'] == $id) return $jr;
    }
    return null;
}

function getGoodRoomDataForUpdate(array $data) : array {
    $stringFields = ['description', 'secret', 'pin', 'post'];
    $numFields = [/*'history'*/]; // history can't be changed after creation
    $good = [];
    foreach ($stringFields as $f) {
        if (array_key_exists($f, $data)) {
            $good[$f] = trim($data[$f]);
        }
    }
    foreach ($numFields as $f) {
        if (array_key_exists($f, $data)) {
            $good[$f] = intval($data[$f]);
        }
    }
    return $good;
}
