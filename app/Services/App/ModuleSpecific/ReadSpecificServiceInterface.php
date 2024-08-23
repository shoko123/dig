<?php

namespace App\Services\App\ModuleSpecific;

use Illuminate\Database\Eloquent\Builder;

interface ReadSpecificServiceInterface
{
    public function applyCategorizedFilter(array $filters): void;

    public function applyDefaultOrder(): void;

    public function fieldsForTabularPage(): array;

    public function fieldsForGalleryPage(): array;
}
