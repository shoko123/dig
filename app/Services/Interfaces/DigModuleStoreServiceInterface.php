<?php

namespace App\Services\Interfaces;

interface DigModuleStoreServiceInterface
{
    public function create(array $fields): array;
    public function update(array $fields): array;
}
