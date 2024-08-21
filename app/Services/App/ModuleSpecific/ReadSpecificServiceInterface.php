<?php

namespace App\Services\App\ModuleSpecific;

use Illuminate\Database\Eloquent\Builder;

interface ReadSpecificServiceInterface
{
    public function applyBespokeFilter(array $filters): void;

    public function applyDefaultOrder(): void;

    public function fieldsForTabularPage(): array;

    public function fieldsForGalleryPage(): array;
}
