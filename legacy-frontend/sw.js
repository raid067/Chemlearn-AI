/* ============================================================
   ChemLearn AI — Service Worker (PWA)
   Strategy: Cache-First for static assets, Network-First for API
   ============================================================ */

const CACHE_NAME = 'chemlearn-v1.2';
const OFFLINE_URL = '/404.html';

// Static assets to pre-cache on install
const PRECACHE_ASSETS = [
    '/',
    '/index.html',
    '/lessons.html',
    '/quizzes.html',
    '/resources.html',
    '/experiment.html',
    '/dashboard.html',
    '/teacher.html',
    '/404.html',
    '/global.css',
    '/manifest.json',
    '/favicon.ico',
    'https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Inter:wght@400;500;600&display=swap'
];

// ── INSTALL: Pre-cache all static assets ──
self.addEventListener('install', event => {
    console.log('[SW] Installing ChemLearn AI Service Worker…');
    event.waitUntil(
        caches.open(CACHE_NAME).then(cache => {
            return cache.addAll(PRECACHE_ASSETS).catch(err => {
                console.warn('[SW] Pre-cache partial failure (ok):', err);
            });
        }).then(() => self.skipWaiting())
    );
});

// ── ACTIVATE: Clean old caches ──
self.addEventListener('activate', event => {
    console.log('[SW] Activating…');
    event.waitUntil(
        caches.keys().then(keys =>
            Promise.all(
                keys.filter(k => k !== CACHE_NAME).map(k => {
                    console.log('[SW] Deleting old cache:', k);
                    return caches.delete(k);
                })
            )
        ).then(() => self.clients.claim())
    );
});

// ── FETCH: Strategy by request type ──
self.addEventListener('fetch', event => {
    const { request } = event;
    const url = new URL(request.url);

    // Skip non-GET and Firebase/external API calls — always go network
    if (request.method !== 'GET') return;
    if (url.hostname.includes('firebaseio.com')) return;
    if (url.hostname.includes('googleapis.com') && url.pathname.includes('firestore')) return;
    if (url.hostname.includes('firebasevertexai.googleapis.com')) return;
    if (url.hostname.includes('identitytoolkit.googleapis.com')) return;

    // For navigation requests (HTML pages) — Network-first, fallback to cache
    if (request.mode === 'navigate') {
        event.respondWith(
            fetch(request)
                .then(response => {
                    // Cache a fresh copy
                    if (response && response.status === 200) {
                        const clone = response.clone();
                        caches.open(CACHE_NAME).then(c => c.put(request, clone));
                    }
                    return response;
                })
                .catch(() => {
                    // Offline fallback
                    return caches.match(request)
                        || caches.match(OFFLINE_URL);
                })
        );
        return;
    }

    // For fonts (Google Fonts) — Cache-first (long-lived)
    if (url.hostname.includes('fonts.googleapis.com') || url.hostname.includes('fonts.gstatic.com')) {
        event.respondWith(
            caches.match(request).then(cached => {
                if (cached) return cached;
                return fetch(request).then(response => {
                    if (response && response.status === 200) {
                        const clone = response.clone();
                        caches.open(CACHE_NAME).then(c => c.put(request, clone));
                    }
                    return response;
                });
            })
        );
        return;
    }

    // For CDN scripts (Chart.js, etc.) — Cache-first
    if (url.hostname.includes('cdn.jsdelivr.net') || url.hostname.includes('unpkg.com')) {
        event.respondWith(
            caches.match(request).then(cached => cached || fetch(request))
        );
        return;
    }

    // For same-origin assets (CSS, JS, images) — Stale-while-revalidate
    if (url.origin === self.location.origin) {
        event.respondWith(
            caches.open(CACHE_NAME).then(cache =>
                cache.match(request).then(cached => {
                    const networkFetch = fetch(request).then(response => {
                        if (response && response.status === 200) {
                            cache.put(request, response.clone());
                        }
                        return response;
                    }).catch(() => null);
                    return cached || networkFetch;
                })
            )
        );
    }
});

// ── BACKGROUND SYNC (optional future: queue quiz submissions) ──
self.addEventListener('sync', event => {
    if (event.tag === 'sync-quiz-scores') {
        console.log('[SW] Background sync: quiz scores');
        // Future: flush queued Firestore writes
    }
});

// ── PUSH NOTIFICATIONS (optional future) ──
self.addEventListener('push', event => {
    const data = event.data ? event.data.json() : {};
    const options = {
        body: data.body || 'New content available on ChemLearn AI!',
        icon: '/icons/icon-192.png',
        badge: '/icons/icon-72.png',
        vibrate: [100, 50, 100],
        data: { url: data.url || '/' }
    };
    event.waitUntil(
        self.registration.showNotification(data.title || 'ChemLearn AI 🧪', options)
    );
});

self.addEventListener('notificationclick', event => {
    event.notification.close();
    event.waitUntil(clients.openWindow(event.notification.data.url));
});

console.log('[SW] ChemLearn AI Service Worker loaded ✓');
