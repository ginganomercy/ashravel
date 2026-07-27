<?php

namespace Ashravel\TurboBlade\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class TurboBladeMiddleware
{
    /**
     * Handle an incoming request.
     */
    public function handle(Request $request, Closure $next): Response
    {
        $response = $next($request);

        // Process only if request originates from TurboBlade SPA fetch
        if ($request->header('X-TurboBlade') === 'true') {
            // If a Redirect response (301/302) occurs, attach target location header
            // so frontend SPA can accurately update history.pushState
            if ($response->isRedirection()) {
                $targetUrl = $response->headers->get('Location');
                if ($targetUrl) {
                    $response->headers->set('X-TurboBlade-Location', $targetUrl);
                }
            }
        }

        return $response;
    }

    /**
     * Attach a header instructing TurboBlade JS to perform a full hard page reload.
     */
    public static function forceReload(Response $response): Response
    {
        $response->headers->set('X-TurboBlade-Reload', 'true');
        return $response;
    }
}
