<?php

namespace App\Services\App\ModuleSpecific\Stone;

use App\Services\App\ModuleSpecific\ReadSpecificServiceInterface;
use App\Services\App\ReadService;

class StoneReadService extends ReadService implements ReadSpecificServiceInterface
{
    public function __construct()
    {
        parent::__construct('Stone');
    }

    public function applyBespokeFilters(array $bespoke_filter): void
    {
        foreach ($bespoke_filter as $key => $item) {
            // $this->builder->applyFilter();
        }
    }

    public function applyDefaultOrder(): void
    {
        $this->builder->orderBy('id_year', 'asc')->orderBy('id_object_no', 'asc');
    }

    public function fieldsForTabularPage(): array
    {
        return ['id', 'context', 'excavation_date', 'cataloger_description', 'conservation_notes'];
    }

    public function fieldsForGalleryPage(): array
    {
        return ['id', 'cataloger_description'];
    }
}
