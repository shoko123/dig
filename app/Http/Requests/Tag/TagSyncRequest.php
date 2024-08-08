<?php

namespace App\Http\Requests\Tag;

use App\Http\Requests\Module\ModuleRequest;
use App\Rules\RuleStringIntOrBool;

class TagSyncRequest extends ModuleRequest
{
    public function authorize(): bool
    {
        $p = $this->input('module') . '-tag';
        return $this->user('sanctum')->can($p);
    }

    public function rules(): array
    {
        //TODO  column_values Rule
        return [
            'module' => $this->rule_module_name_is_valid(),
            'module_id' => $this->rule_id_exists_in_module_table(),
            'module_tag_ids' => 'array',
            'module_tag_ids.*' => $this->rule_id_exists_in_module_tags_table(),
            'global_tag_ids' => 'array',
            'global_tag_ids.*' => 'exists:tags,id',
            'columns.*.column_name' =>  ['required', $this->rule_tagger_column_name_is_valid()],
            'columns.*.val' => ['required', new RuleStringIntOrBool],
        ];
    }
}
