<?php

namespace App\Http\Requests\Module;

use Illuminate\Contracts\Validation\Validator;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Http\Exceptions\HttpResponseException;
use Illuminate\Auth\Access\AuthorizationException;
use App\Exceptions\GeneralJsonException;

enum ModuleConfigData: int
{
    case TableName = 0;
    case TagTableName = 1;
    case ValueColumnNames = 2;
    case SearchColumnNames = 3;
    case OrderByColumnNames = 4;
    case ColumnNamesUsedByTagger = 5;
}

class ModuleRequest extends FormRequest
{
    public static $moduleDetails = [
        'Locus' => ['loci', 'locus_tags', ['category'], ['id', 'oc_label'], ['category', 'a', 'b', 'published_date'], []],
        'Ceramic' => ['ceramic', 'ceramic_tags', [], [], [], []],
        'Stone' => ['stones', 'stone_tags', ['base_type_id', 'material_id', 'cataloger_id', 'whole', 'id_year', 'id_object_no'], ['id'], ['id_year', 'id_object_no', 'excavation_date', 'catalog_date'], ['base_type_id', 'material_id', 'cataloger_id', 'whole']]
    ];

    protected function prepareForValidation(): void
    {
        //Verify that the module is valid as it used as a key for other validations using $moduleTable[] above.
        if (is_null($this->input('module')) || !in_array($this->input('module'), array_keys(self::$moduleDetails))) {
            throw new GeneralJsonException("Absent or invalid module name: `" . $this->input('module') . "`", 422);
        }
    }

    //protected static $rule_module_name_required_valid = 'required|in:Locus,Ceramic,Stone';
    protected static function rule_module_name_required_valid(): string
    {
        return 'required|in:' . implode(",", array_keys(self::$moduleDetails));
    }

    protected function getModuleData(ModuleConfigData $d): string | array
    {
        return self::$moduleDetails[$this->input('module')][$d->value];
    }

    protected function rule_id_exists_in_module_table(): string
    {
        return 'exists:' . $this->getModuleData(ModuleConfigData::TableName) . ',id';
    }

    protected function rule_id_exists_in_module_tags_table(): string
    {
        return 'exists:' . $this->getModuleData(ModuleConfigData::TagTableName) . ',id';
    }

    protected function rule_value_column_name_is_valid(): string
    {
        return 'in:' . implode(",", $this->getModuleData(ModuleConfigData::ValueColumnNames));
    }

    protected function rule_search_column_name_is_valid(): string
    {
        return 'in:' . implode(",", $this->getModuleData(ModuleConfigData::SearchColumnNames));
    }

    protected function rule_order_by_column_name_is_valid(): string
    {
        return 'in:' . implode(",", $this->getModuleData(ModuleConfigData::OrderByColumnNames));
    }

    protected function rule_tagger_column_name_is_valid(): string
    {
        return 'in:' . implode(",", $this->getModuleData(ModuleConfigData::ColumnNamesUsedByTagger));
    }

    public function authorize(): bool
    {
        return true;
    }

    protected function failedAuthorization()
    {
        throw new AuthorizationException('Authorization failed in ModuleRequest.');
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\Rule|array|string>
     */
    public function rules(): array
    {
        return ['module' => static::rule_module_name_required_valid()];
    }

    public function failedValidation(Validator $validator)
    {
        throw new HttpResponseException(response()->json([
            'success' => false,
            'message' => 'Validation errors',
            'data' => $validator->errors(),
        ], 400));
    }
}
