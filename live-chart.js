(async function() {
    // Inject config.js dynamically if not present
    if (typeof APP_CONFIG === 'undefined') {
        await new Promise((resolve) => {
            const script = document.createElement('script');
            script.src = '../config.js';
            script.onload = resolve;
            document.head.appendChild(script);
        });
    }

    const PROXY_LIST = [
        (url) => `/api/fetchLive?url=${encodeURIComponent(url)}`,
        (url) => `https://corsproxy.io/?url=${encodeURIComponent(url)}`,
        (url) => `https://api.codetabs.com/v1/proxy?quest=${encodeURIComponent(url)}`,
        (url) => `https://api.allorigins.win/raw?url=${encodeURIComponent(url)}`,
        (url) => `https://cors.eu.org/${url}`,
        (url) => `https://thingproxy.freeboard.io/fetch/${url}`
    ];

    async function fetchWithFallback(targetUrl) {
        for (let i = 0; i < PROXY_LIST.length; i++) {
            const proxyUrl = PROXY_LIST[i](targetUrl);
            try {
                const res = await fetch(proxyUrl, { cache: 'no-store', signal: AbortSignal.timeout(8000) });
                if (!res.ok) continue;
                const text = await res.text();
                if (!text || text.length < 5000) continue;
                return text;
            } catch(e) {}
        }
        throw new Error('All proxies failed');
    }

    async function updateChartData() {
        try {
            // Get current path, e.g. /panel-chart-record/main-bazar-morning.php.html
            let path = window.location.pathname;
            // Get the last two segments: folder/file
            let segments = path.split('/').filter(s => s);
            if (segments.length < 2) return;
            let file = segments[segments.length - 1].replace('.html', ''); // main-bazar-morning.php
            let folder = segments[segments.length - 2]; // panel-chart-record

            let targetUrl = APP_CONFIG.LIVE_SOURCE_URL;
            if (!targetUrl.endsWith('/')) targetUrl += '/';
            targetUrl += `${folder}/${file}`;

            const html = await fetchWithFallback(targetUrl);
            const parser = new DOMParser();
            const liveDoc = parser.parseFromString(html, 'text/html');

            // Update chart result span
            const liveSpan = liveDoc.querySelector('.chart-result span');
            const localSpans = document.querySelectorAll('.chart-result span');
            if (liveSpan && localSpans.length > 0) {
                localSpans.forEach(span => {
                    span.textContent = liveSpan.textContent.trim();
                });
            }

            // Update chart table tbody
            const liveTbody = liveDoc.querySelector('.panel-chart tbody, .chart-table tbody');
            const localTbody = document.querySelector('.panel-chart tbody, .chart-table tbody');
            if (liveTbody && localTbody) {
                localTbody.innerHTML = liveTbody.innerHTML;
            }
            
            console.log("Chart live data synced successfully.");
        } catch(e) {
            console.error('Failed to sync chart live data:', e);
        }
    }

    updateChartData();
    setInterval(updateChartData, typeof APP_CONFIG !== 'undefined' && APP_CONFIG.REFRESH_INTERVAL ? APP_CONFIG.REFRESH_INTERVAL : 30000);
})();
