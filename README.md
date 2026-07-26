# ⚡ Ashravel: TurboBlade

**TurboBlade** is an ultra-lightweight, zero-JS package for Laravel that turns your classic Server-Side Rendered (Blade) application into a blazingly fast Single Page Application (SPA).

Stop writing Webpack configs. Stop fighting React/Vue reactivity. Stop worrying about Livewire network bloat. Just write plain PHP/HTML, and let TurboBlade handle the magic.

---

## 🛡️ Security Analysis (Scraping & Injection)

Before deploying TurboBlade, it's essential to understand its security posture:

### 1. Cross-Site Scripting (XSS) Injection
**Are you safe? YES, provided you follow Laravel standards.**
TurboBlade updates your page using `document.body.innerHTML` and explicitly re-evaluates `<script>` tags found in the new HTML. 
*   **The Rule:** You **MUST** use Laravel's default `{{ $variable }}` syntax to output user-generated content. This automatically escapes HTML entities.
*   **The Danger:** If you use the raw syntax `{!! $variable !!}` to output user input, an attacker can inject malicious `<script>` tags. TurboBlade will execute them upon page morph. Treat your Blade templates with the exact same XSS precautions as a standard Laravel app.

### 2. Web Scraping & SEO (Search Engine Optimization)
**Is it safe from scrapers? NO. Is it good for SEO? YES.**
TurboBlade is built on the *HTML-over-the-wire* philosophy. Your Laravel backend still returns **fully rendered HTML** on every request.
*   **Scrapers:** Malicious bots and scrapers do not execute JavaScript. They just read the HTTP response. Because TurboBlade uses standard HTML routing, scrapers can read your content easily. To protect against malicious scraping, you must use server-side rate limiting (`ThrottleRequests` middleware) or a WAF like Cloudflare.
*   **SEO:** This architecture is the "Holy Grail" for SEO. Googlebot will see your website as a traditional, fully-rendered HTML site, giving you a perfect 100/100 Lighthouse SEO score, while real humans experience the site as a lightning-fast SPA.

---

## 🖥️ Server Requirements & Compatibility

Ashravel is designed to be highly compatible with both modern and legacy enterprise applications. Because the core magic happens in Vanilla JavaScript, the PHP footprint is extremely minimal.

**Supported Versions:**
- **PHP:** `8.0`, `8.1`, `8.2`, `8.3`
- **Laravel:** `9.x`, `10.x`, `11.x`

*(Note: We intentionally drop support for PHP 7.x and Laravel 8 to encourage modern security standards, even though the code technically could run on them).*

---

## 📦 Installation

Install the package via Composer (we recommend pinning to a major version):
```bash
composer require ashravel/turboblade:"^1.0"
```

Publish the JavaScript assets to your public directory:
```bash
php artisan vendor:publish --tag="turboblade-assets"
```

---

## 🚀 How to Use (Usage Guide)

### 1. Global Setup
Open your main layout file (usually `resources/views/layouts/app.blade.php`), and place the Blade directive just before the closing `</head>` or `</body>` tag:

```blade
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>My Awesome Laravel App</title>
    <!-- Inject TurboBlade Engine -->
    @turbobladeScripts
</head>
<body>
    <nav>
        <a href="/home">Home</a>
        <a href="/about">About Us</a>
    </nav>
    <main>
        @yield('content')
    </main>
</body>
</html>
```

### 2. The Magic
**You don't need to do anything else!**
The moment you add `@turbobladeScripts`, all `<a>` links and `<form>` submissions across your entire application will automatically be intercepted. The browser will no longer do a full hard reload. Instead, TurboBlade fetches the next page in the background, merges the `<head>` (to update CSRF tokens and CSS), and morphs the `<body>` instantly.

### 3. Ignoring Specific Links/Forms
If you have a link that you **do not** want TurboBlade to intercept (for example, a file download, a payment gateway redirect, or a heavy PDF generation), simply add the `data-turbo-ignore` attribute to the HTML element:

```blade
<!-- This link will cause a normal, full-page browser reload -->
<a href="/download-invoice/123" data-turbo-ignore>Download PDF</a>

<!-- This form will bypass TurboBlade completely -->
<form action="/checkout" method="POST" data-turbo-ignore>
    @csrf
    <button type="submit">Pay Now</button>
</form>
```

### 4. Integration with Third-Party JS (Alpine.js, Google Maps, etc.)
Because TurboBlade swaps the DOM, third-party JavaScript libraries might lose their state or event listeners. TurboBlade dispatches a custom event `turboblade:load` every time a page navigation finishes.

You can listen to this event to re-initialize your plugins:
```javascript
document.addEventListener('turboblade:load', function(event) {
    console.log("New page loaded at: " + event.detail.url);
    
    // Example: Re-initialize Alpine.js components
    if (typeof Alpine !== 'undefined') {
        Alpine.initTree(document.body);
    }
});
```

---

## ⚠️ SPA Architectural Gotchas (Must Read)

Because TurboBlade transforms your traditional app into a Single Page Application, the browser never actually performs a hard refresh. Please be aware of these two common SPA pitfalls:

### 1. Memory Leaks (Global Event Listeners)
If you attach an event listener to `window` or `document` inside a specific page (e.g., `welcome.blade.php`), it will not be destroyed when the user navigates away. If the user visits that page 10 times, the listener will be attached 10 times, causing a memory leak.
**Solution:** Always bind page-specific listeners to local DOM elements (which get destroyed by TurboBlade during navigation), OR explicitly remove global listeners, OR initialize them once in your main layout.

### 2. External Scripts in the Body
TurboBlade safely re-evaluates *inline* scripts (e.g., `<script>alert('hi')</script>`) when navigating. However, it will **ignore** external scripts (e.g., `<script src="https://stripe.com/v3/"></script>`) if they are placed inside the `<body>`.
**Solution:** Always place external `<script src="...">` tags inside the `<head>` of your layout. TurboBlade's smart asset merger will detect and load them perfectly.

## 👨‍💻 Author
**Rafly A.R**
Instagram: [@galaxy_scream](https://instagram.com/galaxy_scream)

---

## 🧠 Core Features Summary
- **Zero-Config:** 1 line of code to turn your app into an SPA.
- **CSRF Safe:** Automatically updates Laravel's `@csrf` tokens in the background on every navigation.
- **Scroll Memory:** Remembers your exact scroll position when you press the browser's "Back" button.
- **Asset Merging:** Automatically downloads new `<link>` CSS files if the new page requires them.