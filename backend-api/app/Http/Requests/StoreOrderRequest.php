<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreOrderRequest extends FormRequest
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
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array|string>
     */
    public function rules(): array
    {
        return [
            'cafe_table_id' => 'required|exists:cafe_tables,id',
            'table_code' => 'required|string|max:255',
            'customer_name' => 'nullable|string|max:255',
            'customer_note' => 'nullable|string',
            'items' => 'required|array|min:1',
            'items.*.menu_item_id' => 'required|exists:menu_items,id',
            'items.*.quantity' => 'required|integer|min:1',
            'items.*.note' => 'nullable|string',
        ];
    }

    /**
     * Get custom messages for validator errors.
     *
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'cafe_table_id.required' => 'Cafe table ID is required',
            'cafe_table_id.exists' => 'The selected cafe table does not exist',
            'table_code.required' => 'Table code is required',
            'items.required' => 'Order must have at least one item',
            'items.*.menu_item_id.required' => 'Menu item ID is required for each item',
            'items.*.menu_item_id.exists' => 'The selected menu item does not exist',
            'items.*.quantity.required' => 'Quantity is required for each item',
            'items.*.quantity.min' => 'Quantity must be at least 1',
        ];
    }
}
