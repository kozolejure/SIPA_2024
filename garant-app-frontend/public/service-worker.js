/* eslint-disable no-undef */
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

self.addEventListener('push', function (event) {
    const data = event.data.json();  // Assuming your server sends JSON
    const { title, message } = data;

    const options = {
        body: message,
        icon: './logo192.png',
        badge: './logo192.png'
    };

    event.waitUntil(
        self.registration.showNotification(title, options)
    );
});

self.addEventListener('push', function (event) {
    var options = {
        body: event.data.text(),
        icon: './favicon.ico',
        vibrate: [100, 50, 100],
        data: {
            dateOfArrival: Date.now(),
            primaryKey: '2'
        },
        actions: [
            {
                action: 'close', title: 'Zapri',
                icon: './favicon.ico'
            },
        ]
    };

    event.waitUntil(
        self.registration.showNotification('Obvestilo', options)
    );
});

self.addEventListener('notificationclick', function (event) {
    console.log('On notification click: ', event.notification.tag);
    event.notification.close();

    event.waitUntil(
        clients.matchAll({
            type: "window"
        }).then(function (clientList) {
            const url = '/product-details/' + event.notification.data.productId;

            for (let i = 0; i < clientList.length; i++) {
                const client = clientList[i];
                if ('focus' in client) {
                    return client.focus().then(client => {
                        client.navigate(url);
                        return;
                    });
                }
            }

            if (clients.openWindow) {
                return clients.openWindow(url);
            }
        })
    );
});