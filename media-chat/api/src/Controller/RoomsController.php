<?php

namespace App\Controller;

use App\Common\JanusConstants;
use App\Service\JanusUserApiService;
use Doctrine\DBAL\Connection;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Annotation\Route;
use Thinkawitch\JanusApi\JanusHttpClient;
use Thinkawitch\JanusApi\JanusHttpAdminClient;

#[Route(path: '/rooms', format: 'json')]
class RoomsController extends AbstractController
{
    #[Route('', methods: ['GET'])]
    public function getRooms(
        JanusUserApiService $janusUserApi,
        JanusHttpAdminClient $janusAdmin,
        Connection $conn
    ) : JsonResponse
    {
        $user = $this->getUser();
        $isAdmin = $this->isGranted('ROLE_ADMIN');

        // janus text rooms
        $janusTextRooms = $janusUserApi->getRooms(true);

        // db text rooms
        $sql = 'SELECT * FROM text_rooms WHERE deleted=0';
        if (!$isAdmin) $sql .= ' AND user_id=' . $user->getId();
        $sql .= ' ORDER BY id';
        $dbTextRooms = $conn->fetchAllAssociative($sql);

        // active -- room is running on janus
        // deleted - full deleted, disabled, not working, just left for stats
        // enabled - should be launched on janus start,
        // disabled - should not be launched by janus on start

        // combine db data with janus live data
        $rooms = [];
        foreach ($dbTextRooms as $dbTextRoom) {
            $room = $dbTextRoom;
            $liveRoom = self::getJanusRoomById($janusTextRooms, $dbTextRoom['id']);
            if ($liveRoom) {
                $room['num_participants'] = $liveRoom['num_participants'];
            }

            if (!$isAdmin) {
                //unset($room[''])
            }
            $rooms[] = $room;
        }

//sleep(5); // to test abort controller

        // regular user
        if (!$isAdmin) {
            $result = [
                'rooms' => $rooms,
            ];
            return $this->json($result);
        }

        // admin
        $handles = [];
        $handlesInfo = [];
        $status = $janusAdmin->getStatus();
        $sessions = $janusAdmin->getSessions();
        foreach ($sessions as $sessionId) {
            $handles[$sessionId] = $janusAdmin->getHandles($sessionId);
            foreach ($handles[$sessionId] as $handleId) {
                $handlesInfo[$handleId] = $janusAdmin->getHandleInfo($sessionId, $handleId);
            }
        }
        $result = [
            'rooms' => $rooms,
            'server_text_rooms' => $janusTextRooms,
            'admin' => [
                'status' => $status,
                'sessions' => $sessions,
                'handles' => $handles,
                'handles_info' => $handlesInfo,
            ]
        ];

        return $this->json($result);
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

        $liveRoom = self::getJanusRoomById($janusRooms, $roomId);
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
        $isPrivate = true; // true
        $post = null;
        $permanent = false; // false

//        throw $this->createAccessDeniedException();
//sleep(5); return $this->json(['test']);

        $data = $request->toArray();
        $enabled = !empty($data['enabled']) ? boolval($data['enabled']) : false;
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
                'enabled' => $enabled ? 1 : 0,
                'secret' => $secret,
                'pin' => $pin,
                'is_private' => $isPrivate ? 1 : 0,
                'history' => $history,
                'post' => $post,
                'permanent' => $permanent ? 1 : 0,
                'description' => $description,
            ]);
            $roomId = $conn->lastInsertId();
            $result = ['room' => $roomId];

            if ($enabled) {
                $janusUserApi->createRoom(
                    $roomId,
                    description: $description,
                    secret: $secret,
                    pin: $pin,
                    isPrivate: $isPrivate,
                    history: $history,
                );
            }

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
        $newRoom = static::getGoodRoomDataForUpdate($data);
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
            if ($room['active']) {
                $janusUserApi->editRoom($roomId, $room['secret'], $newRoom);
            }
            $conn->update('text_rooms', $newRoom, ['id' => $roomId]);
            $result = ['room' => $roomId];
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


        $updateInDb = true;
        $result = ['room' => $roomId];

        // destroy on janus
        try {
            $janusUserApi->destroyRoom($roomId, $room['secret']);
        } catch (\Exception $e) {
            $updateInDb = false;
            switch ($e->getCode()) {
                case JanusConstants::JANUS_TEXTROOM_ERROR_NO_SUCH_ROOM:
                    $updateInDb = true;
                    break;
                default:
                    throw $e;
            }
        }

        // mark as deleted in db
        if ($updateInDb) {
            $conn->update('text_rooms', ['deleted' => 1], ['id' => $roomId]);
        }

        return $this->json($result);
    }

    #[Route('/stats', methods: ['GET'])]
    public function getStats(
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

        // enabled
        $sql = 'SELECT COUNT(id) FROM text_rooms WHERE deleted=0 AND enabled=1';
        if (!$isAdmin) $sql .= ' AND user_id = :user_id';
        [$enabledRooms] = $conn->fetchFirstColumn($sql, $sqlParams);

        // active
        $sql = 'SELECT COUNT(id) FROM text_rooms WHERE deleted=0 AND active=1';
        if (!$isAdmin) $sql .= ' AND user_id = :user_id';
        [$activeRooms] = $conn->fetchFirstColumn($sql, $sqlParams);

        // deleted
        $sql = 'SELECT COUNT(id) FROM text_rooms WHERE deleted=1';
        if (!$isAdmin) $sql .= ' AND user_id = :user_id';
        [$deletedRooms] = $conn->fetchFirstColumn($sql, $sqlParams);

        return $this->json([
            'total_rooms' => $totalRooms,
            'enabled_rooms' => $enabledRooms,
            'active_rooms' => $activeRooms,
            'deleted_rooms' => $deletedRooms,
        ]);
    }

    protected static function getJanusRoomById($janusRooms, $id) : ?array {
        if (!$janusRooms) return null;
        foreach ($janusRooms as $jr) {
            if ($jr['room'] == $id) return $jr;
        }
        return null;
    }

    protected static function getGoodRoomDataForUpdate(array $data) : array {
        $stringFields = ['description', 'secret', 'pin', 'post'];
        $numFields = ['enabled', /*'history'*/]; // history can't be changed after creation
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
}
