<?php

namespace App\Http\Requests\Module;

//use App\Http\Requests\Module\ModuleSpecific\StoreRules;

class StoreRequest extends ModuleRequest
{
    //protected StoreRules $rulesClass;

    public function authorize(): bool
    {
        $p = '';
        if ($this->isMethod('post')) {
            $p = $this->input('module').'-create';
        } else {
            $p = $this->input('module').'-update';
        }

        return $this->user('sanctum')->can($p);
    }

    public function rules(): array
    {
        return array_merge(
            [
                'module' => $this->rule_module_name_is_valid(),
            ],
            $this->isMethod('post') ? $this->create_rules() : $this->update_rules()
        );
    }
}
