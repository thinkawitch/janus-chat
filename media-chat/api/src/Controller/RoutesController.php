<?php

namespace App\Controller;

use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Component\Routing\RouterInterface;

class RoutesController extends AbstractController
{
    #[Route(path: '/routes', format: 'json')]
    public function index(RouterInterface $router) : JsonResponse
    {
        $list = [];
        foreach ($router->getRouteCollection()->all() as $route) {
            $item = [
                'path' => $route->getPath(),
            ];
            if (!empty($route->getMethods())) {
                $item['method'] = $route->getMethods();
            }

            $list[] = $item;
        }
        return $this->json($list);
    }
}
