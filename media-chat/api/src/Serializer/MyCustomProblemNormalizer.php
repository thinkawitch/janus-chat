<?php
namespace App\Serializer;

use Symfony\Component\ErrorHandler\Exception\FlattenException;
use Symfony\Component\Serializer\Normalizer\NormalizerInterface;

class MyCustomProblemNormalizer implements NormalizerInterface
{
    public function normalize(mixed $object, string $format = null, array $context = []) : array|string|int|float|bool|\ArrayObject|null
    {
        if (!$object instanceof FlattenException) {
            throw new \Exception(sprintf('The object must implement "%s".', FlattenException::class));
        }

        return [
            'content' => 'This is my custom problem normalizer.',
            'exception'=> [
                'message' => $object->getMessage(),
                'code' => $object->getStatusCode(),
            ],
        ];
    }

    public function supportsNormalization(mixed $data, string $format = null, array $context = []) : bool
    {
        return false; //turn off
        return $data instanceof FlattenException;
    }

    public function getSupportedTypes(?string $format): array
    {
        return ['*' => null]; //supports nothing
    }
}
