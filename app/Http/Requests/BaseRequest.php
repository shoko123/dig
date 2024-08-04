<?php

namespace App\Http\Requests;

use Illuminate\Contracts\Validation\Validator;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Http\Exceptions\HttpResponseException;
use Illuminate\Auth\Access\AuthorizationException;
use App\Exceptions\GeneralJsonException;

enum ModuleConfigData: int
{
    case TableName = 0;
    case TagTableName = 1;
    case LookupColumnNames = 2;
    case ValueColumnNames = 3;
    case SearchColumnNames = 4;
    case OrderByColumnNames = 5;
}

class BaseRequest extends FormRequest
{
    public static $moduleDetails = [
        'Locus' => ['loci', 'locus_tags', [], ['category'], ['id', 'oc_label'], ['category', 'a', 'b', 'published_date']],
        'Pottery' => ['pottery', 'pottery_tags', [], [], [], []],
        'Stone' => ['stones', 'stone_tags',  ['base_type_id', 'material_id', 'cataloger_id'], ['id_year', 'id_object_no'], ['id'], ['id_year', 'id_object_no', 'excavation_date', 'catalog_date']]
    ];

    protected function prepareForValidation(): void
    {
        //Verify that the module is valid as it used as a key for other validations using $moduleTable[] above.
        if (is_null($this->input('module')) || !in_array($this->input('module'), array_keys(self::$moduleDetails))) {
            throw new GeneralJsonException("Absent or invalid module name: `" . $this->input('module') . "`", 422);
        }
    }

    //protected static $rule_module_name_required_valid = 'required|in:Locus,Pottery,Stone';
    protected static function rule_module_name_required_valid(): string
    {
        return 'required|in:' . implode(",", array_keys(self::$moduleDetails));
    }

    protected function getModuleData(ModuleConfigData $d): string | array
    {
        return self::$moduleDetails[$this->input('module')][$d->value];
    }

    protected function rule_id_exists_in_model_table(): string
    {
        return 'exists:' . $this->getModuleData(ModuleConfigData::TableName) . ',id';
    }

    protected function rule_id_exists_in_model_tags_table(): string
    {
        return 'exists:' . $this->getModuleData(ModuleConfigData::TagTableName) . ',id';
    }

    protected function rule_lookup_column_name_exists(): string
    {
        return 'in:' . implode(",", $this->getModuleData(ModuleConfigData::LookupColumnNames));
    }

    protected function rule_value_column_name_exists(): string
    {
        return 'in:' . implode(",", $this->getModuleData(ModuleConfigData::ValueColumnNames));
    }

    protected function rule_search_column_name_exists(): string
    {
        return 'in:' . implode(",", $this->getModuleData(ModuleConfigData::SearchColumnNames));
    }

    protected function rule_order_by_column_name_exists(): string
    {
        return 'in:' . implode(",", $this->getModuleData(ModuleConfigData::OrderByColumnNames));
    }
    public function authorize(): bool
    {
        return true;
    }

    protected function failedAuthorization()
    {
        throw new AuthorizationException('Authorization failed in BaseRequest.');
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
