<?php

namespace App\Services\Interfaces;

interface DigModuleReadSpecificServiceInterface
{
    public function applyBespokeFilters(array $params): void;
    public function applyDefaulOrder(): void;
    public function fieldsForTabularPage(): array;
    public function fieldsForGalleryPage(): array;
}
