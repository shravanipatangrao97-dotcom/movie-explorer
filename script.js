// Movie Explorer JS
const config = {
    apiKey: '6ae6fa81', // Using the personal user key
    apiUrl: 'https://www.omdbapi.com/'
};

// State Management
let currentMovies = []; // Holds the fetched movies
let isFavoritesView = false; // Tracks if we are viewing the Favorites page

// DOM Elements
const searchForm = document.getElementById('search-form');
const searchInput = document.getElementById('search-input');
const moviesGrid = document.getElementById('movies-grid');
const loadingState = document.getElementById('loading-state');
const errorState = document.getElementById('error-state');
const errorMessage = document.getElementById('error-message');
const emptyFavsState = document.getElementById('empty-favorites');
const resultsTitle = document.getElementById('results-title');
const filterType = document.getElementById('filter-type');
const sortResults = document.getElementById('sort-results');
const themeToggleBtn = document.getElementById('theme-toggle-btn');
const viewFavoritesBtn = document.getElementById('view-favorites-btn');
const homeLink = document.getElementById('home-link');

// Modal Elements
const modal = document.getElementById('movie-modal');
const closeModalBtn = document.getElementById('close-modal');
const modalBody = document.querySelector('.modal-body');
const originalModalHTML = modalBody.innerHTML;

const defaultSearches = ['Batman', 'Avengers', 'Star Wars', 'Interstellar', 'Inception', 'Spider-Man'];

// --- Init ---
document.addEventListener('DOMContentLoaded', () => {
    initTheme();
    const randomTopic = defaultSearches[Math.floor(Math.random() * defaultSearches.length)];
    loadMovies(randomTopic, 'Trending Now');
});

// --- Theme Toggle ---
function initTheme() {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'light') {
        document.body.classList.add('light-theme');
        themeToggleBtn.innerHTML = '<i class="fas fa-moon"></i>';
    }
}

themeToggleBtn.addEventListener('click', () => {
    document.body.classList.toggle('light-theme');
    if (document.body.classList.contains('light-theme')) {
        localStorage.setItem('theme', 'light');
        themeToggleBtn.innerHTML = '<i class="fas fa-moon"></i>';
    } else {
        localStorage.setItem('theme', 'dark');
        themeToggleBtn.innerHTML = '<i class="fas fa-sun"></i>';
    }
});

// --- Navigation & Search ---
homeLink.addEventListener('click', () => goHome());

function goHome() {
    isFavoritesView = false;
    searchInput.value = '';
    filterType.value = '';
    sortResults.value = '';
    const anotherTopic = defaultSearches[Math.floor(Math.random() * defaultSearches.length)];
    loadMovies(anotherTopic, 'Trending Now');
    viewFavoritesBtn.classList.remove('active-tab');
}

searchForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const searchTerm = searchInput.value.trim();
    if (searchTerm) {
        isFavoritesView = false;
        viewFavoritesBtn.classList.remove('active-tab');
        loadMovies(searchTerm, `Results for "${searchTerm}"`);
    }
});

// --- API Fetch ---
async function loadMovies(searchTerm, title) {
    showLoading();
    resultsTitle.textContent = title;

    try {
        const response = await fetch(`${config.apiUrl}?s=${encodeURIComponent(searchTerm)}&apikey=${config.apiKey}`);
        if (!response.ok) throw new Error(`HTTP error: ${response.status}`);
        
        const data = await response.json();
        if (data.Response === 'True') {
            currentMovies = data.Search;
            applyFiltersAndSort();
        } else {
            currentMovies = [];
            showError(data.Error || 'No results found.');
        }
    } catch (error) {
        currentMovies = [];
        showError('Failed to connect to the OMDB API. Check your connection or API key limit.');
    }
}

// --- Filter & Sort Logic ---
filterType.addEventListener('change', applyFiltersAndSort);
sortResults.addEventListener('change', applyFiltersAndSort);

function applyFiltersAndSort() {
    let filtered = [...currentMovies];

    // Filter by Type
    const type = filterType.value;
    if (type) {
        filtered = filtered.filter(m => m.Type.toLowerCase() === type);
    } else {
        // Exclude games by default
        filtered = filtered.filter(m => m.Type.toLowerCase() !== 'game');
    }

    // Sort Results
    const sortVal = sortResults.value;
    if (sortVal) {
        filtered.sort((a, b) => {
            const yearA = parseInt(a.Year.substring(0, 4)) || 0;
            const yearB = parseInt(b.Year.substring(0, 4)) || 0;
            
            switch (sortVal) {
                case 'year-desc': return yearB - yearA;
                case 'year-asc': return yearA - yearB;
                case 'title-asc': return a.Title.localeCompare(b.Title);
                case 'title-desc': return b.Title.localeCompare(a.Title);
            }
            return 0;
        });
    }

    if (filtered.length === 0) {
        if (isFavoritesView && currentMovies.length === 0) {
            showEmptyFavs();
        } else {
            showError("No matching items found for your filters.");
        }
    } else {
        displayMovies(filtered);
    }
}

// --- Display Rendering ---
function displayMovies(movies) {
    hideStates();
    moviesGrid.innerHTML = '';

    const favorites = getFavorites();

    movies.forEach((movie, index) => {
        const hasPoster = movie.Poster !== 'N/A';
        const posterSrc = hasPoster ? movie.Poster : '';
        const animationDelay = `${index * 0.03}s`;

        const isFav = favorites.some(fav => fav.imdbID === movie.imdbID);

        const card = document.createElement('div');
        card.className = 'movie-card';
        card.style.animationDelay = animationDelay;
        
        const posterContent = hasPoster 
            ? `<img src="${posterSrc}" alt="${movie.Title}" class="movie-poster" loading="lazy">` 
            : `<div class="no-poster"><i class="fas fa-film"></i></div>`;

        card.innerHTML = `
            <div class="poster-container" onclick="loadMovieDetails('${movie.imdbID}')">
                ${posterContent}
                <button class="fav-btn-overlay" aria-label="Toggle Favorite" onclick="event.stopPropagation(); toggleFavorite('${movie.imdbID}', ${index})">
                    <i class="${isFav ? 'fas' : 'far'} fa-heart"></i>
                </button>
                <div class="card-overlay">
                    <h3 class="movie-card-title">${movie.Title}</h3>
                    <span class="movie-card-year">${movie.Year} <span style="color:#aaa;font-size:12px;text-transform:capitalize;margin-left:5px;">• ${movie.Type}</span></span>
                </div>
            </div>
        `;
        
        moviesGrid.appendChild(card);
    });
}

// --- Favorites Feature ---
function getFavorites() {
    return JSON.parse(localStorage.getItem('my_favorites')) || [];
}

window.toggleFavorite = function(imdbID, sourceIndex) {
    let favorites = getFavorites();
    const movieObj = currentMovies.find(m => m.imdbID === imdbID) || favorites.find(m => m.imdbID === imdbID);
    
    if (!movieObj) return;

    const existsIndex = favorites.findIndex(fav => fav.imdbID === imdbID);
    if (existsIndex > -1) {
        favorites.splice(existsIndex, 1); // remove
    } else {
        favorites.push(movieObj); // add
    }

    localStorage.setItem('my_favorites', JSON.stringify(favorites));

    // If currently in Favorites view, refresh the list completely
    if (isFavoritesView) {
        currentMovies = favorites;
        applyFiltersAndSort();
    } else {
        // Find the specific button in DOM and toggle class directly
        const buttons = document.querySelectorAll('.fav-btn-overlay i');
        if (buttons[sourceIndex]) {
            if (existsIndex > -1) {
                buttons[sourceIndex].className = 'far fa-heart';
            } else {
                buttons[sourceIndex].className = 'fas fa-heart';
            }
        }
    }
};

viewFavoritesBtn.addEventListener('click', () => {
    isFavoritesView = true;
    viewFavoritesBtn.classList.add('active-tab');
    searchInput.value = '';
    filterType.value = '';
    sortResults.value = '';
    resultsTitle.textContent = "My Favorites";
    
    currentMovies = getFavorites();
    if (currentMovies.length === 0) {
        showEmptyFavs();
    } else {
        applyFiltersAndSort();
    }
});

function showEmptyFavs() {
    moviesGrid.classList.add('hidden');
    loadingState.classList.add('hidden');
    errorState.classList.add('hidden');
    emptyFavsState.classList.remove('hidden');
}


// --- Modal Features ---
async function loadMovieDetails(id) {
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
    modalBody.innerHTML = '<div class="modal-loading"><i class="fas fa-spinner fa-spin"></i></div>';
    try {
        const response = await fetch(`${config.apiUrl}?i=${id}&plot=full&apikey=${config.apiKey}`);
        const data = await response.json();
        if (data.Response === 'True') {
            modalBody.innerHTML = originalModalHTML;
            populateModal(data);
        } else throw new Error(data.Error);
    } catch (error) {
        modalBody.innerHTML = `<div class="modal-loading" style="color: var(--text-secondary); font-size: 20px;">
            <i class="fas fa-exclamation-triangle" style="margin-right:10px;"></i> Failed to load details
        </div>`;
    }
}

function populateModal(data) {
    const hasPoster = data.Poster !== 'N/A';
    const emptyPosterSVG = 'data:image/svg+xml;charset=UTF-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22200%22%20height%3D%22300%22%20style%3D%22background%3A%232a2a2a%22%3E%3C%2Fsvg%3E';

    document.getElementById('modal-img').src = hasPoster ? data.Poster : emptyPosterSVG;
    document.getElementById('modal-title').textContent = data.Title;
    document.querySelector('#modal-year span').textContent = data.Year;
    document.querySelector('#modal-runtime span').textContent = data.Runtime;
    document.querySelector('#modal-rating span').textContent = data.imdbRating;
    document.getElementById('modal-genre').textContent = data.Genre;
    document.getElementById('modal-desc').textContent = data.Plot === 'N/A' ? 'No plot available.' : data.Plot;
    document.getElementById('modal-actors').textContent = data.Actors;
    document.getElementById('modal-directors').textContent = data.Director;
}

closeModalBtn.addEventListener('click', closeModal);
modal.addEventListener('click', e => { if (e.target === modal) closeModal(); });
document.addEventListener('keydown', e => { if (e.key === 'Escape' && modal.classList.contains('active')) closeModal(); });

function closeModal() {
    modal.classList.remove('active');
    document.body.style.overflow = '';
}

// --- UI State Management ---
function showLoading() {
    emptyFavsState.classList.add('hidden');
    moviesGrid.classList.add('hidden');
    errorState.classList.add('hidden');
    loadingState.classList.remove('hidden');
    
    let skeletonsHTML = '<div class="skeleton-grid">';
    for (let i = 0; i < 12; i++) skeletonsHTML += `<div class="skeleton-card"></div>`;
    skeletonsHTML += '</div>';
    loadingState.innerHTML = skeletonsHTML;
}

function hideStates() {
    loadingState.classList.add('hidden');
    errorState.classList.add('hidden');
    emptyFavsState.classList.add('hidden');
    moviesGrid.classList.remove('hidden');
}

function showError(msg) {
    moviesGrid.classList.add('hidden');
    loadingState.classList.add('hidden');
    emptyFavsState.classList.add('hidden');
    errorState.classList.remove('hidden');
    errorMessage.textContent = msg;
}
