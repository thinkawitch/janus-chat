<?php

namespace App\Entity;

use App\Repository\UserRepository;
use Doctrine\ORM\Mapping as ORM;
use Symfony\Bridge\Doctrine\Validator\Constraints\UniqueEntity;
use Symfony\Component\Validator\Constraints as Assert;
use Symfony\Component\Security\Core\User\PasswordAuthenticatedUserInterface;
use Symfony\Component\Security\Core\User\UserInterface;

#[ORM\Entity(repositoryClass: UserRepository::class)]
#[ORM\Table(name: 'users')]
#[ORM\UniqueConstraint(name: 'uniq_username', columns: ['username'])]
#[UniqueEntity('username', message: 'This username is associated with another account')]
class User implements UserInterface, PasswordAuthenticatedUserInterface
{
    const TYPE_ADMIN = 1;
    const TYPE_USER = 2;

    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column(type: 'integer')]
    private ?int $id;

    #[ORM\Column(type: 'datetime')]
    private \DateTime $created;

    #[ORM\Column(type: 'string', length: 180, unique: true)]
    #[Assert\NotBlank]
    #[Assert\Email]
    private ?string $username;

    #[ORM\Column(type: 'string', length: 255)]
    private string $password;

    #[Assert\NotBlank(groups: ['registration'])]
    private ?string $plainPassword;

    #[ORM\Column(type: 'smallint')]
    #[Assert\NotBlank]
    #[Assert\Choice(choices: [self::TYPE_ADMIN, self::TYPE_USER])]
    private int $type;

    #[ORM\Column(type: 'boolean')]
    private bool $disabled = false;

    public function __construct()
    {
        $this->created = new \DateTime();
    }

    public function getId(): ?int
    {
        return $this->id;
    }

    public function getCreated(): \DateTime
    {
        return $this->created;
    }

    public function getUsername(): ?string
    {
        return $this->username;
    }

    public function setUsername(string $username)
    {
        $this->username = $username;
    }

    public function getType(): int
    {
        return $this->type;
    }

    public function setType(int $type): void
    {
        $this->type = $type;
    }

    public function isDisabled(): bool
    {
        return $this->disabled;
    }

    public function setDisabled(bool $disabled): void
    {
        $this->disabled = $disabled;
    }



    /**
     * A visual identifier that represents this user.
     *
     * @see UserInterface
     */
    public function getUserIdentifier(): string
    {
        return (string) $this->username;
    }

    /**
     * @see UserInterface
     */
    public function getRoles(): array
    {
        return match ($this->type) {
            self::TYPE_ADMIN => ['ROLE_USER', 'ROLE_ADMIN'],
            self::TYPE_USER => ['ROLE_USER'],
            default => throw new \Exception('Unknown user type'),
        };
    }

    /**
     * @see PasswordAuthenticatedUserInterface
     */
    public function getPassword(): string
    {
        return $this->password;
    }

    public function setPassword(string $password)
    {
        $this->password = $password;
    }

    public function getPlainPassword(): string
    {
        return $this->plainPassword;
    }

    public function setPlainPassword(string $plainPassword): void
    {
        $this->plainPassword = $plainPassword;
    }

    /**
     * @see UserInterface
     */
    public function eraseCredentials()
    {
        // If you store any temporary, sensitive data on the user, clear it here
        $this->plainPassword = null;
    }
}
