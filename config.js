/**
 * config.js — DPBOSSSS.BOSTON API Configuration
 * ================================================
 * This file reads settings from .env (server-side) or acts
 * as the frontend config bridge for the browser.
 *
 * To change any API settings, edit .env — NOT this file.
 * (In a static HTML site, values from .env are mirrored here.)
 */

const APP_CONFIG = {
    // Live source URL (from .env → LIVE_SOURCE_URL)
    LIVE_SOURCE_URL: 'https://dpbossss.boston/',

    // CORS Proxy (from .env → PROXY_URL) — codetabs confirmed working
    PROXY_URL: 'https://api.codetabs.com/v1/proxy?quest=',

    // Auto-refresh interval in ms (from .env → REFRESH_INTERVAL)
    REFRESH_INTERVAL: 30000,

    // Optional paid API credentials — set these if you purchase API access
    // (from .env → API_KEY, API_SECRET)
    API_KEY: null,
    API_SECRET: null,
    API_BASE_URL: 'https://dpbossresultapi.com',

    // Helper: builds the full proxied request URL
    getProxiedURL: function () {
        return 'https://api.codetabs.com/v1/proxy?quest=' + encodeURIComponent(this.LIVE_SOURCE_URL);
    }
};
