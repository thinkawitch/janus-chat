<?php

namespace App\Command;

use App\Service\JanusUserApiService;
use Doctrine\DBAL\Connection;
use Symfony\Component\Console\Attribute\AsCommand;
use Symfony\Component\Console\Command\Command;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Output\OutputInterface;

#[AsCommand(
    name: 'app:docker-started',
    description: 'Some logic when docker container just started',
)]
class DockerStartedCommand extends Command
{
    private JanusUserApiService $janusUserApi;
    private Connection $conn;

    protected function configure(): void
    {
        //
    }

    public function __construct(JanusUserApiService $janusUserApi, Connection $conn)
    {
        $this->janusUserApi = $janusUserApi;
        $this->conn = $conn;
        parent::__construct();
        // for future checks when container started
    }

    protected function execute(InputInterface $input, OutputInterface $output): int
    {


        return Command::SUCCESS;
    }
}
