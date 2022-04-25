<?php
namespace App\Service;

use Symfony\Contracts\HttpClient\HttpClientInterface;

class JanusAdminApiService
{
    private HttpClientInterface $client;
    private string $adminSecret;
    private ?string $sessionId = null;

    public function __construct(HttpClientInterface $janusAdminClient, string $adminSecret)
    {
        $this->client = $janusAdminClient;
        $this->adminSecret = $adminSecret;
    }

    public function getInfo() : array
    {
        return $this->makeRequest([], 'info', 'GET');
    }

    public function getStatus() : array
    {
        $data = [
            'transaction' => $this->getNewTransactionId(),
            'janus' => 'get_status',
            'admin_secret' => $this->adminSecret,
        ];
        $result = $this->makeRequest($data);
        return $result['status'];
    }

    public function listSessions() : array
    {
        $data = [
            'transaction' => $this->getNewTransactionId(),
            'janus' => 'list_sessions',
            'admin_secret' => $this->adminSecret,
        ];
        $result = $this->makeRequest($data);
        return $result['sessions'];
    }

    public function listHandles(int $sessionId) : array
    {
        $data = [
            'transaction' => $this->getNewTransactionId(),
            'janus' => 'list_handles',
            #'session_id' => $sessionId,
            'admin_secret' => $this->adminSecret,
        ];
        $result = $this->makeRequest($data, $sessionId);
        return $result['handles'];
    }

    public function getHandleInfo(int $sessionId, int $handleId) : array
    {
        $data = [
            'transaction' => $this->getNewTransactionId(),
            'janus' => 'handle_info',
            'admin_secret' => $this->adminSecret,
        ];
        $result = $this->makeRequest($data, $sessionId.'/'.$handleId);
        return $result['info'];
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
        return uniqid('atr_');
    }
}
