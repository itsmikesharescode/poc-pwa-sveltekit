/// <reference types="@sveltejs/kit" />
/// <reference no-default-lib="true"/>
/// <reference lib="esnext" />
/// <reference lib="webworker" />

import { build, files, version } from '$service-worker';

// Create a unique cache name for this deployment
const CACHE = `cache-${version}`;

const ASSETS = [
  ...build, // the app itself
  ...files // everything in `static`
];

const sw = self as unknown as ServiceWorkerGlobalScope;

// Install service worker
sw.addEventListener('install', (event) => {
  event.waitUntil(
    caches
      .open(CACHE)
      .then((cache) => cache.addAll(ASSETS))
      .then(() => {
        sw.skipWaiting();
      })
  );
});

// Activate service worker
sw.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then(async (keys) => {
      // delete old caches
      for (const key of keys) {
        if (key !== CACHE) await caches.delete(key);
      }
      sw.clients.claim();
    })
  );
});

// Fetch resources
sw.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;

  event.respondWith(
    caches.match(event.request).then((response) => {
      return (
        response ||
        fetch(event.request).then(async (fetchResponse) => {
          const cache = await caches.open(CACHE);
          cache.put(event.request, fetchResponse.clone());
          return fetchResponse;
        })
      );
    })
  );
});
