<?php

namespace App\Filament\Pages;

use App\Filament\Widgets\ActiveTablesWidget;
use App\Filament\Widgets\PendingOrdersWidget;
use App\Filament\Widgets\PreparingOrdersWidget;
use App\Filament\Widgets\RecentOrdersWidget;
use App\Filament\Widgets\TodayOrdersWidget;
use App\Filament\Widgets\TodayRevenueWidget;
use App\Filament\Widgets\TotalMenuItemsWidget;
use App\Filament\Widgets\TopMenuItemsWidget;
use Filament\Pages\Dashboard as BaseDashboard;

class Dashboard extends BaseDashboard
{
    protected static string | \BackedEnum | null $navigationIcon = 'heroicon-o-home';

    protected function getHeaderWidgets(): array
    {
        return [
            TotalMenuItemsWidget::class,
            TodayOrdersWidget::class,
            TodayRevenueWidget::class,
        ];
    }

    public function getWidgets(): array
    {
        return [
            ActiveTablesWidget::class,
            PendingOrdersWidget::class,
            PreparingOrdersWidget::class,
            RecentOrdersWidget::class,
            TopMenuItemsWidget::class,
        ];
    }

    public function getColumns(): int | array
    {
        return [
            'md' => 2,
            'lg' => 3,
        ];
    }
}
