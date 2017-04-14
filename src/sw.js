
var self                      = this;

var internals                 = {};
internals.LRUCache            = {};             // Object to maintain timestamp for request urls

internals.STATIC_CACHE_NAME   = 'static-v1';
internals.API_CACHE_NAME      = 'api-v1';
internals.SUGGEST_CACHE_NAME  = 'suggest-v1';

internals.SUGGEST_CACHE_TIME  = 60 * 5 * 1000;  // in seconds
internals.API_CACHE_TIME      = 60 * 5 * 1000;  // in seconds

internals.CACHE_FILE_LIST = [
  'fonts/proximanova-regular-webfont.woff2',
  'styles/site.css',
  'images/iron_man.jpg'
];

internals.CACHE_API_LIST = [
  '/'
];

internals.SUGGEST_API_LIST = [
  '/api/suggest'
];

// *********************************************************************************
// *********************************************** LOGIC FOR CACHE FIRST STRATEGY **
internals.cacheFirstStrategy = function (request, now, url, CACHE_NAME) {
  return caches.match(request).then(function(response) {
    if (response) {
      if ((now - internals.LRUCache[url.pathname + url.search]) < internals.API_CACHE_TIME) {
        return response;
      }
    }

    return fetch(request).then(function(response) {
      internals.LRUCache[url.pathname + url.search] = now;
      caches.open(CACHE_NAME).then(function(cache) {
        cache.put(request, response);
      });

      return response.clone();
    });
  });
};

// *********************************************************************************
// ************************************************* LOGIC TO CACHE STATIC ASSETS **
internals.cacheStaticAssets = function (request) {
  return caches.match(request).then(function(response) {
    // reject 'opaque' requests, as the assets must have
    // 'Access-Control-Allow-Origin' header to be served by sw
    if (response && response.type !== 'opaque') { return response; }

    return fetch(request).then(function(response) {
      caches.open(internals.STATIC_CACHE_NAME).then(function(cache) {
        cache.put(request, response);
      });

      return response.clone();
    });
  });
};

// *********************************************************************************
// ************************************************************************ FETCH **
// Listen for all `fetch` event from the application
// response with cache first if in the list, else regular fetch
self.addEventListener('fetch', function(event) {
  var requestURL = new URL(event.request.url);
  var now = (new Date()).getTime();

  if (internals.CACHE_API_LIST.indexOf(requestURL.pathname) >= 0) {
    event.respondWith(
      internals.cacheFirstStrategy(event.request, now, requestURL, internals.API_CACHE_NAME)
    );
  } else if (internals.SUGGEST_API_LIST.indexOf(requestURL.pathname.split('?')[0]) >= 0) {
    event.respondWith(
      internals.cacheFirstStrategy(event.request, now, requestURL, internals.SUGGEST_CACHE_NAME)
    );
  } else if (internals.CACHE_FILE_LIST.indexOf(requestURL.href) >= 0) {
    event.respondWith(
      internals.cacheStaticAssets(event.request)
    );
  }
  else {
    // make a fetch request and serve the file
    event.respondWith(fetch(event.request));
  }
});

// *********************************************************************************
// ********************************************************************** INSTALL **
// Place to instantiate the SW with pre-cached list of assets / endpoints
self.addEventListener('install', function(event) {
  event.waitUntil(
    Promise.all([
      caches.open(internals.STATIC_CACHE_NAME).then(function(cache) {
        return cache.addAll(internals.CACHE_FILE_LIST);
      })
    ])
    .then(function () {
      // At this point everything has been cached

      // `skipWaiting()` forces the waiting ServiceWorker to become the
      // active ServiceWorker, triggering the `onactivate` event.
      // Together with `Clients.claim()` this allows a worker to take effect
      // immediately in the client(s).
      return self.skipWaiting();
    })
  );
});

// *********************************************************************************
// ********************************************************************* ACTIVATE **
// Place to clean up old version of cache
self.addEventListener('activate', function(event) {
  if (self.clients && clients.claim) {
    clients.claim();
  }

  event.waitUntil(
    caches.keys().then(function(cacheNames) {
      Promise.all(
        [
          cacheNames.map(function(cacheName) {
            if (internals.STATIC_CACHE_NAME !== cacheName && internals.API_CACHE_NAME !== cacheName) {
              // Delete old cache
              return caches.delete(cacheName);
            }
          })
        ]
      );
    })
  );
});
