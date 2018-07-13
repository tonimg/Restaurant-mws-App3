/**
 * Common database helper functions.
 */

class DBHelper {

  /**
   * API URL fecth
   * Server addres to make request.
   */
  static get DB_URL() {
    const port = 1337 // Change this to your server port
    return `http://localhost:${port}`;
  }

  /**
   * Fetch all restaurants.
   */
  static get dbPromise() {
    return idb.open('restaurants', 1, function (upgradeDb) {
      upgradeDb.createObjectStore('restaurants', { keyPath: 'id' });
      upgradeDb.createObjectStore('reviews', { keyPath: 'id' });
    });
  }

  static fetchRestaurants(callback) {
    DBHelper.dbPromise
      .then(db => {
        if (!db) return;
        const tx = db.transaction('restaurants', 'readwrite');
        const store = tx.objectStore('restaurants');
        store.getAll()
          .then(results => {
            return fetch(DBHelper.DB_URL+`/restaurants`)
              .then(res => {
                return res.json();
              })
              .then(restaurants => {
                const tx = db.transaction('restaurants', 'readwrite');
                const store = tx.objectStore('restaurants');
                restaurants.forEach(restaurant => {
                  store.put(restaurant);
                })
                callback(null, restaurants);
              })
              .catch(error => {
                // Unable to fetch from network
                callback(error, null);
              });
          })

      });
  }

  /**
   * Fetch reviews for restaruants
   */
  static fetchRestaurantReviews(restaurants, callback) {
    DBHelper.dbPromise
      .then(db => {
        if (!db) return;
        const tx = db.transaction('reviews');
        const store = tx.objectStore('reviews');
        store.getAll()
          .then(results => {
            console.log(`${DBHelper.DB_URL}/reviews/?restaurant_id=${restaurant.id}`);
            return fetch(`${DBHelper.DB_URL}/reviews/?restaurant_id=${restaurant.id}`)
              .then(res => {
                return res.json();
              })
              .then(reviews => {
                const tx = db.transaction('reviews', 'readwrite');
                const store = tx.objectStore('reviews');
                restaurants.forEach(reviews => {
                  store.put(reviews);
                })
                callback(null, restaurants);
              })
              .catch(error => {
                callback(error, null);
              });
          })

      });
  }
  /**
   * Submit all Review
   */
  static submitReview(data) {
    return fetch(`${DBHelper.DB_URL}/reviews`, {
      body: JSON.stringify(data),
      headers:{'content-type': 'aplication/json'},
      method: 'POST'
    })
      .then(res => {
        res.json()
          .then(data => {
            DBHelper.dbPromise
              .then(db => {
                if (!db) return;
                const tx = db.transaction('reviews', 'readwrite');
                const store = tx.objectStore('reviews');
                store.put(data);
              });
            return data;
          });
      })
      .catch(error => {
        callback(error, null);
      });
  }
  /**
   * Set Favorite
   */
  static setFavorite(id, favorite){
    let data = { favorite };
    return fetch(`${DBHelper.DB_URL}/restaurants/${id}`, {
      body: JSON.stringify(data),
      method: 'PUT'
    })
    .then(res =>  res.json() )
    .catch(error => console.log(error));
  }

  /**
   * Fetch a restaurant by its ID.
   */
  static fetchRestaurantById(id, callback) {
    // fetch all restaurants with proper error handling.
    DBHelper.fetchRestaurants((error, restaurants) => {
      if (error) {
        callback(error, null);
      } else {
        const restaurant = restaurants.find(r => r.id == id);
        if (restaurant) { // Got the restaurant
          callback(null, restaurant);
        } else { // Restaurant does not exist in the database
          callback('Restaurant does not exist', null);
        }
      }
    });
  }

  /**
   * Fetch restaurants by a cuisine type with proper error handling.
   */
  static fetchRestaurantByCuisine(cuisine, callback) {
    // Fetch all restaurants  with proper error handling
    DBHelper.fetchRestaurants((error, restaurants) => {
      if (error) {
        callback(error, null);
      } else {
        // Filter restaurants to have only given cuisine type
        const results = restaurants.filter(r => r.cuisine_type == cuisine);
        callback(null, results);
      }
    });
  }

  /**
   * Fetch restaurants by a neighborhood with proper error handling.
   */
  static fetchRestaurantByNeighborhood(neighborhood, callback) {
    // Fetch all restaurants
    DBHelper.fetchRestaurants((error, restaurants) => {
      if (error) {
        callback(error, null);
      } else {
        // Filter restaurants to have only given neighborhood
        const results = restaurants.filter(r => r.neighborhood == neighborhood);
        callback(null, results);
      }
    });
  }

  /**
   * Fetch restaurants by a cuisine and a neighborhood with proper error handling.
   */
  static fetchRestaurantByCuisineAndNeighborhood(cuisine, neighborhood, callback) {
    // Fetch all restaurants
    DBHelper.fetchRestaurants((error, restaurants) => {
      if (error) {
        console.log('error: ', error);
        callback(error, null);
      } else {
        // Get all neighborhoods from all restaurants
        let results = restaurants
        if (cuisine != 'all') { // filter by cuisine
          results = results.filter(r => r.cuisine_type == cuisine);
        }
        if (neighborhood != 'all') { // filter by neighborhood
          results = results.filter(r => r.neighborhood == neighborhood);
        }
        callback(null, results);
      }
    });
  }

  /**
   * Fetch all neighborhoods with proper error handling.
   */
  static fetchNeighborhoods(callback) {
    // Fetch all restaurants
    DBHelper.fetchRestaurants((error, restaurants) => {
      if (error) {
        callback(error, null);
      } else {
        // Get all neighborhoods from all restaurants
        const neighborhoods = restaurants.map((v, i) => restaurants[i].neighborhood)
        // Remove duplicates from neighborhoods
        const uniqueNeighborhoods = neighborhoods.filter((v, i) => neighborhoods.indexOf(v) == i)
        callback(null, uniqueNeighborhoods);
      }
    });
  }

  /**
   * Fetch all cuisines with proper error handling.
   */
  static fetchCuisines(callback) {
    // Fetch all restaurants
    DBHelper.fetchRestaurants((error, restaurants) => {
      if (error) {
        callback(error, null);
      } else {
        // Get all cuisines from all restaurants
        const cuisines = restaurants.map((v, i) => restaurants[i].cuisine_type)
        // Remove duplicates from cuisines
        const uniqueCuisines = cuisines.filter((v, i) => cuisines.indexOf(v) == i)
        callback(null, uniqueCuisines);
      }
    });
  }

  /**
   * Restaurant page URL.
   */
  static urlForRestaurant(restaurant) {
    return (`./restaurant.html?id=${restaurant.id}`);
  }

  /**
   * Restaurant image URL.
   */
  static imageUrlForRestaurant(restaurant) {
    return (`./assets/img/${restaurant.photograph}`);
  }

  /**
   * Map marker for a restaurant.
   */

  static mapMarkerForRestaurant(restaurant, map) {
    const marker = new google.maps.Marker({
      position: restaurant.latlng,
      title: restaurant.name,
      url: DBHelper.urlForRestaurant(restaurant),
      map: map,
      animation: google.maps.Animation.DROP
    }
    );
    return marker;
  }

}
