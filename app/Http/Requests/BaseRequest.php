<?php

namespace App\Http\Requests;

use Illuminate\Contracts\Validation\Validator;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Http\Exceptions\HttpResponseException;
use Illuminate\Auth\Access\AuthorizationException;

class BaseRequest extends FormRequest
{
    public static $moduleToTableName = [
        'Locus' => 'loci',
        'Pottery' => 'pottery',
        'Stone' => 'stones',
    ];

    protected static $rule_allowed_module_name = 'required|in:Locus,Pottery,Stone';

    protected function tableName(): string
    {
        return self::$moduleToTableName[$this->input('module')];
    }

    protected function rule_id_exists_in_model_table(): string
    {
        return 'required|exists:' . $this->tableName() . ',id';
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
        return ['module' => static::$rule_allowed_module_name];
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
