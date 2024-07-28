<?php

namespace App\Services\App\ModuleSpecific\Interfaces;

interface ReadSpecificServiceInterface
{
    public function applyBespokeFilters(array $params): void;
    public function applyDefaultOrder(): void;
    public function fieldsForTabularPage(): array;
    public function fieldsForGalleryPage(): array;
}
