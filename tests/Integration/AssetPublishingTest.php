<?php

namespace Ashravel\TurboBlade\Tests\Integration;

use Orchestra\Testbench\TestCase;
use Ashravel\TurboBlade\TurboBladeServiceProvider;
use Illuminate\Support\Facades\File;

class AssetPublishingTest extends TestCase
{
    protected function getPackageProviders($app): array
    {
        return [TurboBladeServiceProvider::class];
    }

    protected function tearDown(): void
    {
        $targetPath = public_path('vendor/ashravel/turboblade.js');
        if (File::exists($targetPath)) {
            File::delete($targetPath);
        }
        parent::tearDown();
    }

    public function test_it_publishes_turboblade_javascript_asset(): void
    {
        $targetPath = public_path('vendor/ashravel/turboblade.js');
        if (File::exists($targetPath)) {
            File::delete($targetPath);
        }

        $this->assertFalse(File::exists($targetPath));

        $this->artisan('vendor:publish', ['--tag' => 'turboblade-assets'])->assertSuccessful();

        $this->assertTrue(File::exists($targetPath));
        $this->assertStringContainsString('window.TurboBlade', File::get($targetPath));
    }
}
