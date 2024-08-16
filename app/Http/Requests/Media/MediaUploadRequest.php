<?php

namespace App\Http\Requests\Media;

use App\Http\Requests\Module\ModuleRequest;
use App\Services\App\MediaService;
use Illuminate\Validation\Rules\File;

class MediaUploadRequest extends ModuleRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $media_collections = MediaService::collection_names();
        $media_collection_rule = 'nullable|in:'.$media_collections->implode(',');

        return [
            'module' => $this->rule_module_name_is_valid(),
            'id' => $this->rule_id_exists_in_module_table(),
            'media_collection_name' => $media_collection_rule,
            'media_files.*' => [
                File::image()
                    ->min(1)
                    ->max(3 * 1024),
            ],
        ];
    }
}
