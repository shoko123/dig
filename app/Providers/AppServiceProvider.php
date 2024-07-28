<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;
use Illuminate\Auth\Notifications\ResetPassword;
use Illuminate\Database\Eloquent\Relations\Relation;
use Illuminate\Http\Resources\Json\JsonResource;
// use App\Http\Controllers\DigModule\DigModuleReadController;
// use App\Services\App\DigModule\DigModuleService;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        ResetPassword::createUrlUsing(
            function ($notifiable, $token) {
                return "http://localhost/auth/reset-password/{$token}?email={$notifiable->getEmailForPasswordReset()}";
            }
        );

        Relation::enforceMorphMap([
            'user' => 'App\Models\User',
            'permission' => 'Spatie\Permission\Models\Permission',
            'role' => 'Spatie\Permission\Models\Role',
            'Locus' => 'App\Models\DigModule\Specific\Locus\Locus',
            'Stone' => 'App\Models\DigModule\Specific\Stone\Stone',
            'Ceramic' => 'App\Models\DigModule\Specific\Ceramic\Ceramic',
        ]);

        JsonResource::withoutWrapping();
    }
}
