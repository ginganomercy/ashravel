<?php

namespace Ashravel\TurboBlade\Tests\Unit;

use Orchestra\Testbench\TestCase;
use Ashravel\TurboBlade\TurboBladeServiceProvider;
use Illuminate\Support\Facades\Blade;

class BladeDirectiveTest extends TestCase
{
    protected function getPackageProviders($app): array
    {
        return [TurboBladeServiceProvider::class];
    }

    public function test_turboblade_scripts_directive_compiles_correctly(): void
    {
        $compiled = Blade::compileString('@turbobladeScripts');

        $this->assertStringContainsString('vendor/ashravel/turboblade.js', $compiled);
        $this->assertStringContainsString('<script', $compiled);
        $this->assertStringContainsString('defer', $compiled);
    }

    public function test_turboblade_scripts_directive_renders_html_script_tag(): void
    {
        $html = Blade::render('@turbobladeScripts');

        $this->assertStringContainsString('<script src="', $html);
        $this->assertStringContainsString('vendor/ashravel/turboblade.js', $html);
        $this->assertStringContainsString('defer></script>', $html);
    }
}
