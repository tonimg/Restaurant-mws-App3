/**
 * Common database helper functions.
 */

class DBHelper {

  /**
   * API URL fecth
   * Server addres to make request.
   */
  static get DATABASE_URL() {
    const port = 1337 // Change this to your server port
    return `http://localhost:${port}`;
  }

  /**
   * Created Store.
   */
  static get openDatabase() {
    return idb.open('restaurants', 1, function (upgradeDb) {
      upgradeDb.createObjectStore('restaurants', { keyPath: 'id' });
      upgradeDb.createObjectStore('reviews', { keyPath: 'id' });
    });
  }
  /**
   * Fetch all restaurants.
   */
  static fetchRestaurants(callback) {
    DBHelper.openDatabase
      .then(db => {
        const tx = db.transaction('restaurants', 'readwrite');
        const store = tx.objectStore('restaurants');
        store.getAll()
          .then(results => {
            return fetch(`${DBHelper.DATABASE_URL}/restaurants`)
              .then(response => { return response.json(); })
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
   * Fetch all reviews.
   */
  static fetchReviews(callback) {
    DBHelper.openDatabase
      .then(db => {
        const tx = db.transaction('reviews', 'readwrite');
        const store = tx.objectStore('reviews');
        store.getAll()
          .then(results => {
            return fetch(`${DBHelper.DATABASE_URL}/reviews`)
              .then(response => { return response.json(); })
              .then(reviews => {
                const tx = db.transaction('reviews', 'readwrite');
                const store = tx.objectStore('reviews');
                restaurants.forEach(reviews => {
                  store.put(reviews);
                })
                callback(null, reviews);
              })
              .catch(error => {
                // Unable to fetch from network
                callback(error, null);
              });
          })

      });
  }
  
static fetchReviewsByRestaurantId(id, callback) {
  console.log('id: ', id);
  // fetch all restaurants with proper error handling.
  DBHelper.fetchReviews((error, reviews) => {
    if (error) {
      callback(error, null);
    } else {
      const review = reviews.find(r => r.id == id);
      if (review) { // Got the restaurant
        callback(null, review);
      } else { // Restaurant does not exist in the database
        callback('Restaurant does not exist', null);
      }
    }
  });
}
  /**
     * Fetch reviews by id.
     */
  // static fetchReviewsByRestaurantId(id, callback) {
  //   DBHelper.openDatabase
  //     .then(db => {
  //       const tx = db.transaction('reviews', 'readwrite');
  //       const store = tx.objectStore('reviews');
  //       store.getAll()
  //         .then(results => {
  //           console.log('results: ', `${DBHelper.DATABASE_URL}/reviews/?restaurant_id=${id}`);
  //           return fetch(`${DBHelper.DATABASE_URL}/reviews/?restaurant_id=${id}`)
  //             .then(response => { return response.json(); })
  //             .then(reviews => {
  //               const tx = db.transaction('reviews', 'readwrite');
  //               const store = tx.objectStore('reviews');
  //               console.log('reviews: ', reviews);
  //               restaurants.forEach(reviews => {
  //                 self.reviews = reviews;
  //                 store.put(reviews);
  //               })
  //               callback(null, reviews);
  //               console.log('reviews: ', reviews);
  //             })
  //             .catch(error => {
  //               // Unable to fetch from network
  //               callback(error, null);
  //             });
  //         })

  //     });
  // }


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
   * Set Favorite
   */
  static setFavorite(id, favorite) {
    let data = { favorite };
    return fetch(`${DBHelper.DATABASE_URL}/restaurants/${id}`, {
      body: JSON.stringify(data),
      method: 'PUT'
    })
      .then(res => res.json())
      .then(data => {
        DBHelper.openDatabase
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
    return (`./assets/img/${restaurant.photograph}.jpg`);
  }

  /**
   * Map marker for a restaurant.
   */

  static mapMarkerForRestaurant(restaurant, map) {
    const marker = new google.maps.Marker({
      position: restaurant.latlng,
      title: restaurant.name,
      url: DBHelper.urlForRestaurant(restaurant),
      // url: `./restaurant.html?id=${restaurant.id}`,
      map: map,
      animation: google.maps.Animation.DROP
    }
    );
    return marker;
  }

}