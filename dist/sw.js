const cacheName="restaurant-cache-v2",cacheFiles=["./","./restaurant.html","./manifest.json","./assets/js/dbhelper.js","./assets/js/idb.js","./assets/js/index.js","./assets/js/main.js","./assets/js/restaurant_info.js","./assets/data/restaurants.json","./assets/css/normalize.css","./assets/css/styles.css","./assets/img/1.jpg","./assets/img/1-l.jpg","./assets/img/1-xl.jpg","./assets/img/1-m.jpg","./assets/img/1-m@2x.jpg","./assets/img/1-s.jpg","./assets/img/1-s@2x.jpg","./assets/img/2.jpg","./assets/img/2-l.jpg","./assets/img/2-xl.jpg","./assets/img/2-m.jpg","./assets/img/2-m@2x.jpg","./assets/img/2-s.jpg","./assets/img/2-s@2x.jpg","./assets/img/3.jpg","./assets/img/3-l.jpg","./assets/img/3-xl.jpg","./assets/img/3-m.jpg","./assets/img/3-m@2x.jpg","./assets/img/3-s.jpg","./assets/img/3-s@2x.jpg","./assets/img/4.jpg","./assets/img/4-l.jpg","./assets/img/4-xl.jpg","./assets/img/4-m.jpg","./assets/img/4-m@2x.jpg","./assets/img/4-s.jpg","./assets/img/4-s@2x.jpg","./assets/img/5.jpg","./assets/img/5-l.jpg","./assets/img/5-xl.jpg","./assets/img/5-m.jpg","./assets/img/5-m@2x.jpg","./assets/img/5-s.jpg","./assets/img/5-s@2x.jpg","./assets/img/6.jpg","./assets/img/6-l.jpg","./assets/img/6-xl.jpg","./assets/img/6-m.jpg","./assets/img/6-m@2x.jpg","./assets/img/6-s.jpg","./assets/img/6-s@2x.jpg","./assets/img/7.jpg","./assets/img/7-l.jpg","./assets/img/7-xl.jpg","./assets/img/7-m.jpg","./assets/img/7-m@2x.jpg","./assets/img/7-s.jpg","./assets/img/7-s@2x.jpg","./assets/img/8.jpg","./assets/img/8-l.jpg","./assets/img/8-xl.jpg","./assets/img/8-m.jpg","./assets/img/8-m@2x.jpg","./assets/img/8-s.jpg","./assets/img/8-s@2x.jpg","./assets/img/9.jpg","./assets/img/9-l.jpg","./assets/img/9-xl.jpg","./assets/img/9-m.jpg","./assets/img/9-m@2x.jpg","./assets/img/9-s.jpg","./assets/img/9-s@2x.jpg","./assets/img/10.jpg","./assets/img/10-l.jpg","./assets/img/10-xl.jpg","./assets/img/10-m.jpg","./assets/img/10-m@2x.jpg","./assets/img/10-s.jpg","./assets/img/10-s@2x.jpg","./assets/img/favicon.ico","./assets/icons/icon_96x96.png","./assets/icons/icon_128x128.png","./assets/icons/icon_256x256.png","./assets/icons/icon_512x512.png","https://cdnjs.cloudflare.com/ajax/libs/vanilla-lazyload/8.9.0/lazyload.min.js","https://fonts.googleapis.com/css?family=Lato:400i|Lobster"];function servePhoto(s){return caches.open(photosCacheName).then(e=>e.match(s).then(t=>t||cacheAndFetch(e,s)))}function cacheAndFetch(s,e){return s.add(e),fetch(e)}self.addEventListener("install",function(s){console.log("SW installed"),s.waitUntil(caches.open(cacheName).then(function(s){return console.log("SW caching cachefiles"),s.addAll(cacheFiles)}).catch(s=>console.log("Error add to cache",s)))}),self.addEventListener("activate",function(s){console.log("SW activated"),s.waitUntil(caches.keys().then(function(s){return Promise.all(s.map(function(s){if(s!==cacheName)return console.log("SW Removing cached files from",s),caches.delete(s)}))}))}),self.addEventListener("fetch",function(s){s.respondWith(caches.match(s.request).then(function(e){return e||fetch(s.request)}))}),self.addEventListener("install",s=>{s.waitUntil(caches.open(cacheName).then(s=>{s.addAll(cacheFiles)}))}),self.addEventListener("fetch",s=>{const e=new URL(s.request.url);"/index.html"!==e.pathname?e.pathname.startsWith("/restaurant.html")?s.respondWith(caches.match("restaurant.html").then(e=>e||fetch(s.request))):e.pathname.endsWith(".jpg")?s.respondWith(servePhoto(s.request)):s.respondWith(caches.match(s.request).then(e=>e||fetch(s.request))):s.respondWith(caches.match("index.html").then(e=>e||fetch(s.request)))});