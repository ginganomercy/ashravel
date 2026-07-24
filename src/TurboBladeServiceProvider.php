<?php

namespace Ashravel\TurboBlade;

use Illuminate\Support\ServiceProvider;
use Illuminate\Support\Facades\Blade;

class TurboBladeServiceProvider extends ServiceProvider
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
        // 1. Publish the JavaScript asset to public/vendor/ashravel/
        if ($this->app->runningInConsole()) {
            $this->publishes([
                __DIR__.'/../resources/js/turboblade.js' => public_path('vendor/ashravel/turboblade.js'),
            ], 'turboblade-assets');
        }

        // 2. Register Blade Directive to easily inject the script
        Blade::directive('turbobladeScripts', function () {
            return "<?php echo '<script src=\"' . asset('vendor/ashravel/turboblade.js') . '\" defer></script>'; ?>";
        });
    }
}
