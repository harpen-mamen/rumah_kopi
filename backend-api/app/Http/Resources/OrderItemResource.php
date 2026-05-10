<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class OrderItemResource extends JsonResource
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
            'order_id' => $this->order_id,
            'menu_item_id' => $this->menu_item_id,
            'menu_item' => new MenuItemResource($this->whenLoaded('menuItem')),
            'menu_name_snapshot' => $this->menu_name_snapshot,
            'price_snapshot' => (float) $this->price_snapshot,
            'quantity' => $this->quantity,
            'note' => $this->note,
            'subtotal' => (float) $this->subtotal,
        ];
    }
}
