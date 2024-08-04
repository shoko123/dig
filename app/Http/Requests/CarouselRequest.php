<?php

namespace App\Http\Requests;

use App\Http\Requests\BaseRequest;
use Illuminate\Validation\Rule;

class CarouselRequest extends BaseRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'source' => ['required', 'in:main,media,related'],
            'module' => $this->rule_module_name_required_valid(),
            'module_id' => ['required_if:source,main', $this->rule_id_exists_in_model_table()], //['required_if:source,main'],
            'media_id' => ['required_if:source,media', 'numeric', 'integer'],

        ];

        // 'role_id' => Rule::requiredIf($request->user()->is_admin),
    }

    public function messages(): array
    {
        return [
            'source' => 'An invalid or non existing source - `:input`',
        ];
    }
}
