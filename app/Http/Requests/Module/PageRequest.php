<?php

namespace App\Http\Requests\Module;

class PageRequest extends ModuleRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'module' => $this->rule_module_name_is_valid(),
            'ids' => ['required', 'array', 'between:1,200'],
            'ids.*' => $this->rule_id_exists_in_module_table(),
            'view' => ['required', 'in:Tabular,Gallery'],
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
