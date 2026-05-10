<?php

namespace App\Filament\Resources;

use App\Filament\Resources\OpeningHourResource\Pages;
use App\Models\OpeningHour;
use Filament\Forms;
use Filament\Schemas\Schema;
use Filament\Resources\Resource;
use Filament\Tables;
use Filament\Tables\Table;

class OpeningHourResource extends Resource
{
    protected static ?string $model = OpeningHour::class;

    protected static string | \BackedEnum | null $navigationIcon = 'heroicon-o-clock';

    protected static ?string $navigationLabel = 'Opening Hours';

    protected static ?string $modelLabel = 'Opening Hour';

    protected static string | \UnitEnum | null $navigationGroup = 'Cafe Management';

    public static function form(Schema $schema): Schema
    {
        return $schema
            ->schema([
                \Filament\Schemas\Components\Section::make('Operating Hours')
                    ->description('Set opening and closing hours')
                    ->schema([
                        Forms\Components\Select::make('day')
                            ->label('Day')
                            ->options([
                                'monday' => 'Monday',
                                'tuesday' => 'Tuesday',
                                'wednesday' => 'Wednesday',
                                'thursday' => 'Thursday',
                                'friday' => 'Friday',
                                'saturday' => 'Saturday',
                                'sunday' => 'Sunday',
                            ])
                            ->required()
                            ->unique('opening_hours', 'day', ignoreRecord: true),
                        Forms\Components\Toggle::make('is_closed')
                            ->label('Closed on This Day')
                            ->default(false)
                            ->reactive(),
                        Forms\Components\TextInput::make('open_time')
                            ->label('Opening Time')
                            ->type('time')
                            ->required()
                            ->hidden(fn(\Filament\Schemas\Components\Utilities\Get $get) => $get('is_closed')),
                        Forms\Components\TextInput::make('close_time')
                            ->label('Closing Time')
                            ->type('time')
                            ->required()
                            ->hidden(fn(\Filament\Schemas\Components\Utilities\Get $get) => $get('is_closed')),
                    ])->columns(2),

                \Filament\Schemas\Components\Section::make('Sorting')
                    ->schema([
                        Forms\Components\TextInput::make('sort_order')
                            ->label('Sort Order')
                            ->numeric()
                            ->default(0),
                    ]),
            ]);
    }

    public static function table(Table $table): Table
    {
        return $table
            ->columns([
                Tables\Columns\TextColumn::make('day')
                    ->label('Day')
                    ->sortable(),
                Tables\Columns\TextColumn::make('open_time')
                    ->label('Opening Time'),
                Tables\Columns\TextColumn::make('close_time')
                    ->label('Closing Time'),
                Tables\Columns\IconColumn::make('is_closed')
                    ->label('Closed')
                    ->boolean(),
                Tables\Columns\TextColumn::make('sort_order')
                    ->label('Sort Order')
                    ->sortable(),
            ])
            ->filters([
                Tables\Filters\TernaryFilter::make('is_closed')
                    ->label('Closed'),
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
            ->defaultSort('sort_order');
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
            'index' => Pages\ListOpeningHours::route('/'),
            'create' => Pages\CreateOpeningHour::route('/create'),
            'edit' => Pages\EditOpeningHour::route('/{record}/edit'),
        ];
    }
}
