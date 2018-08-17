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
  static get idbPromise() {
    return idb.open('restaurants', 1, function (upgradeDb) {
      switch (upgradeDb.oldVersion) {
        case 0:
          upgradeDb.createObjectStore('restaurants', { keyPath: 'id' });
        case 1:
          upgradeDb.createObjectStore('reviews', { keyPath: 'id' }).createIndex('restaurant_id', 'restaurant_id');
          upgradeDb.createObjectStore('offline-reviews', { keyPath: 'updatedAt' });
      }
    });

  }
  /**
   * Fetch all restaurants.
   */
  static fetchRestaurants(callback) {
    DBHelper.idbPromise
      .then(db => {
        const trans = db.transaction('restaurants');
        const store = trans.objectStore('restaurants');
        store.getAll()
          .then(restaurants => {
            if (restaurants.length > 1) {
              //Get Restaurants from indexDB
              callback(null, restaurants)
            } else {
              //Get from API
              fetch(`${DBHelper.DATABASE_URL}/restaurants`)
                .then(restaurants => restaurants.json())
                .then(restaurants => {
                  const trans = db.transaction('restaurants', 'readwrite');
                  const store = trans.objectStore('restaurants');
                  //console.log('Restaurants saved to IDB
                  restaurants.forEach(restaurant => store.put(restaurant));
                  callback(null, restaurants);
                })
                .catch(err => {
                  callback(err, null)
                })
            }
          })
      })
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
   * Fetch all reviews.
   */
  static fetchReviews(id, callback) {
    DBHelper.idbPromise
      .then(db => {
        if (!db) return;
        // get reviews from IDB
        const tx = db.transaction('reviews', 'readwrite');
        const store = tx.objectStore('reviews');
        store.getAll()
          .then((reviews) => {
            if (reviews.length > 0) {
              //Reviews in IDB
              let storeReviews = [];
              reviews.forEach(review => {
                if (review.restaurant_id == id) storeReviews.push(review);
              })
              /*get offline-reviews IDB if there's an offline submission*/
              const trans = db.transaction('offline-reviews');
              const store = trans.objectStore('offline-reviews');
              store.getAll()
                .then(offlineReviews => {
                  if (offlineReviews.length > 0) {
                    console.log('looping offline-reviews in IDB', offlineReviews);
                    offlineReviews.forEach(offlineReview => {
                      if (offlineReview.restaurant_id == id) storeReviews.push(offlineReview);
                    })
                  }
                  if (storeReviews.length > 0) {
                    callback(null, storeReviews);
                  } else {
                    //fetch from server
                    fetch(`${DBHelper.DATABASE_URL}/reviews/?restaurant_id=${id}`)
                      .then(reviews => reviews.json())
                      .then(reviews => {
                        const trans = db.transaction('reviews', 'readwrite');
                        const store = trans.objectStore('reviews');
                        reviews.forEach(review => store.put(review));
                        callback(null, reviews);
                      })
                      .catch(err => {
                        callback(err, null);
                      })
                  }
                })
            } else {
              //fetch from server
              fetch(`${DBHelper.DATABASE_URL}/reviews/?restaurant_id=${id}`)
                .then(reviews => reviews.json())
                .then(reviews => {
                  //reviews from server
                  const trans = db.transaction('reviews', 'readwrite');
                  const store = trans.objectStore('reviews');
                  reviews.forEach(review => store.put(review));
                  console.log('storing reviews in IDB', reviews);
                  callback(null, reviews);
                })
                .catch(err => {
                  callback(err, null);
                })
            }
          })
          .catch(err => {
            console.log('nothing in IDB');
            return;
          })
      })
  }


  //             callback(null, reviews);
  //           }else{
  //             //Get from API
  //             fetch(`${DBHelper.DATABASE_URL}/reviews/?restaurant_id=${id}`)
  //             .then(res => { return res.json(); })
  //             .then(reviews => {
  //               console.log('reviews: ', reviews);
  //               const tx = db.transaction('reviews', 'readwrite');
  //               const store = tx.objectStore('reviews');
  //               reviews.forEach(reviews => {
  //                 store.put(reviews);
  //               })
  //               callback(null, reviews);
  //             })
  //             .catch(error => {
  //               // Unable to fetch from network
  //               callback(error, null);
  //             });
  //           }
  //         })

  //     });
  // }

  /**
  * Fetch reviews by id.
  */
  static fetchReviewsByRestaurantId(id, callback) {
    // fetch all reviews with proper error handling.
    DBHelper.fetchReviews(id, (error, reviews) => {
      if (error) {
        callback(error, null);
      } else {
        const restaurantId = id => review => review.restaurant_id == id;
        const review = reviews.filter(restaurantId(id));
        if (review) { // Got the review
          callback(null, reviews);
        } else { // Review does not exist in the database
          callback('Review does not exist', null);
        }
      }
    });
  }

  /**
 * Add review
 */
  static addReviewIDB(review) {
    return fetch(`${DBHelper.DATABASE_URL}/reviews`, {
      method: 'POST',
      body: JSON.stringify(review),
      headers: {
        'Accept': 'aplication/json',
        'Content-Type': 'aplication/json'
      }
    })
      .then(res => {
        if (res.ok) {
          return res.json()
            .then(review => {
              console.log('review: ', review);
              // update IdexedDB with latest  review
              return review;
            });
        }
        return Promise.reject(new Error(`Request failed. Returned status of ${response.status}`));
      });
  }

  /**
   * Save Offline the review
   */
  static saveReviewOffline(review) {
    return DBHelper.idbPromise()
      .then(db => {
        if (!db) return;
        const tx = db.transaction('offline-reviews', 'readwrite');
        const store = tx.objectStore('offline-reviews');
        store.put(review);
        return tx.complete;
      }).then(() => {
        console.log('Review saved offline')
      });
  }

  static clearOfflineReviews() {
    DBHelper.idbPromise
      .then(db => {
        const tx = db.transaction('offline-reviews', 'readwrite');
        const store = tx.objectStore('offline-reviews');
        store.clear();
      })
    return;
  }

  /**
   * Set Format Date
   */
  static setFormattedDate(review) {
    const reviewDate = new Date(review.createdAt);
    const date = ('0' + reviewDate.getDate()).slice(-2);
    const month = ('0' + (reviewDate.getMonth() + 1)).slice(-2);
    const year = reviewDate.getFullYear();

    review.date = `${date}/${month}/${year}`;
  }

  /**
   * Set Favorite
   */
  static setFavorite(id, favorite) {
    let data = { favorite };
    return fetch(`${DBHelper.DATABASE_URL}/restaurants/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    })
      .then(res => res.json())
      .then(data => {
        DBHelper.idbPromise
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
    if (!restaurant) { return; }
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