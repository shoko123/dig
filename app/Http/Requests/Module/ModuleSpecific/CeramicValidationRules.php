<?php

namespace App\Http\Requests\Module\ModuleSpecific;

use App\Http\Requests\Module\ModuleSpecific\ValidationRules;

class CeramicValidationRules extends ValidationRules
{
    function table_name(): string
    {
        return 'ceramics';
    }

    function tags_table_name(): string
    {
        return 'ceramic_tags';
    }

    function allowed_value_column_names(): array
    {
        return ['id_year'];
    }

    function allowed_search_column_names(): array
    {
        return ['field_description', 'specialist_description'];
    }

    function allowed_order_by_column_names(): array
    {
        return ['id_year', 'id_object_no'];
    }

    function allowed_tagger_column_names(): array
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
