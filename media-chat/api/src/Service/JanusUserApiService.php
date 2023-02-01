<?php
namespace App\Service;

use Thinkawitch\JanusApi\JanusConstants;
use Thinkawitch\JanusApi\JanusException;
use Thinkawitch\JanusApi\Plugin\JanusHttpTextRoomClient;
use Thinkawitch\JanusApi\Plugin\JanusHttpVideoRoomClient;

class JanusUserApiService
{
    protected JanusHttpTextRoomClient $textRoomClient;
    protected JanusHttpVideoRoomClient $videoRoomClient;

    protected bool $useTextRooms;
    protected bool $useVideoRooms;

    public function __construct(
        bool $useTextRooms,
        bool $useVideoRooms,
        JanusHttpTextRoomClient $textRoomClient,
        JanusHttpVideoRoomClient $videoRoomClient,
    )
    {
        $this->useTextRooms = $useTextRooms;
        $this->useVideoRooms = $useVideoRooms;
        $this->textRoomClient = $textRoomClient;
        $this->videoRoomClient = $videoRoomClient;
    }

    public function OLD_getInfo() : array
    {
        $result = $this->makeRequest([], 'info', 'GET');
        return $result;
    }

    public function getRooms(bool $includePrivate = false) : array
    {
        $rooms = null;

        if ($this->useTextRooms) {
            $this->textRoomClient->createSession();
            $this->textRoomClient->attachToTextRoomPlugin();
            $rooms = $this->textRoomClient->getRooms($includePrivate);
            $this->textRoomClient->detachFromTextRoomPlugin();
            $this->textRoomClient->destroySession();
        }

        if ($this->useVideoRooms) {

        }

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

        if ($this->useTextRooms) {
            $this->textRoomClient->createSession();
            $this->textRoomClient->attachToTextRoomPlugin();

            $result = $this->textRoomClient->createRoom($id, $description, $secret, $pin, $isPrivate, $history, $post, $permanent);

            $this->textRoomClient->detachFromTextRoomPlugin();
            $this->textRoomClient->destroySession();
        }

        return $result;
    }

    public function createRoomsIgnoreExisting(array $rooms): void
    {
        if ($this->useTextRooms) {
            $this->textRoomClient->createSession();
            $this->textRoomClient->attachToTextRoomPlugin();

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
                    $this->textRoomClient->createRoom(...$args);
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

            $this->textRoomClient->detachFromTextRoomPlugin();
            $this->textRoomClient->destroySession();
        }
    }

    public function editRoom(int $id, ?string $secret, array $newRoom) : array
    {
        $result = null;

        if ($this->useTextRooms) {
            $this->textRoomClient->createSession();
            $this->textRoomClient->attachToTextRoomPlugin();

            $result = $this->textRoomClient->editRoom($id, $secret, $newRoom);

            $this->textRoomClient->detachFromTextRoomPlugin();
            $this->textRoomClient->destroySession();
        }

        return $result;
    }

    public function destroyRoom(int $id, string $secret=null, bool $permanent=false) : array
    {
        $result = null;

        if ($this->useTextRooms) {
            $this->textRoomClient->createSession();
            $this->textRoomClient->attachToTextRoomPlugin();

            $result = $this->textRoomClient->destroyRoom($id, $secret, $permanent);

            $this->textRoomClient->detachFromTextRoomPlugin();
            $this->textRoomClient->destroySession();
        }

        return $result;
    }
}
