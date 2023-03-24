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
        // common props
        int $id,
        ?string $description=null,
        ?string $secret=null,
        ?string $pin=null,
        bool $isPrivate=true,
        bool $permanent=false,
        // text room
        int $history=0,
        ?string $post=null,
        // video room
    ) : array
    {
        $textRoomCreated = true;
        $videoRoomCreated = true;

        $this->janusClient->createSession();

        $allowed = null;
        $extra = [];

        if ($this->useTextRooms) {
            $textRoomPlugin = $this->janusClient->attachToTextRoomPlugin($this->textRoomAdminKey);
            try {
                $textRoomPlugin->createRoom($id, $description, $secret, $pin, $isPrivate, $history, $post, $permanent);
            } catch (JanusException $e) {
                $textRoomCreated = false;
                if ($e->getCode() === JanusConstants::JANUS_TEXTROOM_ERROR_ROOM_EXISTS) {
                    $textRoomCreated = true; // count existing room as good one
                } else {
                    throw $e;
                }
            } catch (\Exception $e) {
                throw $e;
            }
            $textRoomPlugin->detach();
        }

        if ($this->useVideoRooms) {
            $videoRoomPlugin = $this->janusClient->attachToVideoRoomPlugin($this->videoRoomAdminKey);
            try {
                $videoRoomPlugin->createRoom($id, $description, $secret, $pin, $isPrivate, $permanent, $allowed, $extra);
            } catch (JanusException $e) {
                $videoRoomCreated = false;
                if ($e->getCode() === JanusConstants::JANUS_VIDEOROOM_ERROR_ROOM_EXISTS) {
                    $videoRoomCreated = true; // count existing room as good one
                } else {
                    throw $e;
                }
            } catch (\Exception $e) {
                throw $e;
            }

            $videoRoomPlugin->detach();
        }

        $this->janusClient->destroySession();
        return [$textRoomCreated, $videoRoomCreated];
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

        if ($this->useVideoRooms) {
            $videoRoomPlugin = $this->janusClient->attachToVideoRoomPlugin($this->videoRoomAdminKey);
        }

        $this->janusClient->destroySession();
        return $result;
    }

    public function destroyRoom(int $id, string $secret=null, bool $permanent=false) : array
    {
        // destroy without errors, it is not an error if room doesn't exist
        // true - means there were no errors
        $textRoomDestroyed = true;
        $videoRoomDestroyed = true;
        $this->janusClient->createSession();

        if ($this->useTextRooms) {
            $textRoomPlugin = $this->janusClient->attachToTextRoomPlugin($this->textRoomAdminKey);
            try {
                $textRoomPlugin->destroyRoom($id, $secret, $permanent);
            } catch (JanusException $e) {
                $textRoomDestroyed = false;
                if ($e->getCode() === JanusConstants::JANUS_TEXTROOM_ERROR_NO_SUCH_ROOM) {
                    $textRoomDestroyed = true;
                } else {
                    throw $e;
                }
            } catch (\Exception $e) {
                throw $e;
            }
            $textRoomPlugin->detach();
        }

        if ($this->useVideoRooms) {
            $videoRoomPlugin = $this->janusClient->attachToVideoRoomPlugin($this->videoRoomAdminKey);
            try {
                $videoRoomPlugin->destroyRoom($id, $secret, $permanent);
            } catch (JanusException $e) {
                $videoRoomDestroyed = false;
                if ($e->getCode() === JanusConstants::JANUS_VIDEOROOM_ERROR_NO_SUCH_ROOM) {
                    $videoRoomDestroyed = true;
                } else {
                    throw $e;
                }
            } catch (\Exception $e) {
                throw $e;
            }
            $videoRoomPlugin->detach();
        }

        $this->janusClient->destroySession();

        return [$textRoomDestroyed, $videoRoomDestroyed];
    }
}
