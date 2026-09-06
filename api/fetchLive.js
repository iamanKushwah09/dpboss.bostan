// api/fetchLive.js — DPBOSS Live Data Proxy with Server-Side Cache
// ================================================================
// In-memory cache ensures sub-100ms responses for repeated requests.
// Fresh data is fetched from dpboss.net at most once every 20 seconds.

let cachedHTML = null;
let cacheTimestamp = 0;
const CACHE_TTL_MS = 20000; // 20 seconds cache

async function fetchFreshData(targetUrl) {
  const response = await fetch(targetUrl, {
    cache: 'no-store',
    signal: AbortSignal.timeout(8000),
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36',
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
      'Accept-Language': 'en-US,en;q=0.5',
    }
  });
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  const text = await response.text();
  if (!text || text.length < 5000) throw new Error('Response too short');
  return text;
}

module.exports = async function handler(req, res) {
  // Set CORS headers immediately
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    const targetUrl = req.query.url || "https://dpbossss.boston/";
    const now = Date.now();
    const cacheAge = now - cacheTimestamp;
    
    // Serve from cache if fresh (< 20 sec old)
    if (cachedHTML && cacheAge < CACHE_TTL_MS) {
      res.setHeader('Content-Type', 'text/html; charset=utf-8');
      res.setHeader('X-Cache', 'HIT');
      res.setHeader('X-Cache-Age', Math.round(cacheAge / 1000) + 's');
      // Allow CDN edge to cache for 15 sec, serve stale for 30 sec while revalidating
      res.setHeader('Cache-Control', 's-maxage=15, stale-while-revalidate=30');
      return res.status(200).send(cachedHTML);
    }

    // Cache miss or stale — fetch fresh data
    const text = await fetchFreshData(targetUrl);
    
    // Update cache
    cachedHTML = text;
    cacheTimestamp = Date.now();

    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.setHeader('X-Cache', 'MISS');
    res.setHeader('Cache-Control', 's-maxage=15, stale-while-revalidate=30');
    res.status(200).send(text);
  } catch (error) {
    // If we have stale cache, serve it even on error (better than nothing)
    if (cachedHTML) {
      res.setHeader('Content-Type', 'text/html; charset=utf-8');
      res.setHeader('X-Cache', 'STALE');
      res.setHeader('Cache-Control', 's-maxage=5, stale-while-revalidate=60');
      return res.status(200).send(cachedHTML);
    }
    res.status(500).json({ error: error.message });
  }
};
