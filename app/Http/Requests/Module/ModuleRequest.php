<?php

namespace App\Http\Requests\Module;

use App\Exceptions\GeneralJsonException;
use App\Http\Requests\Module\ModuleSpecific\ValidationRules;
use Illuminate\Auth\Access\AuthorizationException;
use Illuminate\Contracts\Validation\Validator;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Http\Exceptions\HttpResponseException;

class ModuleRequest extends FormRequest
{
    protected ValidationRules $rules;

    protected function prepareForValidation(): void
    {
        //Verify that the module is valid as it used as a key for other validations using $moduleTable[] above.
        if (is_null($this->input('module')) || ! in_array($this->input('module'), ['Locus', 'Stone', 'Ceramic'])) {
            throw new GeneralJsonException('Absent or invalid module name: `' . $this->input('module') . '`', 422);
        }

        $full_class = 'App\Http\Requests\Module\ModuleSpecific\\' . $this->input('module') . 'ValidationRules';
        $this->rules = new $full_class;
    }

    protected function rule_module_name_is_valid()
    {
        return 'required|in:Locus,Ceramic,Stone';
    }

    protected function rule_id_exists_in_module_table(): string
    {
        return $this->rules->rule_id_exists_in_module_table();
    }

    protected function rule_id_exists_in_module_tags_table(): string
    {
        return $this->rules->rule_id_exists_in_module_tags_table();
    }

    protected function rule_value_field_name_is_valid(): string
    {
        return $this->rules->rule_value_field_name_is_valid();
    }

    protected function rule_search_field_name_is_valid(): string
    {
        return $this->rules->rule_search_field_name_is_valid();
    }

    protected function rule_order_by_field_name_is_valid(): string
    {
        return $this->rules->rule_order_by_field_name_is_valid();
    }

    protected function rule_tagger_field_name_is_valid(): string
    {
        return $this->rules->rule_tagger_field_name_is_valid();
    }

    protected function create_rules(): array
    {
        return $this->rules->create_rules();
    }

    protected function update_rules(): array
    {
        return $this->rules->update_rules();
    }

    public function authorize(): bool
    {
        return true;
    }

    protected function failedAuthorization()
    {
        throw new AuthorizationException('Authorization failed in ModuleRequest.');
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\Rule|array|string>
     */
    public function rules(): array
    {
        return ['module' => $this->rule_module_name_is_valid()];
    }

    public function failedValidation(Validator $validator)
    {
        throw new HttpResponseException(response()->json([
            'success' => false,
            'message' => 'Validation errors',
            'data' => $validator->errors(),
        ], 400));
    }
}
