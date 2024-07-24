<?php

namespace App\Services\Interfaces;

interface DigModuleReadServiceInterface
{
    public function index(array $query): array;
    public function page(array $ids, string $view): array;
    public function show(string $id): array;
    public function show_carousel(string $module, string $id): array;
}
