<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class OrderResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'order_number' => $this->order_number,
            'cafe_table_id' => $this->cafe_table_id,
            'table' => new CafeTableResource($this->whenLoaded('cafeTable')),
            'table_code' => $this->table_code,
            'customer_name' => $this->customer_name,
            'customer_note' => $this->customer_note,
            'subtotal' => (float) $this->subtotal,
            'tax' => (float) $this->tax,
            'service_charge' => (float) $this->service_charge,
            'discount' => (float) $this->discount,
            'total' => (float) $this->total,
            'status' => $this->status,
            'items' => OrderItemResource::collection($this->whenLoaded('items')),
            'ordered_at' => $this->ordered_at?->toIso8601String(),
            'completed_at' => $this->completed_at?->toIso8601String(),
            'created_at' => $this->created_at?->toIso8601String(),
            'updated_at' => $this->updated_at?->toIso8601String(),
        ];
    }
}
