const baseUrl = "https://randomuser.me/api";
const body = document.querySelector("body");
const galleryDiv = document.querySelector("#gallery");
const searchContainer = document.querySelector('.search-container');

let users;
let currentUserIndex;

/**
 * Fetch data and convert it to json from the provided url.
 *
 * @param url
 * @return {Promise<?>>} json response
 */
function fetchData(url) {
    return fetch(url)
        .then(checkStatus)
        .then(response => response.json())
        .catch(error => console.log("Error occured while processing your request. ", error));

}

/**
 * get users
 * @return {Promise<void | void>}
 */
function getUsers() {
    // initialize request
    return fetchData(baseUrl + "/?results=12&nat=us,gb")
        .then(data => data.results)
        .then(data => users = data)
        .catch(error => console.log(error));
}
/**
 * Check if request returns 200 or else
 *
 * @param response
 * @return {Promise<never>|Promise<?>}
 */
function checkStatus(response) {
    if (response.ok) {
        return Promise.resolve(response);
    }

    return Promise.reject(new Error(response.statusText));
}

/**
 * Generate a user html card from the data received
 *
 * @param user
 * @return {string} html card
 */
function generateUserCard(user) {
    return `
        <div class="card">
            <div class="card-img-container">
                <img class="card-img" src="${user.picture.large}" alt="profile picture">
            </div>
            <div class="card-info-container">
                <h3 id="name" class="card-name cap">${user.name.first} ${user.name.last}</h3>
                <p class="card-text">${user.email}</p>
                <p class="card-text cap">${user.location.city}, ${user.location.state}</p>
            </div>
        </div>
    `;
}

/**
 * Display the users at home page
 * @param data list of users
 */
function viewUsers(data) {
    data.forEach(user => {
        const userCard = this.generateUserCard(user);
        galleryDiv.insertAdjacentHTML('beforeend', userCard);
    })
}

/**
 * Convert date to a user friendly format
 * @param date
 * @return {string} date
 */
function formatDate(date) {
    const year = date.slice(0, 4);
    const month = date.slice(5, 7);
    const day = date.slice(8, 10);
    return `${month}/${day}/${year}`;
}

/**
 * Generates html model box with user information
 *
 * @param user single user
 * @return {string} html model
 */
function generateUserModelBox(user) {
    return `
        <div class="modal-container">
            <div class="modal">
                <button type="button" id="modal-close-btn" class="modal-close-btn"><strong>X</strong></button>
                <div class="modal-info-container">
                    <img class="modal-img" src="${user.picture.large}" alt="profile picture">
                    <h3 id="name" class="modal-name cap">${user.name.first} ${user.name.last}</h3>
                    <p class="modal-text">${user.email}</p>
                    <p class="modal-text cap">${user.location.city}</p>
                    <hr>
                    <p class="modal-text">${user.phone}</p>
                    <p class="modal-text">${user.location.street.number}, ${user.location.street.name}, ${user.location.city}, ${user.location.state} ${user.location.postcode}</p>
                    <p class="modal-text">Birthday: ${formatDate(user.dob.date)}</p>
                </div>
            </div>

            <div class="modal-btn-container">
                <button type="button" id="modal-prev" class="modal-prev btn">Prev</button>
                <button type="button" id="modal-next" class="modal-next btn">Next</button>
            </div>
        </div>
    `;
}

/**
 * Display the selected user model at home page
 * @param userIndex index of user selected
 */
function showUserModel(userIndex) {
    const userModel = generateUserModelBox(users[userIndex]);
    body.insertAdjacentHTML('beforeend', userModel);
}

/**
 * Shows next or previous users information inside the model dialog box
 *
 * @param event click event
 */
function toggleUser(event) {
    // show previous user info.
    if (event.target.id === "modal-prev") {
        if (currentUserIndex > 0) {
            currentUserIndex -= 1;
        } else {
            // return to last user
            currentUserIndex = users.length  - 1;
        }
    // shows next user info.
    } else if (event.target.id === "modal-next") {
        if (currentUserIndex < users.length  - 1) {
            currentUserIndex += 1;
        }else {
            // return to first user
            currentUserIndex = 0;
        }
    }

    closeModal();
    showUserModel(currentUserIndex);
}

/**
 * Remove model box from page
 */
function closeModal() {
    const modalContainer = document.querySelector(".modal-container");
    body.removeChild(modalContainer);
}

// Add a search form
function addSearch() {
    searchContainer.innerHTML = `
        <form action="#" method="get">
            <input type="search" id="search-input" class="search-input" placeholder="Search...">
            <input type="submit" value="&#x1F50D;" id="search-submit" class="search-submit">
        </form>
    `;
}

/**
 * Check input string contains valid characters
 *
 * @param {string} searchString
 * @return {boolean}
 */
function validateInput(searchString) {
    if (/[^a-zA-Z0-9]/.test(searchString)) {
        console.log('Invalid characters detected in search field.');
        return false;
    }
    return true;
}

/**
 * Filters by first and lastname
 *
 * @param users
 * @param query
 */
function filterItems(users, query) {
    if (query) {
        return users.filter(user =>
            user.name.first.toLowerCase().indexOf(query.toLowerCase()) !== -1 ||
            user.name.last.toLowerCase().indexOf(query.toLowerCase()) !== -1)
    }
    return null;
}

/**
 * Search in users
 *
 * @param searchValue search query
 */
function searchUsers(searchValue) {
    if (searchValue && validateInput(searchValue)) {
        const list = filterItems(users, searchValue);
        const filteredUsers = [...list];
        if (filteredUsers.length) {
            galleryDiv.innerHTML = '';
            viewUsers(filteredUsers);
        } else {
            galleryDiv.innerHTML = `<h2>No result</h2>`;
        }

    } else {
        galleryDiv.innerHTML = '';
        viewUsers(users)
    }
}

// get users on page load
getUsers()
    .then(users => viewUsers(users))
    .catch(error => console.log(error));

// add search box
addSearch();

// shows the selected user when clicked on a card
galleryDiv.addEventListener("click", event => {
    if (event.target.className !== "gallery") {
        const card = event.target.closest(".card");
        currentUserIndex = [...galleryDiv.children].indexOf(card);
        showUserModel(currentUserIndex);
    }
});

// event handler for model interactions
body.addEventListener('click', function(event) {
    // close model box when clicked to close button and an empty space other than model box
    if (event.target.id === 'modal-close-btn' || event.target.className === 'modal-container') {
        closeModal();
    }
    // handle next and previous user buttons
    if (event.target.id === 'modal-prev' || event.target.id === 'modal-next') {
        toggleUser(event);
    }
});

// search form event handler
searchContainer.addEventListener("submit", event => {
    event.preventDefault();
    const searchValue = event.target.firstElementChild.value.toLowerCase();
    searchUsers(searchValue);searchValue
});