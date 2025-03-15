/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

const cacheVersion = "CACHE_VERSION";
const cacheName = 'selkies-webrtc-pwa';
const filesToCache = [
  '/',
  '/manifest.json',
  '/icon-192x192.png',
  '/icon-512x512.png',
/* cache assets from app launcher */
  '/lib/store/app.ts',
  '/lib/scripts/input.js',
  '/lib/scripts/signalling.js',
  '/lib/scripts/webrtc.js'
].map(file => file + '?ts=' + cacheVersion);

function getCacheName() {
  return cacheName + "_" + cacheVersion;
}

async function deleteCache() {
  return caches.keys().then(cacheNames => {
    return Promise.all(
      cacheNames.map(name => {
        if (name.startsWith(cacheName) && name !== getCacheName()) {
          return caches.delete(name);
        }
      })
    );
  });
}

// on activation we clean up the previously registered service workers
self.addEventListener('activate', evt => {
  evt.waitUntil(deleteCache());
});

/* Start the service worker and cache all of the app's content */
self.addEventListener('install', function(e) {
  e.waitUntil(
    caches.open(getCacheName()).then(function(cache) {
      return cache.addAll(filesToCache);
    })
  );
});

/* Serve cached content when offline */
self.addEventListener('fetch', function(e) {
  const clientId = e.clientId || e.resultingClientId;
  e.respondWith(
    caches.match(e.request)
      .then(function(response) {
        return response || fetch(e.request, {
          credentials: 'include',
          redirect: 'manual',
          mode: 'no-cors',
        })
      })
      .then((response) => {
        if (response.type === "opaqueredirect" && !e.request.url.match("favicon")) {
          console.log("saw opaqueredirect response when fetching " + e.request.url + ", deleting cache and sending reload to client: " + e.clientId);

          // Notify client that network is offline.
          if (clientId) {
            clients.get(clientId).then((client) => {
              client.postMessage({ msg: "reload" });
            });
          }
          deleteCache();
        }
        return response;
      })
      .catch(() => {
        // Return empty Response object on fetch failure to make PWA installable
        return new Response();
      })
  );
});
