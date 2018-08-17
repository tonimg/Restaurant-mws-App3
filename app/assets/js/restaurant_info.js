let restaurant;
let map;
const myLazyLoad = new LazyLoad({
  elements_selector: '.myLazyLoad'
});

/**
 * Initialize map as soon as the page is loaded.
 */
let showMap = document.querySelector('#show-map');
showMap.addEventListener('click', ()=>{
  document.getElementById('map-container').style.height = "400px";
  showMap.style.display="none";
})

window.initMap = () => {
  fetchRestaurantFromURL((error, restaurant) => {
    if (error) {
      // Got an error!
      console.error(error);
    } else {
      self.map = new google.maps.Map(document.getElementById('map'), {
        zoom: 14,
        center: restaurant.latlng,
        scrollwheel: false
      });
      fillBreadcrumb();
      DBHelper.mapMarkerForRestaurant(self.restaurant, self.map);
    }
  })
}

/**
 * Get current restaurant from page URL.
 */
fetchRestaurantFromURL = (callback) => {
  if (self.restaurant) {
    // restaurant already fetched!
    callback(null, self.restaurant)
    return;
  }
  const id = getParameterByName('id');
  if (!id) {
    // no id found in URL
    error = 'No restaurant id in URL'
    callback(error, null);
  } else {
    DBHelper.fetchRestaurantById(id, (error, restaurant) => {
      self.restaurant = restaurant;
      if (!restaurant) {
        console.error(error);
        return;
      }

      fillRestaurantHTML();
      callback(null, restaurant)
    });

    DBHelper.fetchReviewsByRestaurantId(id, (error, reviews) => {
      self.restaurant.reviews = reviews;
      if (!reviews) {
        console.error(error);
        return;
      }
      fillReviewsHTML(reviews);
    });
  }
}

/**
 * Create restaurant HTML and add it to the webpage
 */
fillRestaurantHTML = (restaurant = self.restaurant) => {
  const name = document.getElementById('restaurant-name');
  name.innerHTML = restaurant.name;
  name.classList.add("focus");

  const address = document.getElementById('restaurant-address');
  address.innerHTML = restaurant.address;
  address.classList.add("focus");
  address.setAttribute("arial-label", "addres of the restaurant" + restaurant.address);

  const image = document.getElementById('restaurant-img');
  image.className = 'restaurant-img myLazyLoad';
  image.alt = `${restaurant.name}`;
  image.src = DBHelper.imageUrlForRestaurant(restaurant);
  image.srcset = `./assets/img/${restaurant.id}.jpg, ./assets/img/${restaurant.id}-s.jpg 1x, ./assets/img/${restaurant.id}-s@2x.jpg 2x`;

  const cuisine = document.getElementById('restaurant-cuisine');
  cuisine.innerHTML = restaurant.cuisine_type;

  // fill operating hours
  if (restaurant.operating_hours) {
    fillRestaurantHoursHTML();
  }
}

/**
 * Create restaurant operating hours HTML table and add it to the webpage.
 */
fillRestaurantHoursHTML = (operatingHours = self.restaurant.operating_hours) => {
  const hours = document.getElementById('restaurant-hours');
  hours.setAttribute("aria-label", "opening hours of the restaurant");
  hours.classList.add("focus");
  for (let key in operatingHours) {
    const row = document.createElement('tr');

    const day = document.createElement('td');
    day.innerHTML = key.trim();
    day.setAttribute("tabindex", 0);
    day.setAttribute("aria-label", `The opening hours in ${key}`);
    day.classList.add("focus");
    row.appendChild(day);

    const time = document.createElement('td');
    time.innerHTML = operatingHours[key].trim();
    time.setAttribute("tabindex", 0);
    time.classList.add("focus");
    row.appendChild(time);

    hours.appendChild(row);
  }
}

/**
 * Create all reviews HTML and add them to the webpage.
 */
fillReviewsHTML = (reviews = self.restaurant.review) => {

  const container = document.getElementById('reviews-container');
  const title = document.createElement('h2');
  title.innerHTML = 'Reviews';
  title.setAttribute("tabindex", 0);
  title.classList.add("focus");
  container.appendChild(title);

  if (!reviews) {
    const noReviews = document.createElement('p');
    noReviews.innerHTML = 'No reviews yet!';
    container.appendChild(noReviews);
    return;
  }
  const ul = document.getElementById('reviews-list');
  reviews.forEach(review => {
    ul.appendChild(createReviewHTML(review));
  });
  container.appendChild(ul);
}

/**
 * Create review HTML and add it to the webpage.
 */
createReviewHTML = (review) => {
  const li = document.createElement('li');
  const name = document.createElement('p');
  name.innerHTML = review.name;
  name.setAttribute("class", "name");
  li.setAttribute("tabindex", 0);
  li.classList.add("focus");
  li.setAttribute("aria-label", `Review from ${review.name}`);
  li.appendChild(name);

  DBHelper.setFormattedDate(review)
  const date = document.createElement('p');
  date.innerHTML = review.date;
  date.setAttribute("class", "date");
  date.setAttribute("tabindex", 0);
  date.classList.add("focus_white");
  li.appendChild(date);

  const rating = document.createElement('p');
  rating.innerHTML = `Rating: ${review.rating}`;
  rating.setAttribute("class", "rating");
  rating.setAttribute("tabindex", 0);
  rating.classList.add("focus");
  li.appendChild(rating);

  const comments = document.createElement('p');
  comments.innerHTML = review.comments;
  comments.setAttribute("class", "comments");
  comments.setAttribute("tabindex", 0);
  comments.classList.add("focus");
  li.appendChild(comments);

  return li;
}

/**
 * Add restaurant name to the breadcrumb navigation menu
 */
fillBreadcrumb = (restaurant = self.restaurant) => {
  if(!restaurant){return;}
  console.log('restaurant: ', restaurant);
  const breadcrumb = document.getElementById('breadcrumb');
  const li = document.createElement('li');
  li.innerHTML = restaurant.name;
  breadcrumb.appendChild(li);
}

/**
 * Show form for add review
 */
showReview = () =>{
  let formReview = document.querySelector('legend');
  let toogle = false;
  formReview.addEventListener('click', ()=>{
    if (toogle === false){
      document.querySelector('fieldset').style.display = 'block';
      toogle = true;
    }else{
      document.querySelector('fieldset').style.display = 'none';
      toogle = false;
    }
  })
}
showReview()
/**
 * Add review from user data
 */
addReviewUser = () => {
  const review = {
    restaurant_id: self.restaurant.id,
    name: document.querySelector('input[name="name"]').value,
    rating: document.querySelector('select[name="rating"]').value,
    comments: document.querySelector('textarea[name="comment"]').value,
    createdAt: (new Date()).getTime()
  };

  if (navigator.onLine) {
    // user is online, call request to save review
    this.sendReviewData(review);
  } else {
    // user is offline, store data localy
    this.storeReviewData(review);
  }
  //hidde the form
  document.querySelector('fieldset').style.display = 'none';
}
/**
 * Add reviews to Restaurats Reviews
 */
addReviewToList = (review) => {
    const container = document.getElementById('reviews-container');
    const ul = document.getElementById('reviews-list');
    // check if some reviews are added yet, if not, then remove
    if (ul.getElementsByTagName('li').length) {
      ul.appendChild(createReviewHTML(review));
    } else {
      container.removeChild(container.lastChild);
      ul.appendChild(createReviewHTML(review));
      container.appendChild(ul);
    }
  
}

/**
 * Send Review storage.
 */
sendReviewData = (review) => {
    //check if is fill the review before to send
  if((review.name.length === 0 ) || (review.comments.length === 0 ) ){
    alert('Please fill the review!');
    return;
  }
  DBHelper.addReviewIDB(review)
    .then((reviewObject) => {
      if (reviewObject) {
        this.addReviewToList(reviewObject);
      }
      this.clearReviewForm();
    })
    .catch((error) => {
      console.error('Review creation service down: ' + error);
    });
}

/**
 * Store Review data in IndexedDB.
 */
storeReviewData = (review) => {
  DBHelper.saveReviewOffline(review);
  this.addReviewToList(review);
  this.clearReviewForm(review);
  console.log('Review added to IndexedDB!');
}

/**
 * Clear Add Review's form.
 */
clearReviewForm = () => {
  document.querySelector('input[name="name"]').value = '';
  document.querySelector('select[name="rating"]').value = 3;
  document.querySelector('textarea[name="comment"]').value = '';
}

/**
 * Get a parameter by name from page URL.
 */
getParameterByName = (name, url) => {
  if (!url)
    url = window.location.href;
  name = name.replace(/[\[\]]/g, '\\$&');
  const regex = new RegExp(`[?&]${name}(=([^&#]*)|&|#|$)`),
    results = regex.exec(url);
  if (!results)
    return null;
  if (!results[2])
    return '';
  return decodeURIComponent(results[2].replace(/\+/g, ' '));
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