<?php

namespace App\Http\Requests;

use App\Http\Requests\BaseRequest;

class IndexRequest extends BaseRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
        // $p = $this->input('model') . '-media';
        // return $this->user('sanctum')->can($p);
    }


    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            //'module' => verified also in BaseRequest.prepareForValidation(),
            'module' => $this->rule_allowed_module_name(),
            //
            'query.model_tag_ids' => ['array'],
            'query.model_tag_ids.*' => $this->rule_id_exists_in_model_tags_table(),
            //
            'query.global_tag_ids' => ['array'],
            'query.global_tag_ids.*' => 'exists:tags,id',
            //
            'query.column_value' => ['array'],
            'query.column_value.*.name' => ['required', $this->rule_value_column_name_exists()],
            'query.column_value.*.vals' => ['array'],
            'query.column_value.*.vals.*' => ['required', 'alpha_num:ascii'],
            //
            //TODO validate that vals exist in the other tables' values (awkward)
            'query.column_lookup' => ['array'],
            'query.column_lookup.*.column_name' => $this->rule_lookup_column_name_exists(),
            'query.column_lookup.*.vals' => ['array'],
            'query.column_lookup.*.vals.*' => ['numeric', 'integer'],
            //        
            'query.column_search.*' => ['array'],
            'query.column_search.*.column_name' => [$this->rule_search_column_name_exists()],
            'query.column_search.*.column_name.vals' => ['array'],
            'query.column_search.*.column_name.vals.*' => ['string'],
            //
            'query.media' => ['array'],
            'query.media.*' => ['string'],
            //
            'query.bespoke' => ['array'],
            'query.bespoke.*' => ['string'],
            //
            'query.order_by.*' => ['array'],
            'query.order_by.*.column_name' => [$this->rule_order_by_column_name_exists()],
            'query.order_by.*.asc' => ['boolean'],

        ];
    }

    public function messages(): array
    {
        return [
            'ids.*' => 'A non existing id - `:input` - was sent to the page() endpoint',
            'ids' => 'page length exceeds 200',
            'view' => 'View value sent - `:input` - is not allowed'
        ];
    }
}
