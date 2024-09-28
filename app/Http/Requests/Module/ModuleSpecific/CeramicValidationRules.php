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

    public function commonRules()
    {
        return [
            'fields.field_description' => 'max:200',
            'fields.specialist_description' => 'max:200',
            'fields.notes' => 'max:200',
        ];
    }

    public function create_rules(): array
    {
        return collect($this->commonRules())
            ->merge([
                'fields.id' => 'required|unique:ceramics,id|max:20',
                'fields.id_year' => 'required|numeric|in:' . implode(',', Ceramic::allowedValues('id_year')),
                'fields.id_object_no' => 'required|numeric|in:' . implode(',', Ceramic::allowedValues('id_object_no'))
            ])
            ->toArray();
    }

    public function update_rules(): array
    {
        return  collect($this->commonRules())
            ->merge(['fields.id' => 'required|exists:ceramics,id|max:20'])
            ->toArray();
    }
}
