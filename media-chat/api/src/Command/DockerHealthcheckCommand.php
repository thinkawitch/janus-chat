<?php

namespace App\Command;

use Doctrine\DBAL\Connection;
use Symfony\Component\Console\Attribute\AsCommand;
use Symfony\Component\Console\Command\Command;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Output\OutputInterface;

#[AsCommand(
    name: 'app:docker-healthcheck',
    description: 'Healthcheck for docker container',
)]
class DockerHealthcheckCommand extends Command
{
    private Connection $conn;

    protected function configure(): void
    {
        //
    }

    public function __construct(Connection $conn)
    {
        $this->conn = $conn;
        parent::__construct();
    }

    protected function execute(InputInterface $input, OutputInterface $output): int
    {
        try {
            $this->conn->fetchAllAssociative('SELECT * FROM text_rooms WHERE id=1234');
        } catch (\Exception $e) {
            $output->writeln($e->getMessage());
            $output->writeln('Check failure.');
            return Command::FAILURE;
        }
        $output->writeln('Check done.');
        return Command::SUCCESS;
    }
}
