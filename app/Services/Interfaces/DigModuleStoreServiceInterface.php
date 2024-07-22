<?php

namespace App\Services\Interfaces;

interface DigModuleStoreServiceInterface
{
    public function store(array $new_item, bool $methodIsPost): array;
}
