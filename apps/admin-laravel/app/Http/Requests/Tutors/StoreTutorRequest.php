<?php

namespace App\Http\Requests\Tutors;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreTutorRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'full_name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'email', 'max:255', Rule::unique('tutors', 'email')],
            'phone' => ['required', 'string', 'max:50'],
            'password' => ['required', 'string', 'min:8', 'max:255'],
        ];
    }
}
