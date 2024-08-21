<?php

namespace App\Http\Requests\Module;

use App\Rules\RuleStringIntOrBool;

class IndexRequest extends ModuleRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            //'module' => verified also in ModuleRequest.prepareForValidation(),
            'module' => $this->rule_module_name_is_valid(),
            //
            'query.model_tag_ids' => ['array'],
            'query.model_tag_ids.*' => $this->rule_id_exists_in_module_tags_table(),
            //
            'query.global_tag_ids' => ['array'],
            'query.global_tag_ids.*' => 'exists:tags,id',
            //
            //TODO validate that vals exist in the other tables' values (awkward)
            'query.field_value' => ['array'],
            'query.field_value.*.field_name' => ['required', $this->rule_value_field_name_is_valid()],
            'query.field_value.*.source' => 'in:Value,Lookup,Bespoke',
            'query.field_value.*.vals' => ['array'],
            'query.field_value.*.vals.*' => ['required', new RuleStringIntOrBool()],
            //
            'query.field_search' => ['array'],
            'query.field_search.*.field_name' => [$this->rule_search_field_name_is_valid()],
            'query.field_search.*.vals' => ['array'],
            'query.field_search.*.vals.*' => ['string'],
            //
            'query.media' => ['array'],
            'query.media.*' => ['string'],
            //
            'query.order_by.*' => ['array'],
            'query.order_by.*.field_name' => [$this->rule_order_by_field_name_is_valid()],
            'query.order_by.*.asc' => ['boolean'],
        ];
    }

    public function messages(): array
    {
        return [
            'ids.*' => 'A non existing id - `:input` - was sent to the page() endpoint',
            'ids' => 'page length exceeds 200',
            'view' => 'View value sent - `:input` - is not allowed',
        ];
    }
}
