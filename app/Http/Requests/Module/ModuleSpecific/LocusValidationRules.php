<?php

namespace App\Http\Requests\Module\ModuleSpecific;

class LocusValidationRules extends ValidationRules
{
    public function table_name(): string
    {
        return 'loci';
    }

    public function tags_table_name(): string
    {
        return 'locus_tags';
    }

    public function allowed_value_field_names(): array
    {
        return ['category'];
    }

    public function allowed_search_field_names(): array
    {
        return ['id', 'oc_label'];
    }

    public function allowed_order_by_field_names(): array
    {
        return ['category', 'a', 'b', 'published_date'];
    }

    public function allowed_tagger_field_names(): array
    {
        return [];
    }

    public function allowed_bespoke_filter_names(): array
    {
        return [];
    }

    public function create_rules(): array
    {
        return [
            'fields.id' => 'max:250',
        ];
    }

    public function update_rules(): array
    {
        return [
            'fields.id' => 'required|max:50',
        ];
    }
}
