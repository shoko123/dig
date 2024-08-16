<?php

namespace App\Http\Requests\Module;

class ItemByIdRequest extends ModuleRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'module' => $this->rule_module_name_is_valid(),
            'id' => ['required', $this->rule_id_exists_in_module_table()],
        ];
    }

    public function messages(): array
    {
        return [
            'id' => 'An invalid or non existing id - `:input`',
        ];
    }
}
