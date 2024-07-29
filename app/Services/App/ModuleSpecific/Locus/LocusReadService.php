<?php

namespace App\Services\App\ModuleSpecific\Locus;

use App\Services\App\ReadService;
use App\Services\App\ModuleSpecific\AInterfaces\ReadSpecificServiceInterface;

class LocusReadService extends ReadService implements ReadSpecificServiceInterface
{
    function __construct()
    {
        parent::__construct('Locus');
    }

    public function applyBespokeFilters(array $bespoke_filter): void
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
        return ["id", "oc_label", "category", "square", "published_date"];
    }

    public function fieldsForGalleryPage(): array
    {
        return ['id', 'oc_label'];
    }
}
