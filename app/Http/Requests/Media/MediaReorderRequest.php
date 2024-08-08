<?php

namespace App\Http\Requests\Media;

use App\Http\Requests\Module\ModuleRequest;

class MediaReorderRequest extends ModuleRequest
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
            'ordered_media_ids.*' => 'nullable|exists:media,id',
        ];
    }
}
