<?php
namespace App\Service;

use Thinkawitch\JanusApi\JanusConstants;
use Thinkawitch\JanusApi\JanusException;
use Thinkawitch\JanusApi\JanusHttpClient;

class JanusUserApiService
{
    protected JanusHttpClient $janusClient;

    protected bool $useTextRooms;
    protected bool $useVideoRooms;

    protected string $textRoomAdminKey;
    protected string $videoRoomAdminKey;

    public function __construct(
        JanusHttpClient $janusClient,
        bool $useTextRooms,
        bool $useVideoRooms,
        string $textRoomAdminKey,
        string $videoRoomAdminKey,
    )
    {
        $this->janusClient = $janusClient;
        $this->useTextRooms = $useTextRooms;
        $this->useVideoRooms = $useVideoRooms;
        $this->textRoomAdminKey = $textRoomAdminKey;
        $this->videoRoomAdminKey = $videoRoomAdminKey;
    }

    public function OLD_getInfo() : array
    {
        $result = $this->makeRequest([], 'info', 'GET');
        return $result;
    }

    public function getRooms(bool $includePrivate = false) : array
    {
        $rooms = [];
        $this->janusClient->createSession();

        if ($this->useTextRooms) {
            $textRoomPlugin = $this->janusClient->attachToTextRoomPlugin($this->textRoomAdminKey);
            $textRooms = $textRoomPlugin->getRooms($includePrivate);
            $textRoomPlugin->detach();
            foreach ($textRooms as $tr) {
                $tr['room_type'] = 'text';
                $rooms[] = $tr;
            }
        }

        if ($this->useVideoRooms) {
            $videoRoomPlugin = $this->janusClient->attachToVideoRoomPlugin($this->videoRoomAdminKey);
            $videoRooms = $videoRoomPlugin->getRooms($includePrivate);
            $videoRoomPlugin->detach();
            foreach ($videoRooms as $vr) {
                $vr['room_type'] = 'video';
                $rooms[] = $vr;
            }
        }

        $this->janusClient->destroySession();
        return $rooms;
    }

    public function createRoom(
        int $id,
        ?string $description=null,
        ?string $secret=null,
        ?string $pin=null,
        bool $isPrivate=true,
        int $history=0,
        ?string $post=null,
        bool $permanent=false,
    ) : array
    {
        $result = null;
        $this->janusClient->createSession();

        if ($this->useTextRooms) {
            $textRoomPlugin = $this->janusClient->attachToTextRoomPlugin($this->textRoomAdminKey);
            $result = $textRoomPlugin->createRoom($id, $description, $secret, $pin, $isPrivate, $history, $post, $permanent);
            $textRoomPlugin->detach();
        }

        if ($this->useVideoRooms) {

        }

        $this->janusClient->destroySession();
        return $result;
    }

    public function createRoomsIgnoreExisting(array $rooms): void
    {
        $this->janusClient->createSession();

        if ($this->useTextRooms) {
            $textRoomPlugin = $this->janusClient->attachToTextRoomPlugin($this->textRoomAdminKey);
            foreach ($rooms as $room) {
                try {
                    $args = [
                        'id' => $room['id'],
                        'description' => $room['description'],
                        'secret' => $room['secret'],
                        'pin' => $room['pin'],
                        'isPrivate' => boolval($room['is_private']),
                        'history' => $room['history'],
                        'post' => $room['post'],
                        'permanent' => boolval($room['permanent']),
                    ];
                    $textRoomPlugin->createRoom(...$args);
                } catch (JanusException $e) {
                    if ($e->getCode() === JanusConstants::JANUS_TEXTROOM_ERROR_ROOM_EXISTS) {
                        // do nothing
                    } else {
                        throw $e;
                    }
                } catch (\Exception $e) {
                    throw $e;
                }
            }
            $textRoomPlugin->detach();
        }

        $this->janusClient->destroySession();
    }

    public function editRoom(int $id, ?string $secret, array $newRoom) : array
    {
        $result = null;
        $this->janusClient->createSession();

        if ($this->useTextRooms) {
            $textRoomPlugin = $this->janusClient->attachToTextRoomPlugin($this->textRoomAdminKey);
            $result = $textRoomPlugin->editRoom($id, $secret, $newRoom);
            $textRoomPlugin->detach();
        }

        $this->janusClient->destroySession();
        return $result;
    }

    public function destroyRoom(int $id, string $secret=null, bool $permanent=false) : array
    {
        $result = null;
        $this->janusClient->createSession();

        if ($this->useTextRooms) {
            $textRoomPlugin = $this->janusClient->attachToTextRoomPlugin($this->textRoomAdminKey);
            $result = $textRoomPlugin->destroyRoom($id, $secret, $permanent);
            $textRoomPlugin->detach();
        }

        $this->janusClient->destroySession();
        return $result;
    }
}
