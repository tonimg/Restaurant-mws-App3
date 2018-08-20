let restaurants;
let neighborhoods;
let cuisines;
let map;
var markers = [];
const myLazyLoad = new LazyLoad({
  elements_selector:'.myLazyLoad'
});

/**
 * Fetch neighborhoods and cuisines as soon as the page is loaded.
 */
document.addEventListener('DOMContentLoaded', (event) => {
  fetchNeighborhoods();
  fetchCuisines();
});

/**
 * Fetch all neighborhoods and set their HTML.
 */
fetchNeighborhoods = () => {
  DBHelper.fetchNeighborhoods((error, neighborhoods) => {
    if (error) {
       // Got an error
      console.error(error);
    } else {
      self.neighborhoods = neighborhoods;
      fillNeighborhoodsHTML();
    }
  });
}

/**
 * Set neighborhoods HTML.
 */
fillNeighborhoodsHTML = (neighborhoods = self.neighborhoods) => {
  const select = document.getElementById('neighborhoods-select');
  neighborhoods.forEach(neighborhood => {
    const option = document.createElement('option');
    option.innerHTML = neighborhood;
    option.value = neighborhood;
    select.append(option);
  });
}

/**
 * Fetch all cuisines and set their HTML.
 */
fetchCuisines = () => {
  DBHelper.fetchCuisines((error, cuisines) => {
    if (error) { // Got an error!
      console.error(error);
    } else {
      self.cuisines = cuisines;
      fillCuisinesHTML();
    }
  });
}

/**
 * Set cuisines HTML.
 */
fillCuisinesHTML = (cuisines = self.cuisines) => {
  const select = document.getElementById('cuisines-select');

  cuisines.forEach(cuisine => {
    const option = document.createElement('option');
    option.innerHTML = cuisine;
    option.value = cuisine;
    option.setAttribute("role", "option");
    select.append(option);
  });
}

/**
 * Initialize  map, called from HTML.
 */
let showMap = document.querySelector('#show-map');
showMap.addEventListener('click', ()=>{
  document.getElementById('map').style.height = "400px";
  showMap.style.display="none";
  

})
window.initMap = () => {
  let loc = {
    lat: 40.722216,
    lng: -73.987501
  };
  self.map = new google.maps.Map(document.getElementById('map'), {
    zoom: 12,
    center: loc,
    scrollwheel: false
  });
  updateRestaurants();
}

/**
 * Update page and map for current restaurants.
 */
updateRestaurants = () => {
  const cSelect = document.getElementById('cuisines-select');
  const nSelect = document.getElementById('neighborhoods-select');

  const cIndex = cSelect.selectedIndex;
  const nIndex = nSelect.selectedIndex;

  const cuisine = cSelect[cIndex].value;
  const neighborhood = nSelect[nIndex].value;

  DBHelper.fetchRestaurantByCuisineAndNeighborhood(cuisine, neighborhood, (error, restaurants) => {
    if (error) { // Got an error!
      console.error(error);
    } else {
      resetRestaurants(restaurants);
      fillRestaurantsHTML();
    }
  })
}

/**
 * Clear current restaurants, their HTML and remove their map markers.
 */
resetRestaurants = (restaurants) => {
  // Remove all restaurants
  self.restaurants = [];
  const ul = document.getElementById('restaurants-list');
  ul.innerHTML = '';

  // Remove all map markers
  self.markers.forEach(m => m.setMap(null));
  self.markers = [];
  self.restaurants = restaurants;
}

/**
 * Create all restaurants HTML and add them to the webpage.
 */
fillRestaurantsHTML = (restaurants = self.restaurants) => {
  const ul = document.getElementById('restaurants-list');
  restaurants.forEach(restaurant => {
    ul.append(createRestaurantHTML(restaurant));
  });
  lazyLoadImages()
  addMarkersToMap();
}

/**
 * Create restaurant HTML.
 */
createRestaurantHTML = (restaurant) => {
  const li = document.createElement('li');

  const image = document.createElement('img');
  image.className = 'restaurant-img myLazyLoad';
  image.src = DBHelper.imageUrlForRestaurant(restaurant);
  image.srcset = `./assets/img/${restaurant.id}.jpg, ./assets/img/${restaurant.id}-l.jpg 1x, ./assets/img/${restaurant.id}-l.jpg 2x`;
  image.alt = `${restaurant.name}`;
  li.append(image);

  const name = document.createElement('h3');
  name.innerHTML = restaurant.name;
  name.setAttribute("tabindex",0);
  name.classList.add("focus");
  li.append(name);

  const neighborhood = document.createElement('p');
  neighborhood.innerHTML = restaurant.neighborhood;
  neighborhood.setAttribute("tabindex",0);
  neighborhood.classList.add("focus");
  li.append(neighborhood);

  const address = document.createElement('p');
  address.innerHTML = restaurant.address;
  address.setAttribute("tabindex",0);
  address.classList.add("focus")
  li.append(address);

  const more = document.createElement('a');
  more.innerHTML = 'View Details';
  more.setAttribute('role', 'button');
  more.setAttribute("aria-label", `More info of ${restaurant.name}`)
  more.href = DBHelper.urlForRestaurant(restaurant);
  li.append(more)

// Add favourite element
  const favourite = document.createElement('span');
  if(restaurant.favourite) favourite.classList.add('active');
  favourite.innerHTML = '☆';
  favourite.setAttribute("tabindex",0);
  favourite.classList.add("focus");
  favourite.setAttribute('data-id', restaurant.id);
  favourite.setAttribute('role', 'button');
  favourite.setAttribute('arial-label', 'set as favourite');
  favourite.title = (restaurant.favourite) ? 'Remove from Favourites' : 'Add to Favourites';
  favourite.addEventListener('click', updateFavourite);
  li.append(favourite);

  return li
}

/**
 * Toggle favourite
 */
const updateFavourite = (event) => {
  const id = Number(event.target.getAttribute('data-id'));
  const favourite = !event.target.classList.contains('active');

  DBHelper.setFavourite(id, favourite)
  .then(response => {
    event.target.classList.toggle('active');
    event.target.title = (response.favourite) ? 'Remove from Favourites' : 'Add to Favourites';    
  })
  .catch(error => {
    console.log('send offline Storage');
    // DBHelper.saveFavouriteOffline(id, favourite);
  });
}
/**
 * Add markers for current restaurants to the map.
 */
addMarkersToMap = (restaurants = self.restaurants) => {
  restaurants.forEach(restaurant => {
    // Add marker to the map
    const marker = DBHelper.mapMarkerForRestaurant(restaurant, self.map);
    google.maps.event.addListener(marker, 'click', () => {
      window.location.href = marker.url
    });
    self.markers.push(marker);
  });
}
// lazyload function for imgs.
function lazyLoadImages() {

	// arrays are iterable, so forEach can be used, but not Objects
	var lazyImages = [].slice.call(document.querySelectorAll('myLazyLoad'));

	if ('IntersectionObserver' in window) {
		let lazyImageObserver = new IntersectionObserver(function (entries, observer) {
			entries.forEach(function (entry) {
				if (entry.isIntersecting) {
					let lazyImage = entry.target;
					lazyImage.src = lazyImage.dataset.src;

					lazyImage.classList.remove('myLazyLoad');
					lazyImageObserver.unobserve(lazyImage);
				}
			});
		});

		lazyImages.forEach(function (lazyImage) {
			lazyImageObserver.observe(lazyImage);
		});
	} else {
		// Possibly fall back to a more compatible method here
		console.log('lazy load for images did not succeed');
	}
}