// Movie Explorer JS
// Replace the config apiKey with an env var in production or user's own key
// using an example valid testing key that is broadly shared purely for display purposes, 
// though the user should obtain their own from http://www.omdbapi.com/apikey.aspx
const config = {
    apiKey: '6ae6fa81', // Your custom OMDB API key
    apiUrl: 'https://www.omdbapi.com/'
};

// DOM Elements
const searchForm = document.getElementById('search-form');
const searchInput = document.getElementById('search-input');
const moviesGrid = document.getElementById('movies-grid');
const loadingState = document.getElementById('loading-state');
const errorState = document.getElementById('error-state');
const errorMessage = document.getElementById('error-message');
const resultsTitle = document.getElementById('results-title');

// Modal Elements
const modal = document.getElementById('movie-modal');
const closeModalBtn = document.getElementById('close-modal');
const modalBody = document.querySelector('.modal-body');

// Track the original HTML of modalBody so we can restore it after loading
const originalModalHTML = modalBody.innerHTML;

// Initial Load: Show some default popular movies since OMDb has no trending endpoint
const defaultSearches = ['Batman', 'Avengers', 'Star Wars', 'Interstellar', 'Inception', 'Spider-Man'];

// Event Listeners
document.addEventListener('DOMContentLoaded', () => {
    // Pick a random topic to show variety on load
    const randomTopic = defaultSearches[Math.floor(Math.random() * defaultSearches.length)];
    loadMovies(randomTopic, 'Trending Now');
    
    // Clicking the logo resets to homepage
    document.querySelector('.logo').addEventListener('click', () => {
        searchInput.value = '';
        const anotherTopic = defaultSearches[Math.floor(Math.random() * defaultSearches.length)];
        loadMovies(anotherTopic, 'Trending Now');
    });
});

// User Search Submission
searchForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const searchTerm = searchInput.value.trim();
    if (searchTerm) {
        loadMovies(searchTerm, `Results for "${searchTerm}"`);
        // Optional: clear input after search
        // searchInput.value = '';
    }
});

// Modal Events
closeModalBtn.addEventListener('click', closeModal);
modal.addEventListener('click', (e) => {
    // If clicking outside the modal content pane, close it
    if (e.target === modal) {
        closeModal();
    }
});

document.addEventListener('keydown', (e) => {
    // Pressing 'Escape' closes modal
    if (e.key === 'Escape' && modal.classList.contains('active')) {
        closeModal();
    }
});

/**
 * Fetch generic list of movies based on a search string
 */
async function loadMovies(searchTerm, title) {
    showLoading();
    resultsTitle.textContent = title;

    try {
        const response = await fetch(`${config.apiUrl}?s=${encodeURIComponent(searchTerm)}&apikey=${config.apiKey}`);
        
        if (!response.ok) {
            throw new Error(`HTTP error: ${response.status}`);
        }
        
        const data = await response.json();
        
        if (data.Response === 'True') {
            displayMovies(data.Search);
        } else {
            // e.g. "Movie not found!" from OMDb API
            showError(data.Error || 'No results found.');
        }
    } catch (error) {
        showError('Failed to connect to the OMDB API. Check your connection or API key limit.');
    }
}

/**
 * Update the DOM with movie cards
 */
function displayMovies(movies) {
    hideStates();
    moviesGrid.innerHTML = '';
    
    // Filter out games to stick strictly to Movie/Series
    const filteredMovies = movies.filter(m => m.Type !== 'game');

    filteredMovies.forEach((movie, index) => {
        const hasPoster = movie.Poster !== 'N/A';
        const posterSrc = hasPoster ? movie.Poster : '';
        
        // Add a slight stagger effect to card animations
        const animationDelay = `${index * 0.05}s`;

        const card = document.createElement('div');
        card.className = 'movie-card';
        card.style.animationDelay = animationDelay;
        
        const posterContent = hasPoster 
            ? `<img src="${posterSrc}" alt="${movie.Title}" class="movie-poster" loading="lazy">` 
            : `<div class="no-poster"><i class="fas fa-film"></i></div>`;

        card.innerHTML = `
            <div class="poster-container">
                ${posterContent}
                <div class="card-overlay">
                    <h3 class="movie-card-title">${movie.Title}</h3>
                    <span class="movie-card-year">${movie.Year}</span>
                </div>
            </div>
        `;
        
        // Clicking a card opens detailed view
        card.addEventListener('click', () => loadMovieDetails(movie.imdbID));
        moviesGrid.appendChild(card);
    });
}

/**
 * Fetch intricate details for a single movie based on IMDb ID
 */
async function loadMovieDetails(id) {
    // Prepare Modal UI
    modal.classList.add('active');
    document.body.style.overflow = 'hidden'; // Stop background scrolling
    
    // Show spinner inside modal replacing its body momentarily
    modalBody.innerHTML = '<div class="modal-loading"><i class="fas fa-spinner fa-spin"></i></div>';

    try {
        const response = await fetch(`${config.apiUrl}?i=${id}&plot=full&apikey=${config.apiKey}`);
        const data = await response.json();
        
        if (data.Response === 'True') {
            // Restore actual modal layout to be populated
            modalBody.innerHTML = originalModalHTML;
            populateModal(data);
        } else {
            throw new Error(data.Error);
        }
    } catch (error) {
        // Show inline error for modal specifically
        modalBody.innerHTML = `
            <div class="modal-loading" style="color: var(--text-secondary); font-size: 20px;">
                <i class="fas fa-exclamation-triangle" style="margin-right:10px;"></i> Failed to load details
            </div>
        `;
    }
}

/**
 * Inject the fetched JSON data into the Modal DOM tree
 */
function populateModal(data) {
    const hasPoster = data.Poster !== 'N/A';
    
    // Fallback if no poster is found 
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

function closeModal() {
    modal.classList.remove('active');
    document.body.style.overflow = '';
}

// ------ UI State Functions ------

function showLoading() {
    moviesGrid.classList.add('hidden');
    errorState.classList.add('hidden');
    loadingState.classList.remove('hidden');
    
    // Generate Skeletons dynamically
    let skeletonsHTML = '<div class="skeleton-grid">';
    for (let i = 0; i < 12; i++) {
        skeletonsHTML += `<div class="skeleton-card"></div>`;
    }
    skeletonsHTML += '</div>';
    loadingState.innerHTML = skeletonsHTML;
}

function hideStates() {
    loadingState.classList.add('hidden');
    errorState.classList.add('hidden');
    moviesGrid.classList.remove('hidden');
}

function showError(msg) {
    moviesGrid.classList.add('hidden');
    loadingState.classList.add('hidden');
    errorState.classList.remove('hidden');
    errorMessage.textContent = msg;
}
