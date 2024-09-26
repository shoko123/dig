<?php

namespace App\Http\Requests\Module\ModuleSpecific;

use App\Models\DigModule\Specific\Ceramic\Ceramic;

class CeramicValidationRules extends ValidationRules
{
    public function table_name(): string
    {
        return 'ceramics';
    }

    public function tags_table_name(): string
    {
        return 'ceramic_tags';
    }

    public function allowed_value_field_names(): array
    {
        return ['id_year', 'id_object_no'];
    }

    public function allowed_search_field_names(): array
    {
        return ['field_description', 'specialist_description'];
    }

    public function allowed_order_by_field_names(): array
    {
        return ['id_year', 'id_object_no'];
    }

    public function allowed_tagger_field_names(): array
    {
        return [];
    }

    public function create_rules(): array
    {
        $id_year_rule = 'required|numeric|in:' . implode(',', Ceramic::allowedValues('id_year'));
        $id_object_no_rule = 'required|numeric|in:' . implode(',', Ceramic::allowedValues('id_object_no'));
        return [
            'fields.id' => 'required|max:50',
            'fields.id_year' => $id_year_rule,
            'fields.id_object_no' => $id_object_no_rule,
            'fields.field_description' => 'max:200',
            'fields.specialist_description' => 'max:200',
            'fields.notes' => 'max:200',
        ];
    }

    public function update_rules(): array
    {
        return [
            'fields.id' => 'required|exists:ceramics,id',
            'fields.field_description' => 'max:200',
            'fields.specialist_description' => 'max:200',
            'fields.notes' => 'max:200',
        ];
    }
}
