const cacheName = "restaurant-cache-v2";
const cacheFiles = [
	'./',
	'./restaurant.html',
	'./restaurant.html?id=1',
	'./restaurant.html?id=2',
	'./restaurant.html?id=3',
	'./restaurant.html?id=4',
	'./restaurant.html?id=5',
	'./restaurant.html?id=6',
	'./restaurant.html?id=7',
	'./restaurant.html?id=8',
	'./restaurant.html?id=9',
	'./restaurant.html?id=10',
	'./manifest.json',
	'./assets/js/dbhelper.js',
	'./assets/js/idb.js',
	'./assets/js/index.js',
	'./assets/js/main.js',
	'./assets/js/restaurant_info.js',
	'./assets/data/restaurants.json',
	'./assets/css/normalize.css',
	'./assets/css/styles.css',
	'./assets/img/1.jpg',
	'./assets/img/1-l.jpg',
	'./assets/img/1-m.jpg',
	'./assets/img/1-m@2x.jpg',
	'./assets/img/1-s.jpg',
	'./assets/img/1-s@2x.jpg',
	'./assets/img/2.jpg',
	'./assets/img/2-l.jpg',
	'./assets/img/2-m.jpg',
	'./assets/img/2-m@2x.jpg',
	'./assets/img/2-s.jpg',
	'./assets/img/2-s@2x.jpg',
	'./assets/img/3.jpg',
	'./assets/img/3-l.jpg',
	'./assets/img/3-m.jpg',
	'./assets/img/3-m@2x.jpg',
	'./assets/img/3-s.jpg',
	'./assets/img/3-s@2x.jpg',
	'./assets/img/4.jpg',
	'./assets/img/4-l.jpg',
	'./assets/img/4-m.jpg',
	'./assets/img/4-m@2x.jpg',
	'./assets/img/4-s.jpg',
	'./assets/img/4-s@2x.jpg',
	'./assets/img/5.jpg',
	'./assets/img/5-l.jpg',
	'./assets/img/5-m.jpg',
	'./assets/img/5-m@2x.jpg',
	'./assets/img/5-s.jpg',
	'./assets/img/5-s@2x.jpg',
	'./assets/img/6.jpg',
	'./assets/img/6-l.jpg',
	'./assets/img/6-m.jpg',
	'./assets/img/6-m@2x.jpg',
	'./assets/img/6-s.jpg',
	'./assets/img/6-s@2x.jpg',
	'./assets/img/7.jpg',
	'./assets/img/7-l.jpg',
	'./assets/img/7-m.jpg',
	'./assets/img/7-m@2x.jpg',
	'./assets/img/7-s.jpg',
	'./assets/img/7-s@2x.jpg',
	'./assets/img/8.jpg',
	'./assets/img/8-l.jpg',
	'./assets/img/8-m.jpg',
	'./assets/img/8-m@2x.jpg',
	'./assets/img/8-s.jpg',
	'./assets/img/8-s@2x.jpg',
	'./assets/img/9.jpg',
	'./assets/img/9-l.jpg',
	'./assets/img/9-m.jpg',
	'./assets/img/9-m@2x.jpg',
	'./assets/img/9-s.jpg',
	'./assets/img/9-s@2x.jpg',
	'./assets/img/10.jpg',
	'./assets/img/10-l.jpg',
	'./assets/img/10-m.jpg',
	'./assets/img/10-m@2x.jpg',
	'./assets/img/10-s.jpg',
	'./assets/img/10-s@2x.jpg',
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