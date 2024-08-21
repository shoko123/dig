<?php

namespace App\Http\Requests\Module\ModuleSpecific;

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
        return ['id_year'];
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
        return [
            'fields.id' => 'required|max:50',
        ];
    }

    public function update_rules(): array
    {
        return [
            'fields.id' => 'required|max:50',
        ];
    }
}
