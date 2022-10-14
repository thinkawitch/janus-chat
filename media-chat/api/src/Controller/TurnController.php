<?php

namespace App\Controller;

use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\Routing\Annotation\Route;

class TurnController extends AbstractController
{
    #[Route(path: '/ask-turn', format: 'json')]
    public function index() : JsonResponse
    {
        // var baseUrl = 'https://webrtc.tools/api/gISDefault.aspx?ChatGuid=' + ChatGuid + '&UserGuid=' + UserGuid;
        // can't use provided TURN server

        return $this->json(['ask-turn' => 1]);
    }
}
