<?php

namespace App\Http\Requests\Module\ModuleSpecific;

abstract class ValidationRules
{
    abstract public function create_rules(): array;

    abstract public function update_rules(): array;

    abstract public function table_name(): string;

    abstract public function tags_table_name(): string;

    abstract public function allowed_value_field_names(): array;

    abstract public function allowed_search_field_names(): array;

    abstract public function allowed_order_by_field_names(): array;

    abstract public function allowed_tagger_field_names(): array;

    public function rule_id_exists_in_module_table(): string
    {
        return 'exists:' . $this->table_name() . ',id';
    }

    public function rule_id_exists_in_module_tags_table(): string
    {
        return 'exists:' . $this->tags_table_name() . ',id';
    }

    public function rule_value_field_name_is_valid(): string
    {
        return 'in:' . implode(',', $this->allowed_value_field_names());
    }

    public function rule_search_field_name_is_valid(): string
    {
        return 'in:' . implode(',', $this->allowed_search_field_names());
    }

    public function rule_order_by_field_name_is_valid(): string
    {
        return 'in:' . implode(',', $this->allowed_order_by_field_names());
    }

    public function rule_tagger_field_name_is_valid(): string
    {
        return 'in:' . implode(',', $this->allowed_tagger_field_names());
    }
}
