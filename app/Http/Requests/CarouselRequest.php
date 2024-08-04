<?php

namespace App\Http\Requests;

use App\Http\Requests\ModuleRequest;

class CarouselRequest extends ModuleRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'source' => ['required', 'in:main,media,related'],
            'module' => $this->rule_module_name_required_valid(),
            'module_id' => ['required_if:source,main', $this->rule_id_exists_in_module_table()],
            'media_id' => ['required_if:source,media', 'numeric', 'integer'],
        ];
    }

    public function messages(): array
    {
        return [
            'source' => 'An invalid or non existing source - `:input`',
        ];
    }
}
