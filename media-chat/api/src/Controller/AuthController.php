<?php

namespace App\Controller;

use App\Entity\User;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Component\Security\Http\Attribute\CurrentUser;

#[Route('/auth', format:'json')]
class AuthController extends AbstractController
{
    #[Route('/login', name: 'app_login', methods: ['POST'])]
    public function index(#[CurrentUser] ?User $user): JsonResponse
    {
        if (null === $user) {
            return $this->json([
                'message' => 'Missing credentials',
            ], Response::HTTP_UNAUTHORIZED);
        }

        //$token = '_some_token_';

        return $this->json([
            'id' => $user->getId(),
            'username' => $user->getUsername(),
        ]);
    }

    #[Route('/logout', name: 'app_logout', methods: ['GET'])]
    public function logout(): void
    {
        throw new \Exception('Logout: should not run this');
    }

    #[Route('/is_logged_out', name: 'app_is_logged_out', methods: ['GET'])]
    public function isLoggedOut(#[CurrentUser] ?User $user): JsonResponse
    {
        if (null === $user) {
            return $this->json([
                'is_logged_out' => true,
            ], Response::HTTP_UNAUTHORIZED);
        }

        return $this->json([
            'is_logged_out' => false,
        ]);
    }
}
