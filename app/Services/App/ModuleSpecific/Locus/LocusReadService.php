<?php

namespace App\Services\App\ModuleSpecific\Locus;

use App\Services\App\ModuleSpecific\ReadSpecificServiceInterface;
use App\Services\App\ReadService;

class LocusReadService extends ReadService implements ReadSpecificServiceInterface
{
    public function __construct()
    {
        parent::__construct('Locus');
    }

    public function applyCategorizedFilter(array $bespoke_filter): void
    {
        foreach ($bespoke_filter as $key => $item) {
            // $this->builder->applyFilter();
        }
    }

    public function applyDefaultOrder(): void
    {
        $this->builder->orderBy('id', 'asc');
    }

    public function fieldsForTabularPage(): array
    {
        return ['id', 'oc_label', 'category', 'square', 'published_date'];
    }

    public function fieldsForGalleryPage(): array
    {
        return ['id', 'oc_label'];
    }
}
