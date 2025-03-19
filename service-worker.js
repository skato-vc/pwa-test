const CACHE_NAME = "cache-v1";

const FILES_TO_CACHE = [
    "/",
    "/index.html",
    "/assets/test.png"
];

self.addEventListener("install", event => {
    console.log("[Service Worker] Installing...");
    event.waitUntil(
        caches.open(CACHE_NAME).then(cache => {
            console.log("[Service Worker] Caching app shell");
            return cache.addAll(FILES_TO_CACHE);
        })
    );
});

self.addEventListener("fetch", event => {
  console.log("[Service Worker] Fetching:", event.request.url);
  event.respondWith(
      caches.match(event.request).then(response => {
          return response || fetch(event.request);
      }).catch(() => {
          return caches.match("/index.html");
      })
  );
});

self.addEventListener("activate", event => {
    console.log("[Service Worker] Activating...");
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cache => {
                    if (cache !== CACHE_NAME) {
                        console.log("[Service Worker] Deleting old cache:", cache);
                        return caches.delete(cache);
                    }
                })
            );
        })
    );
});

self.addEventListener("push", function(event) {
    console.log("Pushイベント受信:", event);

    const title = "Push通知";
    const options = {
        body: event.data.text(),
        tag: title,
        icon: "/icon.png"
    };

    event.waitUntil(
        (async () => {
            try {
                await self.registration.showNotification(title, options);
                console.log("Push通知を表示しました");
            } catch (error) {
                console.error("Push通知の表示に失敗", error);
            }
        })()
    );
});

// プッシュ通知をクリックしたときのイベント
self.addEventListener('notificationclick', function (event) {
    event.notification.close();

    event.waitUntil(
        // プッシュ通知をクリックしたときにブラウザを起動して表示するURL
        clients.openWindow('https://nnahito.com/')
    );
});
