<?php

namespace App\Filament\Resources;

use App\Filament\Resources\OrderResource\Pages;
use App\Models\Order;
use Filament\Forms;
use Filament\Schemas\Schema;
use Filament\Resources\Resource;
use Filament\Tables;
use Filament\Tables\Table;

class OrderResource extends Resource
{
    protected static ?string $model = Order::class;

    protected static string | \BackedEnum | null $navigationIcon = 'heroicon-o-shopping-cart';

    protected static ?string $navigationLabel = 'Orders';

    protected static ?string $modelLabel = 'Order';

    protected static string | \UnitEnum | null $navigationGroup = 'Cafe Management';

    public static function form(Schema $schema): Schema
    {
        return $schema
            ->schema([
                \Filament\Schemas\Components\Section::make('Order Information')
                    ->description('Order details')
                    ->schema([
                        Forms\Components\TextInput::make('order_number')
                            ->label('Order Number')
                            ->required()
                            ->unique('orders', 'order_number', ignoreRecord: true)
                            ->maxLength(255),
                        Forms\Components\Select::make('cafe_table_id')
                            ->label('Cafe Table')
                            ->relationship('cafeTable', 'name'),
                        Forms\Components\TextInput::make('customer_name')
                            ->label('Customer Name')
                            ->maxLength(255),
                        Forms\Components\TextInput::make('table_code')
                            ->label('Table Code')
                            ->maxLength(255)
                            ->disabled(),
                    ])->columns(2),

                \Filament\Schemas\Components\Section::make('Order Notes')
                    ->schema([
                        Forms\Components\Textarea::make('customer_note')
                            ->label('Customer Notes')
                            ->rows(3)
                            ->columnSpanFull(),
                    ]),

                \Filament\Schemas\Components\Section::make('Billing Information')
                    ->schema([
                        Forms\Components\TextInput::make('subtotal')
                            ->label('Subtotal')
                            ->numeric()
                            ->required()
                            ->minValue(0)
                            ->step(0.01),
                        Forms\Components\TextInput::make('tax')
                            ->label('Tax')
                            ->numeric()
                            ->required()
                            ->minValue(0)
                            ->step(0.01),
                        Forms\Components\TextInput::make('service_charge')
                            ->label('Service Charge')
                            ->numeric()
                            ->required()
                            ->minValue(0)
                            ->step(0.01),
                        Forms\Components\TextInput::make('discount')
                            ->label('Discount')
                            ->numeric()
                            ->required()
                            ->minValue(0)
                            ->step(0.01),
                        Forms\Components\TextInput::make('total')
                            ->label('Total')
                            ->numeric()
                            ->required()
                            ->minValue(0)
                            ->step(0.01),
                    ])->columns(2),

                \Filament\Schemas\Components\Section::make('Status & Timestamps')
                    ->schema([
                        Forms\Components\Select::make('status')
                            ->label('Status')
                            ->options([
                                'pending' => 'Pending',
                                'preparing' => 'Preparing',
                                'ready' => 'Ready',
                                'completed' => 'Completed',
                                'cancelled' => 'Cancelled',
                            ])
                            ->required(),
                        Forms\Components\DateTimePickerField::make('ordered_at')
                            ->label('Ordered At'),
                        Forms\Components\DateTimePickerField::make('completed_at')
                            ->label('Completed At'),
                    ])->columns(2),
            ]);
    }

    public static function table(Table $table): Table
    {
        return $table
            ->columns([
                Tables\Columns\TextColumn::make('order_number')
                    ->label('Order #')
                    ->searchable()
                    ->sortable(),
                Tables\Columns\TextColumn::make('cafeTable.name')
                    ->label('Table')
                    ->sortable(),
                Tables\Columns\TextColumn::make('customer_name')
                    ->label('Customer')
                    ->searchable(),
                Tables\Columns\TextColumn::make('total')
                    ->label('Total')
                    ->money('idr')
                    ->sortable(),
                Tables\Columns\BadgeColumn::make('status')
                    ->label('Status')
                    ->colors([
                        'pending' => 'warning',
                        'preparing' => 'info',
                        'ready' => 'success',
                        'completed' => 'success',
                        'cancelled' => 'danger',
                    ]),
                Tables\Columns\TextColumn::make('ordered_at')
                    ->label('Ordered')
                    ->dateTime()
                    ->sortable(),
            ])
            ->filters([
                Tables\Filters\SelectFilter::make('status')
                    ->options([
                        'pending' => 'Pending',
                        'preparing' => 'Preparing',
                        'ready' => 'Ready',
                        'completed' => 'Completed',
                        'cancelled' => 'Cancelled',
                    ]),
                Tables\Filters\SelectFilter::make('cafe_table_id')
                    ->label('Table')
                    ->relationship('cafeTable', 'name'),
            ])
            ->actions([
                Tables\Actions\EditAction::make(),
                Tables\Actions\DeleteAction::make(),
            ])
            ->bulkActions([
                Tables\Actions\BulkActionGroup::make([
                    Tables\Actions\DeleteBulkAction::make(),
                ]),
            ])
            ->defaultSort('ordered_at', 'desc');
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
            'index' => Pages\ListOrders::route('/'),
            'create' => Pages\CreateOrder::route('/create'),
            'edit' => Pages\EditOrder::route('/{record}/edit'),
        ];
    }
}
