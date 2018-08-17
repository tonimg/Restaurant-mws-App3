let restaurant,map;const myLazyLoad=new LazyLoad({elements_selector:".myLazyLoad"});let showMap=document.querySelector("#show-map");function lazyLoadImages(){var e=[].slice.call(document.querySelectorAll("myLazyLoad"));if("IntersectionObserver"in window){let t=new IntersectionObserver(function(e,a){e.forEach(function(e){if(e.isIntersecting){let a=e.target;a.src=a.dataset.src,a.classList.remove("myLazyLoad"),t.unobserve(a)}})});e.forEach(function(e){t.observe(e)})}else console.log("lazy load for images did not succeed")}showMap.addEventListener("click",()=>{document.getElementById("map-container").style.height="400px",showMap.style.display="none"}),window.initMap=(()=>{fetchRestaurantFromURL((e,t)=>{e?console.error(e):(self.map=new google.maps.Map(document.getElementById("map"),{zoom:14,center:t.latlng,scrollwheel:!1}),fillBreadcrumb(),DBHelper.mapMarkerForRestaurant(self.restaurant,self.map))})}),fetchRestaurantFromURL=(e=>{if(self.restaurant)return void e(null,self.restaurant);const t=getParameterByName("id");t?(DBHelper.fetchRestaurantById(t,(t,a)=>{self.restaurant=a,a?(fillRestaurantHTML(),e(null,a)):console.error(t)}),DBHelper.fetchReviewsByRestaurantId(t,(e,t)=>{self.restaurant.reviews=t,t?fillReviewsHTML(t):console.error(e)})):(error="No restaurant id in URL",e(error,null))}),fillRestaurantHTML=((e=self.restaurant)=>{const t=document.getElementById("restaurant-name");t.innerHTML=e.name,t.classList.add("focus");const a=document.getElementById("restaurant-address");a.innerHTML=e.address,a.classList.add("focus"),a.setAttribute("arial-label","addres of the restaurant"+e.address);const n=document.getElementById("restaurant-img");n.className="restaurant-img myLazyLoad",n.alt=`${e.name}`,n.src=DBHelper.imageUrlForRestaurant(e),n.srcset=`./assets/img/${e.id}.jpg, ./assets/img/${e.id}-s.jpg 1x, ./assets/img/${e.id}-s@2x.jpg 2x`,document.getElementById("restaurant-cuisine").innerHTML=e.cuisine_type,e.operating_hours&&fillRestaurantHoursHTML()}),fillRestaurantHoursHTML=((e=self.restaurant.operating_hours)=>{const t=document.getElementById("restaurant-hours");t.setAttribute("aria-label","opening hours of the restaurant"),t.classList.add("focus");for(let a in e){const n=document.createElement("tr"),r=document.createElement("td");r.innerHTML=a.trim(),r.setAttribute("tabindex",0),r.setAttribute("aria-label",`The opening hours in ${a}`),r.classList.add("focus"),n.appendChild(r);const s=document.createElement("td");s.innerHTML=e[a].trim(),s.setAttribute("tabindex",0),s.classList.add("focus"),n.appendChild(s),t.appendChild(n)}}),fillReviewsHTML=((e=self.restaurant.review)=>{const t=document.getElementById("reviews-container"),a=document.createElement("h2");if(a.innerHTML="Reviews",a.setAttribute("tabindex",0),a.classList.add("focus"),t.appendChild(a),!e){const e=document.createElement("p");return e.innerHTML="No reviews yet!",void t.appendChild(e)}const n=document.getElementById("reviews-list");e.forEach(e=>{n.appendChild(createReviewHTML(e))}),t.appendChild(n)}),createReviewHTML=(e=>{const t=document.createElement("li"),a=document.createElement("p");a.innerHTML=e.name,a.setAttribute("class","name"),t.setAttribute("tabindex",0),t.classList.add("focus"),t.setAttribute("aria-label",`Review from ${e.name}`),t.appendChild(a),DBHelper.setFormattedDate(e);const n=document.createElement("p");n.innerHTML=e.date,n.setAttribute("class","date"),n.setAttribute("tabindex",0),n.classList.add("focus_white"),t.appendChild(n);const r=document.createElement("p");r.innerHTML=`Rating: ${e.rating}`,r.setAttribute("class","rating"),r.setAttribute("tabindex",0),r.classList.add("focus"),t.appendChild(r);const s=document.createElement("p");return s.innerHTML=e.comments,s.setAttribute("class","comments"),s.setAttribute("tabindex",0),s.classList.add("focus"),t.appendChild(s),t}),fillBreadcrumb=((e=self.restaurant)=>{if(!e)return;console.log("restaurant: ",e);const t=document.getElementById("breadcrumb"),a=document.createElement("li");a.innerHTML=e.name,t.appendChild(a)}),showReview=(()=>{let e=document.querySelector("legend"),t=!1;e.addEventListener("click",()=>{!1===t?(document.querySelector("fieldset").style.display="block",t=!0):(document.querySelector("fieldset").style.display="none",t=!1)})}),showReview(),addReviewUser=(()=>{const e={restaurant_id:self.restaurant.id,name:document.querySelector('input[name="name"]').value,rating:document.querySelector('select[name="rating"]').value,comments:document.querySelector('textarea[name="comment"]').value,createdAt:(new Date).getTime()};navigator.onLine?this.sendReviewData(e):this.storeReviewData(e),document.querySelector("fieldset").style.display="none"}),addReviewToList=(e=>{const t=document.getElementById("reviews-container"),a=document.getElementById("reviews-list");a.getElementsByTagName("li").length?a.appendChild(createReviewHTML(e)):(t.removeChild(t.lastChild),a.appendChild(createReviewHTML(e)),t.appendChild(a))}),sendReviewData=(e=>{0!==e.name.length&&0!==e.comments.length?DBHelper.addReviewIDB(e).then(e=>{e&&this.addReviewToList(e),this.clearReviewForm()}).catch(e=>{console.error("Review creation service down: "+e)}):alert("Please fill the review!")}),storeReviewData=(e=>{DBHelper.saveReviewOffline(e),this.addReviewToList(e),this.clearReviewForm(e),console.log("Review added to IndexedDB!")}),clearReviewForm=(()=>{document.querySelector('input[name="name"]').value="",document.querySelector('select[name="rating"]').value=3,document.querySelector('textarea[name="comment"]').value=""}),getParameterByName=((e,t)=>{t||(t=window.location.href),e=e.replace(/[\[\]]/g,"\\$&");const a=new RegExp(`[?&]${e}(=([^&#]*)|&|#|$)`).exec(t);return a?a[2]?decodeURIComponent(a[2].replace(/\+/g," ")):"":null});