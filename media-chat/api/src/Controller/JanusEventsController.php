<?php
namespace App\Controller;

use App\Common\JanusConstants;
use Psr\Log\LoggerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Annotation\Route;

class JanusEventsController extends AbstractController
{
    private LoggerInterface $logger;

    public function __construct(LoggerInterface $janusEventsLogger)
    {
        $this->logger = $janusEventsLogger;
    }

    #[Route(path: '/janus-events', format: 'json', methods: ['POST'])]
    public function index(Request $request): JsonResponse
    {
        $serverName = $this->getParameter('app.janus_server_name');
        $data = $request->toArray();
        /*$janusEventsLogger->info('events_start');
        $janusEventsLogger->info(print_r($data, true));
        $janusEventsLogger->info('events_end');*/

        foreach ($data as $row) {
            if ($row['emitter'] !== $serverName) continue;

            switch ($row['type']) {
                case JanusConstants::JANUS_EVENT_TYPE_PLUGIN:
                    if ($row['event']['plugin'] === 'janus.plugin.textroom') {
                        $this->handleTextRoomEvent($row['event']['data']);
                    }
                    break;
                case JanusConstants::JANUS_EVENT_TYPE_CORE:
                    $this->handleCoreEvent($row['event']);
                    break;
            }
        }

        return $this->json(['janus-events' => 1]);
    }

    private function handleCoreEvent(array $event): void
    {
        switch ($event['status']) {
            case 'started':
                $this->logger->info('server_started');
                // connect to server
                // create absent rooms
                break;
            case 'shutdown':
                $this->logger->info('server_shutdown');
                break;
        }
    }

    private function handleTextRoomEvent(array $eventData): void
    {
        $roomId = $eventData['room'];
        switch ($eventData['event']) {
            case 'created':
                $this->logger->info('room_created ' . $roomId);
                break;
            case 'destroyed':
                $this->logger->info('room_destroyed ' . $roomId);
                break;
        }
    }
}

/*
    [1] => Array
        (
            [emitter] => JanusNameMC
            [type] => 64
            [timestamp] => 1653569909323200
            [session_id] => 6459000049568125
            [handle_id] => 7253787784556943
            [event] => Array
                (
                    [plugin] => janus.plugin.textroom
                    [data] => Array
                        (
                            [event] => created
                            [room] => 22
                        )

                )

        )


    [0] => Array
        (
            [emitter] => JanusNameMC
            [type] => 64
            [timestamp] => 1653573276214777
            [session_id] => 1473850788630840
            [handle_id] => 8676992491300337
            [opaque_id] => app-YjEAhHYdVVCd
            [event] => Array
                (
                    [plugin] => janus.plugin.textroom
                    [data] => Array
                        (
                            [event] => join
                            [room] => 1234
                            [username] => user1
                            [display] => User 1
                        )

                )

        )
 */
