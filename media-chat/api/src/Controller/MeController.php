<?php

namespace App\Controller;

use App\Common\ApiConstants;
use App\Entity\User;
use App\Repository\UserRepository;
use Doctrine\DBAL\Connection;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\PasswordHasher\Hasher\UserPasswordHasherInterface;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Component\Security\Http\Attribute\CurrentUser;

#[Route('/me', format:'json')]
class MeController extends AbstractController
{
    #[Route('', name: 'app_me', methods: ['GET'])]
    public function me(#[CurrentUser] ?User $user): JsonResponse
    {

        $sleep = !empty($_GET['sleep']) ? intval($_GET['sleep']) : 0;
        if ($sleep > 0) sleep($sleep);

        if (null === $user) {
            return $this->json([
                'is_logged_out' => true,
            ], Response::HTTP_UNAUTHORIZED);
        }

        return $this->json([
            'id' => $user->getId(),
            'username' => $user->getUsername(),
        ]);
    }

    #[Route('/password', name: 'app_me_password', methods: ['PUT'])]
    public function updatePassword(
        #[CurrentUser] User $user,
        Request $request,
        UserPasswordHasherInterface $passwordHasher,
        UserRepository $userRepository,
        Connection $conn
    ): JsonResponse
    {

        $data = $request->toArray();
        $fields = ['current_password', 'new_password', 'confirm_new'];
        $absent = [];
        foreach ($fields as $f) {
            if (empty($data[$f])) $absent[] = $f;
        }
        if (count($absent) > 0) {
            $detail = 'Empty values for [' . implode( ', ', $absent) . ']';
            return $this->json(['me' => 1, 'status' => 400, 'title' => 'Empty parameters', 'detail' => $detail], 400);
        }

        if (!$passwordHasher->isPasswordValid($user, $data['current_password'])) {
            return $this->json(['me' => 1, 'status' => 400, 'title' => 'Incorrect password', 'detail' => 'Current password is incorrect'], 400);
        }

        if ($data['new_password'] !== $data['confirm_new']) {
            return $this->json(['me' => 1, 'status' => 400, 'title' => 'Incorrect confirmation', 'detail' => 'New password confirmation is incorrect'], 400);
        }

        $user->setPlainPassword($data['new_password']);
        $userRepository->add($user, true);

        $conn->insert('users_log', [
            'user_id' => $user->getId(),
            'date' => date('Y-m-d H:i:s'),
            'type' => ApiConstants::UL_UPDATE_PASSWORD,
        ]);

        return $this->json([
            'me' => 1,
        ]);
    }
}
