const cacheName = "restaurant-cache-v1";
const cacheFiles = [
	'./',
	'./restaurant.html',
	'./manifest.json',
	'./sw.js',
	'./assets/js/dbhelper.js',
	'./assets/js/idb.js',
	'./assets/js/index.js',
	'./assets/js/main.js',
	'./assets/js/restaurant_info.js',
	'./assets/data/restaurants.json',
	'./assets/css/normalize.css',
	'./assets/css/styles.css',
	'./assets/img/1.jpg',
	'./assets/img/2.jpg',
	'./assets/img/3.jpg',
	'./assets/img/4.jpg',
	'./assets/img/5.jpg',
	'./assets/img/6.jpg',
	'./assets/img/7.jpg',
	'./assets/img/8.jpg',
	'./assets/img/9.jpg',
	'./assets/img/10.jpg',
	'./assets/img/favicon.ico',
	'./assets/icons/icon_96x96.png',
	'./assets/icons/icon_128x128.png',
	'./assets/icons/icon_256x256.png',
	'./assets/icons/icon_512x512.png',
	'https://cdnjs.cloudflare.com/ajax/libs/vanilla-lazyload/8.9.0/lazyload.min.js',
	'https://fonts.googleapis.com/css?family=Lato:400i|Lobster'
];

// *Install event - caching main content while installing Service Worker
self.addEventListener('install', function(event){
   // Open a cache and add the static resources
	console.log("SW installed");
	event.waitUntil(
		caches.open(cacheName)
		.then(function(cache){
			console.log("SW caching cachefiles");
			return cache.addAll(cacheFiles);
    })
    .catch( error => console.log('Error add to cache', error))
	)
});

// Activate event & delete old cache on and update
self.addEventListener('activate', function(event){
	console.log("SW activated");
	event.waitUntil(
		caches.keys().then(function(cacheNames){
			return Promise.all(cacheNames.map(function(thisCacheName){
				if(thisCacheName !== cacheName) {
					console.log("SW Removing cached files from", thisCacheName);
					return caches.delete(thisCacheName);
				}
			}))
		})
	)
});

// Fetch event - Downloads content from Cache, if it's reachable
self.addEventListener('fetch', function(event){
	event.respondWith(
		caches.match(event.request).then(function(response){
			return response || fetch(event.request);
		})
	);
});