<?php

namespace App\Http\Requests\Module\ModuleSpecific;

use App\Models\DigModule\Specific\Stone\Stone;

class StoneValidationRules extends ValidationRules
{
    public function table_name(): string
    {
        return 'stones';
    }

    public function tags_table_name(): string
    {
        return 'stone_tags';
    }

    public function allowed_value_field_names(): array
    {
        return ['base_type_id', 'material_id', 'cataloger_id', 'whole', 'id_year', 'id_object_no', 'old_museum_id'];
    }

    public function allowed_search_field_names(): array
    {
        return ['id'];
    }

    public function allowed_order_by_field_names(): array
    {
        return ['id_year', 'id_object_no', 'excavation_date', 'catalog_date'];
    }

    public function allowed_tagger_field_names(): array
    {
        return ['base_type_id', 'material_id', 'cataloger_id', 'whole'];
    }

    public function create_rules(): array
    {
        $id_year_rule = 'required|numeric|in:' . implode(',', Stone::allowedValues('id_year'));
        $id_access_no_rule = 'required|numeric|in:' . implode(',', Stone::allowedValues('id_access_no'));

        return [
            'fields.id' => 'max:250',
            'fields.id_year' => $id_year_rule,
            'fields.id_access_no' => $id_access_no_rule,
            'fields.id_object_no' => 'required|numeric|between:1,9999',
            'fields.square' => 'max:50',
            'fields.context' => 'max:50',
            'fields.excavation_date' => 'date|nullable',
            'fields.occupation_level' => 'max:10',
            'fields.cataloger_material' => 'max:50',
            'fields.whole' => 'boolean',
            'fields.cataloger_typology' => 'max:50',
            'fields.cataloger_description' => 'max:350',
            'fields.conservation_notes' => 'max:250',
            'fields.weight' => 'max:50',
            'fields.length' => 'max:50',
            'fields.width' => 'max:50',
            'fields.height' => 'max:50',
            'fields.diameter' => 'max:50',
            'fields.dimension_notes' => 'max:250',
            'fields.cultural_period' => 'max:50',
            'fields.excavation_object_id' => 'max:50',
            'fields.old_museum_id' => 'max:50',
            'fields.cataloger_id' => 'exists:stone_catalogers,id',
            'fields.catalog_date' => 'date|nullable',
            'fields.specialist_description' => 'max:250',
            'fields.specialist_date' => 'date|nullable',
            'fields.thumbnail' => 'max:250',
            'fields.material_id' => 'exists:stone_materials,id',
            'fields.base_type_id' => 'exists:stone_base_types,id',
        ];
    }

    public function update_rules(): array
    {
        return $this->create_rules();
    }
}
