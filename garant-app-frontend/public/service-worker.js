/* eslint-disable no-restricted-globals */
// service-worker.js
const CACHE_NAME = 'app-cache-v2';
const urlsToCache = [
    '/', // Domov stran
    '/index.html',
    '/static/js/bundle.js',
    '/static/js/main.chunk.js',
    '/static/js/0.chunk.js',
    '/static/js/1.chunk.js', // Dodajte vse relevantne JavaScript svežnje, ki jih vaš projekt uporablja
    '/static/css/main.chunk.css',
    '/manifest.json',
    '/favicon.ico',
    '/logo192.png',
    '/login',  // Potrebno za React Router
    '/registration',
    '/first-login',
    '/add-product',
    '/offline.html'  // Stran prikazana, ko ni omrežne povezave
];

// Instalirajte in predpomnite vse navedene vire
self.addEventListener('install', function (event) {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(function (cache) {
                console.log('Opened cache');
                return cache.addAll(urlsToCache);
            })
    );
});

// Poslužite predpomnjene vire ali pojdite na omrežje, če ni na voljo
self.addEventListener('fetch', function (event) {
    event.respondWith(
        caches.match(event.request)
            .then(function (response) {
                if (response) {
                    return response;  // Vrne predpomnjeno kopijo
                }
                return fetch(event.request).catch(() => caches.match('/offline.html'));
            })
    );
});