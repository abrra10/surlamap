const CACHE_NAME = "surlamap-v1";
const STATIC_CACHE = "surlamap-static-v1";
const DYNAMIC_CACHE = "surlamap-dynamic-v1";

// Files to cache immediately
const STATIC_FILES = [
  "/",
  "/events",
  "/login",
  "/signup",
  "/about",
  "/contact",
  "/dashboard",
  "/_next/static/css/app/layout.css",
  "/_next/static/css/app/page.css",
  "/_next/static/css/app/globals.css",
];

// API routes to cache
const API_ROUTES = ["/api/events", "/api/profiles", "/api/registrations"];

// Image cache patterns
const IMAGE_CACHE_PATTERNS = [
  /\.(png|jpg|jpeg|gif|webp|avif|svg)$/,
  /supabase\.co\/storage\/v1\/object\/public/,
];

// Install event - cache static files
self.addEventListener("install", (event) => {
  console.log("🚀 Service Worker installing...");

  event.waitUntil(
    caches
      .open(STATIC_CACHE)
      .then((cache) => {
        console.log("📦 Caching static files");
        return cache.addAll(STATIC_FILES);
      })
      .then(() => {
        console.log("✅ Static files cached successfully");
        return self.skipWaiting();
      })
      .catch((error) => {
        console.error("❌ Failed to cache static files:", error);
      })
  );
});

// Activate event - clean up old caches
self.addEventListener("activate", (event) => {
  console.log("🔄 Service Worker activating...");

  event.waitUntil(
    caches
      .keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== STATIC_CACHE && cacheName !== DYNAMIC_CACHE) {
              console.log("🗑️ Deleting old cache:", cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => {
        console.log("✅ Service Worker activated");
        return self.clients.claim();
      })
  );
});

// Fetch event - handle requests
self.addEventListener("fetch", (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests
  if (request.method !== "GET") {
    return;
  }

  // Handle different types of requests
  if (isStaticFile(url)) {
    event.respondWith(cacheFirst(request, STATIC_CACHE));
  } else if (isImageRequest(url)) {
    event.respondWith(cacheFirst(request, DYNAMIC_CACHE));
  } else if (isApiRequest(url)) {
    event.respondWith(networkFirst(request, DYNAMIC_CACHE));
  } else {
    event.respondWith(networkFirst(request, DYNAMIC_CACHE));
  }
});

// Cache first strategy for static files
async function cacheFirst(request, cacheName) {
  try {
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }

    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      const cache = await caches.open(cacheName);
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  } catch (error) {
    console.error("Cache first strategy failed:", error);
    return new Response("Offline content not available", { status: 503 });
  }
}

// Network first strategy for dynamic content
async function networkFirst(request, cacheName) {
  try {
    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      const cache = await caches.open(cacheName);
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  } catch (error) {
    console.log("Network failed, trying cache:", error);
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    return new Response("Offline content not available", { status: 503 });
  }
}

// Stale while revalidate strategy
async function staleWhileRevalidate(request, cacheName) {
  const cache = await caches.open(cacheName);
  const cachedResponse = await cache.match(request);

  const networkResponsePromise = fetch(request).then((response) => {
    if (response.ok) {
      cache.put(request, response.clone());
    }
    return response;
  });

  return cachedResponse || networkResponsePromise;
}

// Helper functions
function isStaticFile(url) {
  return (
    STATIC_FILES.includes(url.pathname) ||
    url.pathname.startsWith("/_next/static/") ||
    url.pathname.startsWith("/_next/image/")
  );
}

function isImageRequest(url) {
  return IMAGE_CACHE_PATTERNS.some((pattern) => pattern.test(url.href));
}

function isApiRequest(url) {
  return API_ROUTES.some((route) => url.pathname.startsWith(route));
}

// Background sync for offline actions
self.addEventListener("sync", (event) => {
  if (event.tag === "background-sync") {
    event.waitUntil(doBackgroundSync());
  }
});

async function doBackgroundSync() {
  try {
    // Sync any pending offline actions
    const pendingActions = await getPendingActions();

    for (const action of pendingActions) {
      await syncAction(action);
    }

    console.log("✅ Background sync completed");
  } catch (error) {
    console.error("❌ Background sync failed:", error);
  }
}

// Get pending actions from IndexedDB
async function getPendingActions() {
  // This would be implemented with IndexedDB
  return [];
}

// Sync a single action
async function syncAction(action) {
  // This would sync the action with the server
  console.log("Syncing action:", action);
}

// Push notification handling
self.addEventListener("push", (event) => {
  const options = {
    body: event.data ? event.data.text() : "New notification from Surlamap",
    icon: "/images/logo.png",
    badge: "/images/logo.png",
    vibrate: [100, 50, 100],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1,
    },
    actions: [
      {
        action: "explore",
        title: "View Events",
        icon: "/images/logo.png",
      },
      {
        action: "close",
        title: "Close",
        icon: "/images/logo.png",
      },
    ],
  };

  event.waitUntil(self.registration.showNotification("Surlamap", options));
});

// Notification click handling
self.addEventListener("notificationclick", (event) => {
  event.notification.close();

  if (event.action === "explore") {
    event.waitUntil(clients.openWindow("/events"));
  }
});

// Message handling for communication with main thread
self.addEventListener("message", (event) => {
  if (event.data && event.data.type === "SKIP_WAITING") {
    self.skipWaiting();
  }

  if (event.data && event.data.type === "GET_VERSION") {
    event.ports[0].postMessage({ version: CACHE_NAME });
  }
});

// Error handling
self.addEventListener("error", (event) => {
  console.error("Service Worker error:", event.error);
});

self.addEventListener("unhandledrejection", (event) => {
  console.error("Service Worker unhandled rejection:", event.reason);
});
