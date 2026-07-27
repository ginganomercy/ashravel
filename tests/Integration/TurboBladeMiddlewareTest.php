<?php

namespace Ashravel\TurboBlade\Tests\Integration;

use Orchestra\Testbench\TestCase;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\HttpFoundation\RedirectResponse;
use Ashravel\TurboBlade\Middleware\TurboBladeMiddleware;

class TurboBladeMiddlewareTest extends TestCase
{
    public function test_it_attaches_location_header_on_redirect_for_turboblade_requests(): void
    {
        $middleware = new TurboBladeMiddleware();

        $request = Request::create('/old-page', 'GET');
        $request->headers->set('X-TurboBlade', 'true');

        $response = new RedirectResponse('https://localhost/new-page', 302);

        $result = $middleware->handle($request, fn () => $response);

        $this->assertTrue($result->headers->has('X-TurboBlade-Location'));
        $this->assertEquals('https://localhost/new-page', $result->headers->get('X-TurboBlade-Location'));
    }

    public function test_it_does_not_attach_location_header_for_normal_requests(): void
    {
        $middleware = new TurboBladeMiddleware();

        $request = Request::create('/old-page', 'GET');
        $response = new RedirectResponse('https://localhost/new-page', 302);

        $result = $middleware->handle($request, fn () => $response);

        $this->assertFalse($result->headers->has('X-TurboBlade-Location'));
    }

    public function test_force_reload_helper_sets_reload_header(): void
    {
        $response = new Response('OK');
        $result = TurboBladeMiddleware::forceReload($response);

        $this->assertTrue($result->headers->has('X-TurboBlade-Reload'));
        $this->assertEquals('true', $result->headers->get('X-TurboBlade-Reload'));
    }
}
