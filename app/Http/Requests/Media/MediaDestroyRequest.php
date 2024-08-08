<?php

namespace App\Http\Requests\Media;

use App\Http\Requests\Module\ModuleRequest;

class MediaDestroyRequest extends ModuleRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'module' => $this->rule_module_name_is_valid(),
            'module_id' => $this->rule_id_exists_in_module_table(),
            'media_id' => 'exists:media,id',
        ];
    }
}
