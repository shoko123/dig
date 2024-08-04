<?php

namespace App\Http\Requests;

use App\Http\Requests\ModuleRequest;
use App\Http\Requests\ModuleSpecific\StoreRules;

class StoreRequest extends ModuleRequest
{
    protected StoreRules $rulesClass;

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
