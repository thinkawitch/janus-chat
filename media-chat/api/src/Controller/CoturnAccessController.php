<?php
namespace App\Controller;

use Psr\Log\LoggerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Annotation\Route;

// https://datatracker.ietf.org/doc/html/draft-uberti-behave-turn-rest-00

class CoturnAccessController extends AbstractController
{
    private LoggerInterface $logger;

    public function __construct(
        LoggerInterface $coturnAccessLogger
    )
    {
        $this->logger = $coturnAccessLogger;
    }

    #[Route(path: '/coturn-access', methods: ['GET', 'POST'], format: 'json')]
    public function index(Request $request): JsonResponse
    {
        $coturnDomain = $this->getParameter('app.coturn_domain');
        $coturnSecret = $this->getParameter('app.coturn_static_auth_secret');

        $paramKey = $request->get('key'); // turn_rest_api_key
        $paramService = $request->get('service');;
        $paramUsername = $request->get('username');

        //$paramsGet = $request->query->all();
        //$paramsPost = $request->request->all();
        //$this->logger->info('request_start');
        //$this->logger->info('get:' . print_r($paramsGet, true));
        //$this->logger->info('post:' . print_r($paramsPost, true));

        $ttl = 86400;
        $username = (time() + $ttl) . ':' . $paramUsername;
        $credential = self::createHash($username, $coturnSecret);

        $result = [
            'username' => $username,
            'password' => $credential,
            'ttl' => $ttl,
            'uris' => []
        ];

        if ($paramService === 'stun') {
            $result['uris'][] = "stun:stun.$coturnDomain:3478";
        }

        if ($paramService === 'turn') {
            $result['uris'][] = "turns:turn.$coturnDomain:5349?transport=tcp"; // firefox doesnt like turns, not sure
            //$result['uris'][] = "turn:turn.$coturnDomain:5349?transport=tcp";
        }

        $this->logger->info(print_r($result, true));
        //$this->logger->info('request_end');

        return $this->json($result);
    }

    private static function createHash($payload, $secret) : string
    {
        // echo -n 1622564905 | openssl dgst -binary -sha1 -hmac <your_secret_key> | openssl base64
        $hash = hash_hmac('sha1', $payload, $secret, true);
        return base64_encode($hash);
    }

}

