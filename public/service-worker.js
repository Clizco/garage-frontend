const CACHE_NAME = "mi-app-cache-v1";
const urlsToCache = [
  "/",
  "/index.html",
  "/manifest.json",
];

// Instalación del Service Worker y almacenamiento en caché de archivos estáticos
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log("Archivos en caché");
      return cache.addAll(urlsToCache);
    })
  );
});

// Interceptar las solicitudes y responder con la caché si está disponible
self.addEventListener("fetch", (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request);
    })
  );
});

// Actualizar caché cuando se detecta una nueva versión
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cache) => {
          if (cache !== CACHE_NAME) {
            console.log("Borrando caché antigua:", cache);
            return caches.delete(cache);
          }
        })
      );
    })
  );
});
