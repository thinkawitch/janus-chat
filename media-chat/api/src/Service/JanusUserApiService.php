<?php
namespace App\Service;

use App\Common\JanusConstants;
use Symfony\Contracts\HttpClient\HttpClientInterface;

class JanusUserApiService
{
    private HttpClientInterface $client;
    private string $textRoomAdminSecret;
    private ?string $sessionId = null; # session handler
    private ?string $textRoomId = null; # textroom plugin handler

    public function __construct(HttpClientInterface $janusUserClient, string $textRoomAdminSecret)
    {
        $this->client = $janusUserClient;
        $this->textRoomAdminSecret = $textRoomAdminSecret;
    }

    public function getInfo() : array
    {
        $result = $this->makeRequest([], 'info', 'GET');
        return $result;
    }

    private function createNewSession() : void
    {
        $data = [
            'transaction' => $this->getNewTransactionId(),
            'janus' => 'create',
        ];
        $result = $this->makeRequest($data);
        $this->sessionId = $result['data']['id'];
    }

    private function destroySession() : void
    {
        $data = [
            'transaction' => $this->getNewTransactionId(),
            'janus' => 'destroy',
        ];
        $result = $this->makeRequest($data, $this->sessionId);
        $this->sessionId = null;
    }

    private function attachToTextRoom() : void
    {
        $data = [
            'transaction' => $this->getNewTransactionId(),
            'janus' => 'attach',
            'plugin' => 'janus.plugin.textroom',
        ];
        $result = $this->makeRequest($data, $this->sessionId);
        $this->textRoomId = $result['data']['id'];
    }

    private function detachFromTextRoom() : void
    {
        $data = [
            'transaction' => $this->getNewTransactionId(),
            'janus' => 'detach',
        ];
        $endpoint = $this->sessionId . '/' . $this->textRoomId;
        $result = $this->makeRequest($data, $endpoint);
        $this->textRoomId = null;
    }

    public function getRooms(bool $includePrivate = false) : array
    {
        $this->createNewSession();
        $this->attachToTextRoom();

        $data = [
            'transaction' => $this->getNewTransactionId(),
            'janus' => 'message',
            'body' => [
                'request' => 'list',
            ],
        ];
        if ($includePrivate) {
            $data['body']['admin_key'] = $this->textRoomAdminSecret;
        }
        $endpoint = $this->sessionId . '/' . $this->textRoomId;
        $result = $this->makeRequest($data, $endpoint);

        $rooms = $result['plugindata']['data']['list'];

        $this->detachFromTextRoom();
        $this->destroySession();

        return $rooms;
    }

    public function createRoom(
        int $id,
        ?string $description=null,
        ?string $secret=null,
        ?string $pin=null,
        bool $private=true,
        int $history=0,
        ?string $post=null,
        bool $permanent=false,
    ) : array
    {
        $this->createNewSession();
        $this->attachToTextRoom();

        $body = [
            'request' => 'create',
            'admin_key' => $this->textRoomAdminSecret,
            'room' => $id,
            'is_private' => $private,
            'history' => $history,
            'permanent' => $permanent,
        ];

        if (!empty($description)) $body['description'] = $description;
        if (!empty($secret)) $body['secret'] = $secret;
        if (!empty($pin)) $body['pin'] = $pin;
        if (!empty($post)) $body['post'] = $post;

        $endpoint = $this->sessionId . '/' . $this->textRoomId;
        $result = $this->makeTextRoomRequest($body, $endpoint);

        $this->detachFromTextRoom();
        $this->destroySession();

        return $result;
    }

    public function createRoomsIgnoreExisting(array $rooms): void
    {
        $this->createNewSession();
        $this->attachToTextRoom();

        foreach ($rooms as $room) {
            $body = [
                'request' => 'create',
                'admin_key' => $this->textRoomAdminSecret,
                'room' => $room['id'],
                'is_private' => $room['private'] === 1,
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
        $this->destroySession();
    }

    public function updateRoom(int $roomId, ?string $secret, array $newRoom) : array
    {
        $this->createNewSession();
        $this->attachToTextRoom();

        $body = [
            'request' => 'edit',
            'admin_key' => $this->textRoomAdminSecret,
            'room' => $roomId,
            'permanent' => false,
        ];

        if (!empty($secret)) $body['secret'] = $secret;
        if (!empty($newRoom['secret'])) $body['new_secret'] = $newRoom['secret'];
        //$body['secret'] = 's';
//        if (array_key_exists('secret', $newRoom)) {
//            $body['new_secret'] = $newRoom['secret'];
//        }

        if (!empty($newRoom['description'])) $body['new_description'] = $newRoom['description'];
        if (!empty($newRoom['pin'])) $body['new_pin'] = $newRoom['pin'];
        if (!empty($newRoom['post'])) $body['new_post'] = $newRoom['post'];
        if (isset($newRoom['number'])) $body['new_number'] = $newRoom['number'];
//        dd($body);
        $endpoint = $this->sessionId . '/' . $this->textRoomId;
        $result = $this->makeTextRoomRequest($body, $endpoint);

        $this->detachFromTextRoom();
        $this->destroySession();

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
