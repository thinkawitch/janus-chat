<?php

namespace App\Controller;

use App\Service\JanusUserApiService;
use Doctrine\DBAL\Connection;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Annotation\Route;
use Thinkawitch\JanusApi\JanusHttpAdminClient;
use Thinkawitch\JanusApi\JanusConstants;

#[Route(path: '/rooms', format: 'json')]
class RoomsController extends AbstractController
{
    private bool $useTextRooms;
    private bool $useVideoRooms;

    public function __construct(bool $useTextRooms, bool $useVideoRooms)
    {
        $this->useTextRooms = $useTextRooms;
        $this->useVideoRooms = $useVideoRooms;
    }

    #[Route('', methods: ['GET'])]
    public function getRooms(
        JanusUserApiService $janusUserApi,
        JanusHttpAdminClient $janusAdmin,
        Connection $conn
    ) : JsonResponse
    {
        $user = $this->getUser();
        $isAdmin = $this->isGranted('ROLE_ADMIN');

        // janus rooms
        $janusRooms = $janusUserApi->getRooms(true);

        // db text rooms
        $sql = 'SELECT * FROM text_rooms WHERE deleted=0';
        if (!$isAdmin) $sql .= ' AND user_id=' . $user->getId();
        $sql .= ' ORDER BY id';
        $dbTextRooms = $conn->fetchAllAssociative($sql);

        // db video rooms
        $sql = 'SELECT * FROM video_rooms WHERE deleted=0';
        if (!$isAdmin) $sql .= ' AND user_id=' . $user->getId();
        $sql .= ' ORDER BY id';
        $dbVideoRooms = $conn->fetchAllAssociative($sql);

        // active -- room is running on janus
        // deleted - full deleted, disabled, not working, just left for stats
        // enabled - should be launched on janus start,
        // disabled - should not be launched by janus on start

        // combine db data with janus live data
        // also mix textroom with videoroom
        $rooms = [];
        foreach ($dbTextRooms as $dbTextRoom) {
            $room = $dbTextRoom;
            $liveRoom = self::getJanusRoomById($janusRooms, $dbTextRoom['id']);
            if ($liveRoom) {
                $room['num_participants'] = $liveRoom['num_participants'];
            }
            $videoRoom = self::getDbVideoRoomById($dbVideoRooms, $dbTextRoom['id']);
            if ($videoRoom) {
                foreach ($videoRoom as $vrField => $vrValue) {
                    if (!array_key_exists($vrField, $room)) $room[$vrField] = $vrValue;
                }
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
            'server_rooms' => $janusRooms,
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
        $user = $this->getUser();
        $isAdmin = $this->isGranted('ROLE_ADMIN');

        // janus
        $janusRooms = $janusUserApi->getRooms(true);
        $janusTextRoom = self::getJanusRoomById($janusRooms, $roomId);

        $textRoom = null;
        $videoRoom = null;
        $room = null; // combined all data

        // textroom
        if (true) {
            $sqlParams = ['id' => $roomId, 'user_id' => $user->getId()];
            $sql = 'SELECT * FROM text_rooms WHERE deleted=0 AND id=:id';
            if (!$isAdmin) $sql .= ' AND user_id=:user_id';
            $textRoom = $conn->fetchAssociative($sql, $sqlParams);
            if (!$textRoom) return $this->json(['status' => 404, 'title' => 'Not found', 'detail' => "Room $roomId not found, text"], 404);
        }

        // videoroom
        if (false) {
            $sqlParams = ['id' => $roomId, 'user_id' => $user->getId()];
            $sql = 'SELECT * FROM video_rooms WHERE deleted=0 AND id=:id';
            if (!$isAdmin) $sql .= ' AND user_id=:user_id';
            $videoRoom = $conn->fetchAssociative($sql, $sqlParams);
            if (!$videoRoom) return $this->json(['status' => 404, 'title' => 'Not found', 'detail' => "Room $roomId not found, video"], 404);
        }

        // combine
        if ($textRoom) {
            $room = $textRoom;
        }
        if ($videoRoom) {
            if (!$room) {
                $room = $videoRoom;
            } else {
                $room = [...$room, ...$videoRoom];
            }
        }

        // add live textroom data
        if ($janusTextRoom) {
            $room['num_participants'] = $janusTextRoom['num_participants'];
        } else {
            $room['num_participants'] = 0;
        }

        $result = [
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
        //$useTextRooms = $this->getParameter('app.use_text_rooms');
        //$useVideoRooms = $this->getParameter('app.use_video_rooms');

        $isPrivate = true; // true
        $post = null;
        $permanent = false; // false

        $data = $request->toArray();
        // common
        $enabled = !empty($data['enabled']) ? boolval($data['enabled']) : false;
        $description = !empty($data['description']) ? trim($data['description']) : null;
        $secret = !empty($data['secret']) ? trim($data['secret']) : null;
        $pin = !empty($data['pin']) ? trim($data['pin']) : null;
        // text
        $history = !empty($data['history']) ? intval($data['history']) : 0;
        // video
        $publishers = !empty($data['publishers']) ? intval($data['publishers']) : 0;

        try {
            $conn->beginTransaction();
            $roomId = null;
            $userId = $this->getUser()->getId();
            if ($this->useTextRooms) {
                $conn->insert('text_rooms', [
                    'user_id' => $userId,
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
            }
            if ($this->useVideoRooms) {
                $videoRoomData = [
                    'user_id' => $userId,
                    'created' => date('Y-m-d H:i:s'),
                    'enabled' => $enabled ? 1 : 0,
                    'secret' => $secret,
                    'pin' => $pin,
                    'is_private' => $isPrivate ? 1 : 0,
                    'permanent' => $permanent ? 1 : 0,
                    'description' => $description,
                    'publishers' => $publishers,
                ];
                if ($this->useTextRooms) {
                    $videoRoomData['id'] = $roomId;
                }
                $conn->insert('video_rooms', $videoRoomData);
                if (!$this->useTextRooms) {
                    $roomId = $conn->lastInsertId();
                }
            }

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
            /* # do we need this, should move the check into $janusUserApi
            switch ($e->getCode()) {
                case JanusConstants::JANUS_TEXTROOM_ERROR_ROOM_EXISTS:
                    break;
                case JanusConstants::JANUS_VIDEOROOM_ERROR_ROOM_EXISTS:
                    break;
            }*/
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
        if (empty($newRoom)) return $this->json(['status' => 400, 'title' => 'No data to update room', 'detail' => "No data to update room #$roomId"], 400);

        $user = $this->getUser();
        $isAdmin = $this->isGranted('ROLE_ADMIN');

        // only creator or admin may update the room
        $sqlParams = ['id' => $roomId, 'user_id' => $user->getId()];
        $sql = 'SELECT * FROM text_rooms WHERE deleted=0 AND id=:id';
        if (!$isAdmin) $sql .= ' AND user_id=:user_id';
        $room = $conn->fetchAssociative($sql, $sqlParams);
        if (!$room) return $this->json(['status' => 404, 'title' => 'Room not found', 'detail' => "Room #$roomId not found"], 404);

        // validate
        foreach (['description', 'pin', 'secret'] as $field) {
            // janus does not set empty value back, only non-empty values will be updated
            // this will make room non-editable non-deletable
            if (!empty($room[$field]) && array_key_exists($field, $newRoom) && strlen($newRoom[$field]) == 0) {
                return $this->json(['status' => 400, 'title' => 'Can not make field empty', 'detail' => "Field #$field can not be set empty"], 400);
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
        if (!$room) return $this->json(['status' => 404, 'title' => 'Room not found', 'detail' => "Room #$roomId not found"], 404);

        $updateInDb = true;
        $result = ['room' => $roomId];

        // destroy on janus,
        // exceptions moved to $janusUserApi, constants have equal values, bad for checks
        $janusUserApi->destroyRoom($roomId, $room['secret']);
        /*try {
            $janusUserApi->destroyRoom($roomId, $room['secret']);
        } catch (\Exception $e) {
            $updateInDb = false;
            switch ($e->getCode()) {
                case JanusConstants::JANUS_TEXTROOM_ERROR_NO_SUCH_ROOM:
                case JanusConstants::JANUS_VIDEOROOM_ERROR_NO_SUCH_ROOM:
                    $updateInDb = true;
                    break;
                default:
                    throw $e;
            }
        }*/

        // mark as deleted in db
        if ($updateInDb) {
            $conn->update('text_rooms', ['deleted' => 1], ['id' => $roomId]);
            $conn->update('video_rooms', ['deleted' => 1], ['id' => $roomId]);
        }

        return $this->json($result);
    }

    #[Route('/{roomId}/start', requirements: ['roomId' => '\d+'],  methods: ['PUT'])]
    public function startRoom(
        int $roomId,
        Request $request,
        JanusUserApiService $janusUserApi,
        Connection $conn
    ) : JsonResponse
    {
        $user = $this->getUser();
        $isAdmin = $this->isGranted('ROLE_ADMIN');

        // only creator or admin may start the room
        $sqlParams = ['id' => $roomId, 'user_id' => $user->getId()];
        $sql = 'SELECT * FROM text_rooms WHERE deleted=0 AND id=:id';
        if (!$isAdmin) $sql .= ' AND user_id=:user_id';
        $room = $conn->fetchAssociative($sql, $sqlParams);
        if (!$room) return $this->json(['status' => 404, 'title' => 'Room not found', 'detail' => "Room #$roomId not found"], 404);

        if (!$room['enabled']) return $this->json(['status' => 400, 'title' => 'Room not enabled', 'detail' => "Room #$roomId not enabled"], 400);

        $result = $janusUserApi->createRoom(
            $room['id'],
            $room['description'],
            $room['secret'],
            $room['pin'],
            $room['is_private'],
            $room['history'],
            $room['post'],
            $room['permanent'],
        );

        return $this->json($result);
    }

    #[Route('/{roomId}/stop', requirements: ['roomId' => '\d+'],  methods: ['PUT'])]
    public function stopRoom(
        int $roomId,
        Request $request,
        JanusUserApiService $janusUserApi,
        Connection $conn
    ) : JsonResponse
    {
        $user = $this->getUser();
        $isAdmin = $this->isGranted('ROLE_ADMIN');

        // only creator or admin may stop the room
        $sqlParams = ['id' => $roomId, 'user_id' => $user->getId()];
        $sql = 'SELECT * FROM text_rooms WHERE deleted=0 AND id=:id';
        if (!$isAdmin) $sql .= ' AND user_id=:user_id';
        $room = $conn->fetchAssociative($sql, $sqlParams);
        if (!$room) return $this->json(['status' => 404, 'title' => 'Room not found', 'detail' => "Room #$roomId not found"], 404);

        $result = $janusUserApi->destroyRoom(
            $room['id'],
            $room['secret'],
            $room['permanent'],
        );

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

    protected static function getJanusRoomById($janusRooms, $id) : ?array
    {
        if (!$janusRooms) return null;
        foreach ($janusRooms as $jr) {
            if ($jr['room'] == $id) return $jr;
        }
        return null;
    }

    protected static function getDbVideoRoomById($videoRooms, $id) : ?array
    {
        if (!$videoRooms) return null;
        foreach ($videoRooms as $vr) {
            if ($vr['id'] == $id) return $vr;
        }
        return null;
    }

    protected static function getGoodRoomDataForUpdate(array $data) : array
    {
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
