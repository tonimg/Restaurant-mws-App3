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
   * Open idb.
   */
  static get dbPromise() {
    return idb.open('restaurants', 1, function (upgradeDb) {
      upgradeDb.createObjectStore('restaurants', { keyPath: 'id' });
      upgradeDb.createObjectStore('reviews', { keyPath: 'id' });
    });
  }

  /**
   * Check idb restaurants
   */
  static checkIDB() {
    return DBHelper.dbPromise
      .then(db => {
        if (!db) return;
        const tx = db.transaction('restaurants', 'readwrite');
        const store = tx.objectStore('restaurants');
        return store.getAll()
          .then(restaurant => {
            if (restaurant.lenght > 0) {
              return callback(null, restaurant)
            }
          })
      })
  }

  /**
   * Fetch all restaurants.
   */
  static fetchRestaurants(callback) {
    fetch(`${DBHelper.DB_URL}/restaurants`)
      .then(res => { return res.json(); })
      .then(restaurants => {
        DBHelper.dbPromise
          .then(db => {
            if (!db) { return db; }
            const tx = db.transaction('restaurants', 'readwrite');
            const store = tx.objectStore('restaurants');
            restaurants.forEach(restaurant => {
              store.put(restaurant);
            })
          })
        callback(null, restaurants);
      })
      .catch(error => {
        // Unable to fetch from network
        callback(error, null);
      });
  }
  /**
    * Check idb restaurants reviews
    */
  static checkIDBReviews() {
    return DBHelper.dbPromise
      .then(db => {
        if (!db) return;
        const tx = db.transaction('reviews', 'readwrite');
        const store = tx.objectStore('reviews');
        return store.getAll()
          .then(reviews => {
            if (reviews.lenght > 0) {
              return callback(null, reviews)
            }
          })
      })
  }
  /**
   * Fetch reviews for restaruants
   */
  static fetchRestaurantReviews(callback) {
    fetch(`${DBHelper.DB_URL}/reviews/?restaurant_id=${restaurants.id}`)
      .then(res => { return res.json(); })
      .then(reviews => {
        DBHelper.dbPromise
          .then(db => {
            DBHelper.checkIDBReviews();
            const tx = db.transaction('reviews', 'readwrite');
            const store = tx.objectStore('reviews');
            reviews.forEach(reviews => {
              store.put(reviews);
            })
          })
          callback(null, reviews);
        })
        .catch(error => { console.log('error fetch reviews ', error); });
  }
  /**
   * Submit all Review
   */
  static submitReview(data) {
    return fetch(`${DBHelper.DB_URL}/reviews`, {
      body: JSON.stringify(data),
      headers: { 'content-type': 'aplication/json' },
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
  static setFavorite(id, favorite) {
    let data = { favorite };
    return fetch(`${DBHelper.DB_URL}/restaurants/${id}`, {
      body: JSON.stringify(data),
      method: 'PUT'
    })
      .then(res => res.json())
      .then(data => {
        DBHelper.dbPromise
          .then(db => {
            if (!db) return;
            const tx = db.transaction('restaurants', 'readwrite');
            const store = tx.objectStore('restaurants');
            store.put(data);
          });
        return data;
      })
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
