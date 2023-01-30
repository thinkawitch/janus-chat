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
/*
        $this->createNewSession();
        $this->attachToTextRoom();

        foreach ($rooms as $room) {
            $body = [
                'request' => 'create',
                'admin_key' => $this->textRoomAdminSecret,
                'room' => $room['id'],
                'is_private' => $room['is_private'] === 1,
                'history' => $room['history'],
                'permanent' => $room['permanent'] === 1,
            ];

            if (!empty($room['description'])) $body['description'] = $room['description'];
            if (!empty($room['secret'])) $body['secret'] = $room['secret'];
            if (!empty($room['pin'])) $body['pin'] = $room['pin'];
            if (!empty($room['post'])) $body['post'] = $room['post'];

            $endpoint = $this->sessionId . '/' . $this->textRoomId;
            try {
                $this->makeTextRoomRequest($body, $endpoint);
            } catch (\ErrorException $e) {
                if ($e->getCode() === JanusConstants::JANUS_TEXTROOM_ERROR_ROOM_EXISTS) {
                    // do nothing
                } else {
                    throw $e;
                }
            } catch (\Exception $e) {
                throw $e;
            }
        }

        $this->detachFromTextRoom();
        $this->destroySession();*/
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
        $this->createNewSession();
        $this->attachToTextRoom();

        $body = [
            'request' => 'destroy',
            'admin_key' => $this->textRoomAdminSecret,
            'room' => $id,
            'permanent' => $permanent,
        ];
        if (strlen($secret)) $body['secret'] = $secret;
        $endpoint = $this->sessionId . '/' . $this->textRoomId;
        $result = $this->makeTextRoomRequest($body, $endpoint);

        $this->detachFromTextRoom();
        $this->destroySession();

        return $result;
    }

    private function makeTextRoomRequest(array $body=[], string $endpoint='', string $method='POST')
    {
        $data = [
            'transaction' => $this->getNewTransactionId(),
            'janus' => 'message',
            'body' => $body,
        ];

        $result = $this->makeRequest($data, $endpoint, $method);
        $pluginResult = $result['plugindata']['data'];
        if ($pluginResult['textroom'] === 'error') {
            throw new \ErrorException($pluginResult['error'], $pluginResult['error_code']);
        }

        return $pluginResult;
    }

    private function makeRequest(array $data=[], string $endpoint='', string $method='POST') : array
    {
        $options = [];
        if ($data) {
            $options = ['json' => $data];
        }

        $response = $this->client->request($method, $endpoint, $options);
        $result = $response->toArray();

        if ($result['janus'] === 'error') {
            throw new \ErrorException($result['error']['reason'], $result['error']['code']);
        }

        return $result;
    }

    private function getNewTransactionId() : string
    {
        return uniqid('utr_');
    }
}
