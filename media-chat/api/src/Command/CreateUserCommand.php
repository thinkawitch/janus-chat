<?php

namespace App\Command;

use App\Repository\UserRepository;
use App\Entity\User;
use Symfony\Component\Console\Attribute\AsCommand;
use Symfony\Component\Console\Command\Command;
use Symfony\Component\Console\Helper\QuestionHelper;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Output\OutputInterface;
use Symfony\Component\Console\Question\ChoiceQuestion;
use Symfony\Component\Console\Question\Question;
use Symfony\Component\Console\Style\SymfonyStyle;
use Symfony\Component\Validator\ConstraintViolation;
use Symfony\Component\Validator\Validator\ValidatorInterface;

#[AsCommand(
    name: 'app:create-user',
    description: 'Create new user',
)]
class CreateUserCommand extends Command
{
    private UserRepository $repository;
    private ValidatorInterface $validator;

    protected function configure(): void
    {
        //
    }

    public function __construct(UserRepository $repository, ValidatorInterface $validator)
    {
        $this->repository = $repository;
        $this->validator = $validator;
        parent::__construct();
    }

    protected function execute(InputInterface $input, OutputInterface $output): int
    {
        $io = new SymfonyStyle($input, $output);
        /** @var QuestionHelper $helper */
        $helper = $this->getHelper('question');
        $question = new Question('Username (email): ');
        $username = (string) $helper->ask($input, $output, $question);

        $question = new Question('Password: ');
        $password = (string) $helper->ask($input, $output, $question);

        $choices = [User::TYPE_ADMIN => 'Admin', User::TYPE_USER => 'User'];
        $defaultChoice = User::TYPE_ADMIN;
        $question = new ChoiceQuestion('User Type [<comment>'.$defaultChoice.'</comment>]: ', $choices, $defaultChoice);
        $typeValue = $helper->ask($input, $output, $question);
        $flipLabelToId = array_flip($choices);
        $type = $flipLabelToId[$typeValue] ?? $defaultChoice;

        $user = new User();
        $user->setUsername($username);
        $user->setPlainPassword($password);
        $user->setType($type);

        $errors = $this->validator->validate($user, null, ['Default', 'registration']);
        if (count($errors) > 0) {
            /** @var ConstraintViolation $cv */
            foreach ($errors as $cv) {
                $field = $cv->getPropertyPath();
                if ($field === 'plainPassword') $field = 'password';
                $io->warning($field . ': ' . $cv->getMessage());
            }
            return Command::INVALID;
        }

        try {
            $this->repository->add($user, true);
            $io->success('User created [' . $username .']');
        } catch (\Exception $e) {
            $io->error($e->getMessage());
            return Command::FAILURE;
        }

        return Command::SUCCESS;
    }
}
