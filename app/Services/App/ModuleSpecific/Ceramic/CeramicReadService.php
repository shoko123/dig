<?php

namespace App\Services\App\ModuleSpecific\Ceramic;

use App\Services\App\ReadService;
use App\Services\App\ModuleSpecific\Interfaces\ReadSpecificServiceInterface;

class CeramicReadService extends ReadService implements ReadSpecificServiceInterface
{
    function __construct()
    {
        parent::__construct('Ceramic');
    }

    public function applyBespokeFilters(array $bespoke_filters): void
    {
        foreach ($bespoke_filters as $key => $item) {
            // $this->builder->applyFilter();
        }
    }

    public function applyDefaultOrder(): void
    {
        $this->builder->orderBy('id_year', 'asc')->orderBy('id_object_no', 'asc');
    }

    public function fieldsForTabularPage(): array
    {
        return ["id", "field_description", "specialist_description", "notes"];
    }

    public function fieldsForGalleryPage(): array
    {
        return ['id', 'specialist_description'];
    }
}
