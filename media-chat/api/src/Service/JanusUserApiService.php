<?php
namespace App\Service;

use Symfony\Contracts\HttpClient\HttpClientInterface;

class JanusUserApiService
{
    private HttpClientInterface $client;
    private string $textRoomAdminSecret;
    private ?string $sessionId = null;
    private ?string $textRoomId = null;

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

    public function getRooms() : array
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

        if (strlen($description)) $body['description'] = $description;
        if (strlen($secret)) $body['secret'] = $secret;
        if (strlen($pin)) $body['pin'] = $pin;
        if (strlen($post)) $body['post'] = $post;

        $endpoint = $this->sessionId . '/' . $this->textRoomId;
        $result = $this->makeTextRoomRequest($body, $endpoint);

        $this->detachFromTextRoom();
        $this->destroySession();

        return $result;
    }

    public function destroyRoom(int $id, bool $permanent=false) : array
    {
        $this->createNewSession();
        $this->attachToTextRoom();

        $body = [
            'request' => 'destroy',
            'admin_key' => $this->textRoomAdminSecret,
            'room' => $id,
            'permanent' => $permanent,
        ];
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
