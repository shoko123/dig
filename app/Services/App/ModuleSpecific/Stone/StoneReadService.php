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

    public function applyCategorizedFilter(array $categorized_fields): void
    {
        switch ($categorized_fields['field_name']) {
            case 'old_museum_id':
                $this->filterHasOldMuseumId($categorized_fields['vals']);
            default:
                return;
        }
    }

    public function filterHasOldMuseumId(array $vals)
    {
        if (count($vals) !== 1) {
            return;
        }
        if ($vals[0]) {
            $this->builder->whereNotNull('old_museum_id')->where('old_museum_id', '!=', '');
        } else {
            $this->builder->whereNull('old_museum_id')->orWhere('old_museum_id', '=', '');
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
