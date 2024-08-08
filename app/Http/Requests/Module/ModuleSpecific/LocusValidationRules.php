<?php

namespace App\Http\Requests\Module\ModuleSpecific;

use App\Http\Requests\Module\ModuleSpecific\ValidationRules;

class LocusValidationRules extends ValidationRules
{
    function table_name(): string
    {
        return 'loci';
    }

    function tags_table_name(): string
    {
        return 'locus_tags';
    }

    function allowed_value_column_names(): array
    {
        return ['category'];
    }

    function allowed_search_column_names(): array
    {
        return ['id', 'oc_label'];
    }

    function allowed_order_by_column_names(): array
    {
        return ['category', 'a', 'b', 'published_date'];
    }

    function allowed_tagger_column_names(): array
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
