<?php

namespace App\Filament\Resources;

use App\Filament\Resources\CafeTableResource\Pages;
use App\Models\CafeTable;
use Filament\Forms;
use Filament\Schemas\Schema;
use Filament\Resources\Resource;
use Filament\Tables;
use Filament\Tables\Table;

class CafeTableResource extends Resource
{
    protected static ?string $model = CafeTable::class;

    protected static string | \BackedEnum | null $navigationIcon = 'heroicon-o-table-cells';

    protected static ?string $navigationLabel = 'Cafe Tables';

    protected static ?string $modelLabel = 'Cafe Table';

    protected static string | \UnitEnum | null $navigationGroup = 'Cafe Management';

    public static function form(Schema $schema): Schema
    {
        return $schema
            ->schema([
                \Filament\Schemas\Components\Section::make('Table Information')
                    ->description('Create or edit cafe table')
                    ->schema([
                        Forms\Components\TextInput::make('name')
                            ->label('Table Name')
                            ->required()
                            ->maxLength(255),
                        Forms\Components\TextInput::make('code')
                            ->label('Table Code')
                            ->required()
                            ->unique('cafe_tables', 'code', ignoreRecord: true)
                            ->maxLength(255),
                        Forms\Components\TextInput::make('number')
                            ->label('Table Number')
                            ->numeric()
                            ->required(),
                        Forms\Components\TextInput::make('location')
                            ->label('Location')
                            ->maxLength(255),
                        Forms\Components\TextInput::make('capacity')
                            ->label('Capacity')
                            ->numeric()
                            ->required(),
                    ])->columns(2),

                \Filament\Schemas\Components\Section::make('QR Code')
                    ->schema([
                        Forms\Components\FileUpload::make('qr_code_path')
                            ->label('QR Code')
                            ->directory('qr-codes')
                            ->visibility('public')
                            ->disabled(),
                    ]),

                \Filament\Schemas\Components\Section::make('Status')
                    ->schema([
                        Forms\Components\Toggle::make('is_active')
                            ->label('Active')
                            ->default(true),
                    ]),
            ]);
    }

    public static function table(Table $table): Table
    {
        return $table
            ->columns([
                Tables\Columns\TextColumn::make('name')
                    ->label('Table Name')
                    ->searchable()
                    ->sortable(),
                Tables\Columns\TextColumn::make('code')
                    ->label('Code')
                    ->searchable(),
                Tables\Columns\TextColumn::make('number')
                    ->label('Number')
                    ->sortable(),
                Tables\Columns\TextColumn::make('location')
                    ->label('Location'),
                Tables\Columns\TextColumn::make('capacity')
                    ->label('Capacity'),
                Tables\Columns\IconColumn::make('is_active')
                    ->label('Active')
                    ->boolean(),
                Tables\Columns\TextColumn::make('created_at')
                    ->label('Created')
                    ->dateTime()
                    ->sortable(),
            ])
            ->filters([
                Tables\Filters\TernaryFilter::make('is_active')
                    ->label('Active'),
            ])
            ->actions([
                Tables\Actions\EditAction::make(),
                Tables\Actions\DeleteAction::make(),
            ])
            ->bulkActions([
                Tables\Actions\BulkActionGroup::make([
                    Tables\Actions\DeleteBulkAction::make(),
                ]),
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
            'index' => Pages\ListCafeTables::route('/'),
            'create' => Pages\CreateCafeTable::route('/create'),
            'edit' => Pages\EditCafeTable::route('/{record}/edit'),
        ];
    }
}
