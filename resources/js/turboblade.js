/**
 * Ashravel TurboBlade (v1.1 - Production Ready)
 * Zero-JS SPA Interceptor for Laravel Blade.
 */

(function () {
    if (window.TurboBlade) return;
    window.TurboBlade = true;

    // Cache the initial page state
    window.history.replaceState({ url: window.location.href, scrollY: window.scrollY }, '', window.location.href);

    /**
     * Dispatch custom lifecycle events.
     */
    function dispatchEvent(name, detail = {}) {
        const event = new CustomEvent(name, { detail, bubbles: true, cancelable: true });
        document.dispatchEvent(event);
        return event;
    }

    /**
     * Merge new <head> assets into current <head>.
     */
    function mergeHead(newDoc) {
        const currentHead = document.head;
        const newHead = newDoc.head;
        
        // 1. Update CSRF Token if present
        const newCsrf = newHead.querySelector('meta[name="csrf-token"]');
        if (newCsrf) {
            let currentCsrf = currentHead.querySelector('meta[name="csrf-token"]');
            if (currentCsrf) {
                currentCsrf.setAttribute('content', newCsrf.getAttribute('content'));
            } else {
                currentHead.appendChild(newCsrf.cloneNode(true));
            }
        }

        // 2. Append new Stylesheets and Scripts
        const assetSelectors = 'link[rel="stylesheet"], script[src]';
        const newAssets = Array.from(newHead.querySelectorAll(assetSelectors));
        const currentAssets = Array.from(currentHead.querySelectorAll(assetSelectors)).map(el => el.href || el.src);

        newAssets.forEach(asset => {
            const assetUrl = asset.href || asset.src;
            if (!currentAssets.includes(assetUrl)) {
                const newEl = document.createElement(asset.tagName);
                Array.from(asset.attributes).forEach(attr => newEl.setAttribute(attr.name, attr.value));
                currentHead.appendChild(newEl);
            }
        });
    }

    /**
     * Fetch HTML from URL and morph the DOM.
     */
    async function navigate(url, options = {}, pushState = true, targetScrollY = 0) {
        // Allow developer to cancel navigation
        const beforeEvent = dispatchEvent('turboblade:before-visit', { url });
        if (beforeEvent.defaultPrevented) return;

        // Show native loading indicator if possible
        document.body.style.opacity = '0.5';
        document.body.style.pointerEvents = 'none';

        try {
            const fetchOptions = {
                ...options,
                headers: {
                    ...options.headers,
                    'X-TurboBlade': 'true',
                    'Accept': 'text/html'
                }
            };

            const response = await fetch(url, fetchOptions);

            // Laravel throws 419 for CSRF expiry. Standard redirect fixes it (forces new session cookie/token).
            if (!response.ok && response.status !== 419) {
                // If it's a 500 error, just redirect normally to show Laravel's error page
                window.location.href = url;
                return;
            }

            if (response.status === 419) {
                window.location.reload();
                return;
            }

            const html = await response.text();
            
            // Parse the new HTML
            const parser = new DOMParser();
            const doc = parser.parseFromString(html, 'text/html');

            // Morph title and head
            if (doc.title) document.title = doc.title;
            mergeHead(doc);

            // Replace the body content
            document.body.innerHTML = doc.body.innerHTML;

            // Re-evaluate inline scripts in the new body
            const scripts = document.body.querySelectorAll('script:not([src])');
            scripts.forEach(oldScript => {
                const newScript = document.createElement('script');
                Array.from(oldScript.attributes).forEach(attr => newScript.setAttribute(attr.name, attr.value));
                newScript.appendChild(document.createTextNode(oldScript.innerHTML));
                oldScript.parentNode.replaceChild(newScript, oldScript);
            });

            // Update URL and save scroll state before pushing new
            if (pushState) {
                // Save current scroll before leaving
                window.history.replaceState({ url: window.location.href, scrollY: window.scrollY }, '', window.location.href);
                window.history.pushState({ url: url, scrollY: 0 }, '', url);
            }

            // Restore scroll or scroll to top
            window.scrollTo(0, targetScrollY);

            // Announce new page loaded (fixes Alpine.js / Custom JS amnesia)
            dispatchEvent('turboblade:load', { url });

        } catch (error) {
            console.error('TurboBlade Network Error:', error);
            window.location.href = url;
        } finally {
            document.body.style.opacity = '1';
            document.body.style.pointerEvents = 'auto';
        }
    }

    /**
     * Intercept all link clicks.
     */
    document.addEventListener('click', (e) => {
        const link = e.target.closest('a');
        if (!link) return;
        
        if (
            link.host !== window.location.host ||
            link.target === '_blank' ||
            link.hasAttribute('data-turbo-ignore') ||
            e.ctrlKey || e.metaKey || e.shiftKey || e.altKey
        ) {
            return;
        }

        e.preventDefault();
        const url = link.href;
        if (url === window.location.href) return; 

        navigate(url);
    });

    /**
     * Intercept form submissions.
     */
    document.addEventListener('submit', (e) => {
        const form = e.target;
        if (form.hasAttribute('data-turbo-ignore')) return;
        
        e.preventDefault();
        const method = (form.getAttribute('method') || 'GET').toUpperCase();
        const url = form.getAttribute('action') || window.location.href;
        const formData = new FormData(form);

        if (method === 'GET') {
            const params = new URLSearchParams(formData).toString();
            navigate(`${url}?${params}`);
        } else {
            navigate(url, {
                method: method,
                body: formData
            });
        }
    });

    /**
     * Handle Browser Back/Forward buttons smoothly
     */
    window.addEventListener('popstate', (e) => {
        if (e.state && e.state.url) {
            navigate(e.state.url, {}, false, e.state.scrollY || 0);
        } else {
            window.location.reload();
        }
    });

    console.log("⚡ TurboBlade v1.1 Engine Initialized");
    dispatchEvent('turboblade:load', { url: window.location.href });
})();
