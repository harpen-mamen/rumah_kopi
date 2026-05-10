<?php

namespace App\Filament\Resources;

use App\Filament\Resources\OrderItemResource\Pages;
use App\Models\OrderItem;
use Filament\Forms;
use Filament\Schemas\Schema;
use Filament\Resources\Resource;
use Filament\Tables;
use Filament\Tables\Table;

class OrderItemResource extends Resource
{
    protected static ?string $model = OrderItem::class;

    protected static string | \BackedEnum | null $navigationIcon = 'heroicon-o-list-bullet';

    protected static ?string $navigationLabel = 'Order Items';

    protected static ?string $modelLabel = 'Order Item';

    protected static bool $shouldRegisterNavigation = false;

    public static function form(Schema $schema): Schema
    {
        return $schema
            ->schema([
                \Filament\Schemas\Components\Section::make('Order Item Information')
                    ->description('View order item details')
                    ->schema([
                        Forms\Components\Select::make('order_id')
                            ->label('Order')
                            ->relationship('order', 'order_number')
                            ->disabled(),
                        Forms\Components\Select::make('menu_item_id')
                            ->label('Menu Item')
                            ->relationship('menuItem', 'name')
                            ->disabled(),
                        Forms\Components\TextInput::make('menu_name_snapshot')
                            ->label('Menu Name (Snapshot)')
                            ->disabled(),
                        Forms\Components\TextInput::make('price_snapshot')
                            ->label('Price (Snapshot)')
                            ->disabled()
                            ->numeric(),
                        Forms\Components\TextInput::make('quantity')
                            ->label('Quantity')
                            ->disabled()
                            ->numeric(),
                        Forms\Components\Textarea::make('note')
                            ->label('Note')
                            ->disabled(),
                        Forms\Components\TextInput::make('subtotal')
                            ->label('Subtotal')
                            ->disabled()
                            ->numeric(),
                    ])->columns(2),
            ]);
    }

    public static function table(Table $table): Table
    {
        return $table
            ->columns([
                Tables\Columns\TextColumn::make('order.order_number')
                    ->label('Order #')
                    ->searchable()
                    ->sortable(),
                Tables\Columns\TextColumn::make('menuItem.name')
                    ->label('Menu Item')
                    ->searchable(),
                Tables\Columns\TextColumn::make('menu_name_snapshot')
                    ->label('Name Snapshot'),
                Tables\Columns\TextColumn::make('price_snapshot')
                    ->label('Price')
                    ->money('idr'),
                Tables\Columns\TextColumn::make('quantity')
                    ->label('Quantity')
                    ->sortable(),
                Tables\Columns\TextColumn::make('subtotal')
                    ->label('Subtotal')
                    ->money('idr')
                    ->sortable(),
                Tables\Columns\TextColumn::make('created_at')
                    ->label('Created')
                    ->dateTime()
                    ->sortable(),
            ])
            ->filters([
                Tables\Filters\SelectFilter::make('order_id')
                    ->label('Order')
                    ->relationship('order', 'order_number'),
            ])
            ->actions([
                // Read-only, no actions
            ])
            ->bulkActions([
                // Read-only, no bulk actions
            ]);
    }

    public static function getRelations(): array
    {
        return [
            //
        ];
    }

    public static function getPages(): array
    {
        return [
            'index' => Pages\ListOrderItems::route('/'),
        ];
    }
}
