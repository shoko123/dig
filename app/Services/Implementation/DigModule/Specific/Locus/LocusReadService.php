<?php

namespace App\Services\Implementation\DigModule\Specific\Locus;

use App\Services\Implementation\DigModule\DigModuleReadService;
use App\Services\Interfaces\DigModuleReadSpecificServiceInterface;

class LocusReadService extends DigModuleReadService implements DigModuleReadSpecificServiceInterface
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
