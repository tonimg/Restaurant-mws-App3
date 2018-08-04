const cacheName="restaurant-cache-v1",cacheFiles=["./","./restaurant.html","./manifest.json","./assets/js/dbhelper.js","./assets/js/idb.js","./assets/js/index.js","./assets/js/main.js","./assets/js/restaurant_info.js","./assets/js/sw.js","./assets/data/restaurants.json","./assets/css/styles.css","./assets/img/1.jpg","./assets/img/2.jpg","./assets/img/3.jpg","./assets/img/4.jpg","./assets/img/5.jpg","./assets/img/6.jpg","./assets/img/7.jpg","./assets/img/8.jpg","./assets/img/9.jpg","./assets/img/10.jpg","./assets/img/favicon.ico","./assets/icons/icon_96x96.png","./assets/icons/icon_128x128.png","./assets/icons/icon_256x256.png","./assets/icons/icon_512x512.png","https://cdnjs.cloudflare.com/ajax/libs/normalize/8.0.0/normalize.min.css","https://fonts.googleapis.com/css?family=Lato:400i|Lobster"];self.addEventListener("install",function(s){console.log("SW installed"),s.waitUntil(caches.open(cacheName).then(function(s){return console.log("SW caching cachefiles"),s.addAll(cacheFiles)}).catch(s=>console.log("Error add to cache",s)))}),self.addEventListener("activate",function(s){console.log("SW activated"),s.waitUntil(caches.keys().then(function(s){return Promise.all(s.map(function(s){if(s!==cacheName)return console.log("SW Removing cached files from",s),caches.delete(s)}))}))}),self.addEventListener("fetch",function(s){s.respondWith(caches.match(s.request).then(function(e){return e||fetch(s.request)}))});