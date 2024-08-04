<?php

namespace App\Http\Requests;

use App\Http\Requests\BaseRequest;
use App\Http\Requests\ModuleSpecific\StoreRules;

class StoreRequest extends BaseRequest
{
    protected StoreRules $rulesClass;

    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
        // return $this->user('sanctum')->can($p);
    }

    protected function prepareForValidation(): void
    {
        parent::prepareForValidation();

        $full_class = 'App\Http\Requests\ModuleSpecific\\' . $this->input('module') . 'StoreRules';
        $this->rulesClass =  new $full_class;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return array_merge(
            [
                'module' => $this->rule_module_name_required_valid()
            ],
            $this->rulesClass->rules($this->isMethod('post'))
        );
    }
}
