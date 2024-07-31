<?php

namespace App\Http\Requests;


use App\Http\Requests\BaseRequest;

class PageRequest extends BaseRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
        // $p = $this->input('model') . '-media';
        // return $this->user('sanctum')->can($p);
    }


    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'module' => static::$rule_allowed_module_name,
            'ids' => ['required', 'array', 'between:1,200'],
            'ids.*' => $this->rule_id_exists_in_model_table(),
            'view' => ['required', 'in:Tabular,Gallery'],
        ];
    }

    public function messages(): array
    {
        return [
            'ids.*' => 'A non existing id - `:input` - was sent to the page() endpoint',
            'ids' => 'page length exceeds 200',
            'view' => 'View value sent - `:input` - is not allowed'
        ];
    }
}
