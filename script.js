let usersData = [];
let favoriteUsers = JSON.parse(localStorage.getItem('favoriteUsers')) || [];

const btnGetUsers = document.getElementById('btn-get-users');
const loadingIndicator = document.getElementById('loading');
const errorIndicator = document.getElementById('error');
const controlsPanel = document.getElementById('controls');
const usersContainer = document.getElementById('users-container');
const searchInput = document.getElementById('search-input');
const cityFilter = document.getElementById('city-filter');
const sortSelect = document.getElementById('sort-select');

async function fetchUsers() {
    try {
        usersContainer.innerHTML = '';
        errorIndicator.classList.add('hidden');
        loadingIndicator.classList.remove('hidden');

        const response = await fetch('https://jsonplaceholder.typicode.com/users');

        if (!response.ok) throw new Error('Network response was not ok');

        usersData = await response.json();

        loadingIndicator.classList.add('hidden');
        controlsPanel.classList.remove('hidden');

        populateCityFilter(usersData);
        renderUsers();
    } catch (error) {
        loadingIndicator.classList.add('hidden');
        errorIndicator.classList.remove('hidden');
    }
}

function populateCityFilter(users) {
    // витягуємо тільки унікальні міста для селекта
    const cities = [...new Set(users.map(user => user.address.city))];

    cityFilter.innerHTML = '<option value="All">All cities</option>';

    cities.forEach(city => {
        const option = document.createElement('option');
        option.value = city;
        option.textContent = city;
        cityFilter.append(option);
    });
}

function sortUsers(users, sortType) {
    const sortedUsers = [...users];

    sortedUsers.sort((a, b) => {
        if (sortType === 'name') return a.name.localeCompare(b.name);
        if (sortType === 'username') return a.username.localeCompare(b.username);
        if (sortType === 'city') return a.address.city.localeCompare(b.address.city);
        if (sortType === 'company') return a.company.name.localeCompare(b.company.name);
        return 0;
    });

    return sortedUsers;
}

function renderUsers() {
    usersContainer.innerHTML = '';

    const searchTerm = searchInput.value.toLowerCase();
    const selectedCity = cityFilter.value;
    const sortType = sortSelect.value;

    let filteredUsers = usersData.filter(user => {
        const matchCity = selectedCity === 'All' || user.address.city === selectedCity;

        const matchSearch =
            user.name.toLowerCase().includes(searchTerm) ||
            user.username.toLowerCase().includes(searchTerm) ||
            user.email.toLowerCase().includes(searchTerm) ||
            user.company.name.toLowerCase().includes(searchTerm) ||
            user.address.city.toLowerCase().includes(searchTerm);

        return matchCity && matchSearch;
    });

    filteredUsers = sortUsers(filteredUsers, sortType);

    if (filteredUsers.length === 0) {
        usersContainer.innerHTML = '<p class="empty-state">No users found.</p>';
        return;
    }

    filteredUsers.forEach(user => {
        const card = document.createElement('div');
        card.className = 'card';

        const isFav = favoriteUsers.includes(user.id);

        card.innerHTML = `
            <h3>${user.name} (@${user.username})</h3>
            <p><strong>Email:</strong> ${user.email}</p>
            <p><strong>Phone:</strong> ${user.phone}</p>
            <p><strong>City:</strong> ${user.address.city}</p>
            <p><strong>Company:</strong> ${user.company.name}</p>
            <p><strong>Website:</strong> ${user.website}</p>
            <button class="fav-btn ${isFav ? 'active' : ''}" data-id="${user.id}">
                ${isFav ? 'Remove from favorites' : 'Add to favorites'}
            </button>
        `;

        usersContainer.append(card);
    });

    document.querySelectorAll('.fav-btn').forEach(btn => {
        btn.addEventListener('click', toggleFavorite);
    });
}

function toggleFavorite(event) {
    const btn = event.target;
    const userId = parseInt(btn.dataset.id);

    if (favoriteUsers.includes(userId)) {
        favoriteUsers = favoriteUsers.filter(id => id !== userId);
    } else {
        favoriteUsers.push(userId);
    }

    localStorage.setItem('favoriteUsers', JSON.stringify(favoriteUsers));
    renderUsers();
}

btnGetUsers.addEventListener('click', fetchUsers);
searchInput.addEventListener('input', renderUsers);
cityFilter.addEventListener('change', renderUsers);
sortSelect.addEventListener('change', renderUsers);