<?php

namespace App\Filament\Widgets;

use App\Models\MenuItem;
use App\Models\OrderItem;
use Filament\Tables;
use Filament\Tables\Columns\TextColumn;
use Filament\Tables\Table;
use Filament\Widgets\TableWidget as BaseWidget;
use Illuminate\Database\Eloquent\Builder;

class TopMenuItemsWidget extends BaseWidget
{
    protected static ?int $sort = 3;

    protected int | string | array $columnSpan = 'half';

    public function table(Table $table): Table
    {
        return $table
            ->query(
                MenuItem::query()
                    ->withCount(['orderItems'])
                    ->orderByDesc('order_items_count')
                    ->limit(10)
            )
            ->columns([
                TextColumn::make('name')
                    ->label('Menu Item')
                    ->searchable()
                    ->sortable(),
                TextColumn::make('category.name')
                    ->label('Category')
                    ->sortable(),
                TextColumn::make('price')
                    ->label('Price')
                    ->money('idr')
                    ->sortable(),
                TextColumn::make('order_items_count')
                    ->label('Times Ordered')
                    ->counts('orderItems'),
            ])
            ->defaultSort('order_items_count', 'desc');
    }
}
