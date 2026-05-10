<?php

namespace App\Filament\Resources;

use App\Filament\Resources\HeroSectionResource\Pages;
use App\Models\HeroSection;
use Filament\Forms;
use Filament\Schemas\Schema;
use Filament\Resources\Resource;
use Filament\Tables;
use Filament\Tables\Table;

class HeroSectionResource extends Resource
{
    protected static ?string $model = HeroSection::class;

    protected static string | \BackedEnum | null $navigationIcon = 'heroicon-o-photo';

    protected static ?string $navigationLabel = 'Hero Section';

    protected static ?string $modelLabel = 'Hero Section';

    public static function form(Schema $schema): Schema
    {
        return $schema
            ->schema([
                \Filament\Schemas\Components\Section::make('Main Content')
                    ->description('Hero section headlines and descriptions')
                    ->schema([
                        Forms\Components\TextInput::make('headline')
                            ->label('Headline')
                            ->required()
                            ->maxLength(255),
                        Forms\Components\TextInput::make('subheadline')
                            ->label('Subheadline')
                            ->maxLength(255),
                        Forms\Components\Textarea::make('description')
                            ->label('Description')
                            ->rows(4)
                            ->columnSpanFull(),
                    ])->columns(1),

                \Filament\Schemas\Components\Section::make('Media')
                    ->description('Upload hero image or video')
                    ->schema([
                        Forms\Components\Select::make('hero_media_type')
                            ->label('Media Type')
                            ->options([
                                'image' => 'Image',
                                'video' => 'Video',
                            ])
                            ->required()
                            ->reactive(),
                        Forms\Components\FileUpload::make('hero_image')
                            ->label('Hero Image')
                            ->image()
                            ->directory('hero-section')
                            ->visibility('public')
                            ->hidden(fn(\Filament\Schemas\Components\Utilities\Get $get) => $get('hero_media_type') === 'video'),
                        Forms\Components\FileUpload::make('hero_video')
                            ->label('Hero Video')
                            ->acceptedFileTypes(['video/mp4'])
                            ->directory('hero-section')
                            ->visibility('public')
                            ->hidden(fn(\Filament\Schemas\Components\Utilities\Get $get) => $get('hero_media_type') === 'image'),
                        Forms\Components\Slider::make('overlay_opacity')
                            ->label('Overlay Opacity')
                            ->minValue(0)
                            ->maxValue(1)
                            ->step(0.1)
                            ->columnSpanFull(),
                    ])->columns(1),

                \Filament\Schemas\Components\Section::make('Buttons')
                    ->description('Primary and secondary call-to-action buttons')
                    ->schema([
                        Forms\Components\TextInput::make('primary_button_text')
                            ->label('Primary Button Text')
                            ->maxLength(255),
                        Forms\Components\TextInput::make('primary_button_url')
                            ->label('Primary Button URL')
                            ->url()
                            ->maxLength(255),
                        Forms\Components\TextInput::make('secondary_button_text')
                            ->label('Secondary Button Text')
                            ->maxLength(255),
                        Forms\Components\TextInput::make('secondary_button_url')
                            ->label('Secondary Button URL')
                            ->url()
                            ->maxLength(255),
                    ])->columns(2),

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
                Tables\Columns\TextColumn::make('headline')
                    ->label('Headline')
                    ->searchable()
                    ->limit(50),
                Tables\Columns\TextColumn::make('hero_media_type')
                    ->label('Media Type'),
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
            'index' => Pages\ListHeroSections::route('/'),
            'create' => Pages\CreateHeroSection::route('/create'),
            'edit' => Pages\EditHeroSection::route('/{record}/edit'),
        ];
    }
}
