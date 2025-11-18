// --- Configuration Constants ---
const API_CONFIG = {
  KEY: '9220d85da653eaa9484bdfafd973a3ba',
  BASE_URL: 'https://api.themoviedb.org/3',
  IMG_URL: 'https://image.tmdb.org/t/p/w500',
  IMG_ORIGINAL: 'https://image.tmdb.org/t/p/original',
};

// --- State Variables ---
let currentItem = null;
let currentTheme = 'dark';
let currentSeasons = [];
let currentSeasonNumber = 1;
let currentEpisodes = [];
let currentEpisodeNumber = 1;

// --- Utility Functions ---

/**
 * Shows loading screen
 */
function showLoading() {
  document.getElementById('loading-screen').classList.remove('hidden');
}

// --- Utility Functions ---

/**
 * Shows loading screen
 */
function showLoading() {
  document.getElementById('loading-screen').classList.remove('hidden');
}

/**
 * Hides loading screen
 */
function hideLoading() {
  document.getElementById('loading-screen').classList.add('hidden');
}

/**
 * Displays trending movies in 6x4 grid layout
 */
function displayTrendingMoviesGrid(items, containerId) {
  const container = document.getElementById(containerId);
  if (!container) return;

  if (!items || items.length === 0) {
    container.innerHTML = `
      <div class="empty-section" style="grid-column: 1 / -1; text-align: center; padding: 40px; color: var(--text-muted);">
        <i class="fas fa-film" style="font-size: 3rem; margin-bottom: 1rem;"></i>
        <p>No trending movies available at the moment.</p>
      </div>
    `;
    return;
  }

  container.innerHTML = '';
  const moviesToShow = items.slice(0, 24); // Exactly 24 movies for 6x4 grid
  
  moviesToShow.forEach(item => {
    const card = createTrendingMediaCard(item);
    if (card) container.appendChild(card);
  });
}

/**
 * Creates a trending media card element for the 6x4 grid
 */
function createTrendingMediaCard(item) {
  if (!item.poster_path) return null;

  const card = document.createElement('div');
  card.className = 'trending-media-card';
  card.setAttribute('role', 'button');
  card.setAttribute('tabindex', '0');
  card.setAttribute('aria-label', `View details for ${item.title || item.name}`);
  
  // Extract year from release_date or first_air_date
  const releaseYear = item.release_date 
    ? new Date(item.release_date).getFullYear() 
    : item.first_air_date 
    ? new Date(item.first_air_date).getFullYear() 
    : 'N/A';
  
  const rating = (item.vote_average / 2).toFixed(1);
  
  card.innerHTML = `
    <div class="trending-poster-container">
      <img src="${API_CONFIG.IMG_URL}${item.poster_path}" 
           alt="Poster for ${item.title || item.name}" 
           class="trending-media-poster"
           loading="lazy" 
           onerror="this.src='data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjMwMCIgdmlld0JveD0iMCAwIDIwMCAzMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIyMDAiIGhlaWdodD0iMzAwIiBmaWxsPSIjMkQyRDJEIi8+CjxwYXRoIGQ9Ik03NSA5MEgxMjVWMTEwSDc1VjkwWk03NSAxMzBIMTI1VjE1MEg3NVYxMzBaTTc1IDE3MEgxMjVWMTkwSDc1VjE3MFoiIGZpbGw9IiM2QzZDNkMiLz4KPC9zdmc+'"/>
      <div class="trending-quick-rating">
        <i class="fas fa-star"></i>
        <span>${rating}</span>
      </div>
      <div class="trending-overlay">
        <button class="trending-play-btn" onclick="event.stopPropagation(); showDetails(${JSON.stringify(item).replace(/"/g, '&quot;')})">
          <i class="fas fa-play"></i>
        </button>
      </div>
    </div>
    <div class="trending-media-info">
      <h3 class="trending-media-title">${item.title || item.name}</h3>
      <div class="trending-media-meta">
        <div class="trending-rating">
          <span>${renderRating(item.vote_average)}</span>
        </div>
        ${releaseYear !== 'N/A' ? `<span class="trending-year">${releaseYear}</span>` : ''}
      </div>
    </div>
  `;

  // Add click event
  card.onclick = () => showDetails(item);
  card.onkeydown = (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      showDetails(item);
    }
  };

  return card;
}

// ADD THE NEW FUNCTIONS RIGHT HERE:
/**
 * Sets up all event listeners
 */
function setupEventListeners() {
  // Close modals on outside click
  document.addEventListener('click', (e) => {
    const modal = document.getElementById('modal');
    const searchModal = document.getElementById('search-modal');
    const disclaimerModal = document.getElementById('disclaimer-modal');
    
    if (e.target === modal) closeModal();
    if (e.target === searchModal) closeSearchModal();
    if (e.target === disclaimerModal) closeDisclaimerModal();
  });

  // Close modals on Escape key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      closeModal();
      closeSearchModal();
      closeDisclaimerModal();
    }
  });

  // Show back-to-top button on scroll
  window.addEventListener('scroll', () => {
    const backToTop = document.getElementById('back-to-top');
    const navbar = document.querySelector('.navbar');
    
    if (window.scrollY > 300) {
      backToTop.style.display = 'flex';
      navbar.classList.add('scrolled');
    } else {
      backToTop.style.display = 'none';
      navbar.classList.remove('scrolled');
    }
  });

  // Search on Enter key
  const searchInput = document.getElementById('search-input');
  if (searchInput) {
    searchInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') searchTMDB();
    });
  }
}

/**
 * Loads saved theme preference from localStorage
 */
function loadThemePreference() {
  const savedTheme = localStorage.getItem('theme') || 'dark';
  currentTheme = savedTheme;
  document.documentElement.setAttribute('data-theme', savedTheme);
  
  // Update theme toggle icon
  const themeIcon = document.querySelector('.theme-toggle i');
  if (themeIcon) {
    themeIcon.className = savedTheme === 'dark' ? 'fas fa-moon' : 'fas fa-sun';
  }
}

/**
 * Hides loading screen
 */
function hideLoading() {
  document.getElementById('loading-screen').classList.add('hidden');
}

/**
 * Formats date to readable string
 */
function formatDate(dateString) {
  if (!dateString) return 'Unknown';
  const options = { year: 'numeric', month: 'long', day: 'numeric' };
  return new Date(dateString).toLocaleDateString(undefined, options);
}

/**
 * Toggles between dark and light theme
 */
function toggleTheme() {
  const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
  document.documentElement.setAttribute('data-theme', newTheme);
  currentTheme = newTheme;
  
  // Update theme toggle icon
  const themeIcon = document.querySelector('.theme-toggle i');
  themeIcon.className = currentTheme === 'dark' ? 'fas fa-moon' : 'fas fa-sun';
  
  // Save preference to localStorage
  localStorage.setItem('theme', newTheme);
}

/**
 * Scrolls to top of page
 */
function scrollToTop() {
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

/**
 * Scrolls to content section
 */
function scrollToContent() {
  document.getElementById('trending-section').scrollIntoView({ 
    behavior: 'smooth' 
  });
}

/**
 * Scrolls media lists horizontally
 */
function scrollList(containerId, distance) {
  const container = document.getElementById(containerId);
  container.scrollBy({ left: distance, behavior: 'smooth' });
}

/**
 * Opens the disclaimer modal
 */
function openDisclaimerModal() {
  document.getElementById('disclaimer-modal').style.display = 'flex';
  document.body.style.overflow = 'hidden';
}

/**
 * Closes the disclaimer modal
 */
function closeDisclaimerModal() {
  document.getElementById('disclaimer-modal').style.display = 'none';
  document.body.style.overflow = 'auto';
}

/**
 * Sets up all event listeners
 */
function setupEventListeners() {
  // Close modals on outside click
  document.addEventListener('click', (e) => {
    const modal = document.getElementById('modal');
    const searchModal = document.getElementById('search-modal');
    const disclaimerModal = document.getElementById('disclaimer-modal');
    
    if (e.target === modal) closeModal();
    if (e.target === searchModal) closeSearchModal();
    if (e.target === disclaimerModal) closeDisclaimerModal();
  });

  // Close modals on Escape key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      closeModal();
      closeSearchModal();
      closeDisclaimerModal();
    }
  });

  // Show back-to-top button on scroll
  window.addEventListener('scroll', () => {
    const backToTop = document.getElementById('back-to-top');
    const navbar = document.querySelector('.navbar');
    
    if (window.scrollY > 300) {
      backToTop.style.display = 'flex';
      navbar.classList.add('scrolled');
    } else {
      backToTop.style.display = 'none';
      navbar.classList.remove('scrolled');
    }
  });

  // Search on Enter key
  const searchInput = document.getElementById('search-input');
  if (searchInput) {
    searchInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') searchTMDB();
    });
  }
}

/**
 * Loads saved theme preference from localStorage
 */
function loadThemePreference() {
  const savedTheme = localStorage.getItem('theme') || 'dark';
  currentTheme = savedTheme;
  document.documentElement.setAttribute('data-theme', savedTheme);
  
  // Update theme toggle icon
  const themeIcon = document.querySelector('.theme-toggle i');
  if (themeIcon) {
    themeIcon.className = savedTheme === 'dark' ? 'fas fa-moon' : 'fas fa-sun';
  }
}

/**
 * Loads saved theme preference from localStorage
 */
function loadThemePreference() {
  const savedTheme = localStorage.getItem('theme') || 'dark';
  currentTheme = savedTheme;
  document.documentElement.setAttribute('data-theme', savedTheme);
  
  // Update theme toggle icon
  const themeIcon = document.querySelector('.theme-toggle i');
  if (themeIcon) {
    themeIcon.className = savedTheme === 'dark' ? 'fas fa-moon' : 'fas fa-sun';
  }
}
// --- TV Series Season/Episode Functions ---

/**
 * Fetches TV series seasons and episodes
 */
async function fetchTVSeasons(tvId) {
  try {
    const response = await fetch(
      `${API_CONFIG.BASE_URL}/tv/${tvId}?api_key=${API_CONFIG.KEY}`
    );
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    
    const data = await response.json();
    return data.seasons || [];
  } catch (error) {
    console.error(`Error fetching TV seasons:`, error);
    return [];
  }
}

/**
 * Fetches episodes for a specific season
 */
async function fetchSeasonEpisodes(tvId, seasonNumber) {
  try {
    const response = await fetch(
      `${API_CONFIG.BASE_URL}/tv/${tvId}/season/${seasonNumber}?api_key=${API_CONFIG.KEY}`
    );
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    
    const data = await response.json();
    return data.episodes || [];
  } catch (error) {
    console.error(`Error fetching season episodes:`, error);
    return [];
  }
}

/**
 * Changes the current season
 */
async function changeSeason(direction) {
  if (!currentSeasons.length) return;
  
  const newSeasonIndex = currentSeasons.findIndex(s => s.season_number === currentSeasonNumber) + direction;
  
  if (newSeasonIndex >= 0 && newSeasonIndex < currentSeasons.length) {
    currentSeasonNumber = currentSeasons[newSeasonIndex].season_number;
    await loadSeasonEpisodes(currentItem.id, currentSeasonNumber);
    updateSeasonNavigation();
  }
}

/**
 * Loads episodes for a season
 */
async function loadSeasonEpisodes(tvId, seasonNumber) {
  const episodes = await fetchSeasonEpisodes(tvId, seasonNumber);
  currentEpisodes = episodes;
  displayEpisodes(episodes);
  document.getElementById('current-season-text').textContent = `Season ${seasonNumber}`;
  
  // Auto-select first episode
  if (episodes.length > 0) {
    selectEpisode(1);
  }
}

/**
 * Displays episodes in the selector with thumbnails
 */
function displayEpisodes(episodes) {
  const container = document.getElementById('episodes-grid');
  container.innerHTML = '';
  
  if (episodes.length === 0) {
    container.innerHTML = `
      <div class="empty-state" style="grid-column: 1 / -1;">
        <i class="fas fa-tv"></i>
        <p>No episodes available for this season</p>
      </div>
    `;
    return;
  }
  
  episodes.forEach(episode => {
    const episodeCard = document.createElement('div');
    episodeCard.className = 'episode-card';
    if (episode.episode_number === currentEpisodeNumber) {
      episodeCard.classList.add('active');
    }
    episodeCard.onclick = () => selectEpisode(episode.episode_number);
    
    // Use episode still if available, otherwise use a placeholder
    const thumbnailUrl = episode.still_path 
      ? `${API_CONFIG.IMG_URL}${episode.still_path}`
      : null;
    
    const rating = episode.vote_average ? episode.vote_average.toFixed(1) : 'N/A';
    
    episodeCard.innerHTML = `
      <div class="episode-thumbnail">
        ${thumbnailUrl 
          ? `<img src="${thumbnailUrl}" alt="${episode.name || 'Episode ' + episode.episode_number}" loading="lazy" />`
          : `<i class="fas fa-play-circle" style="font-size: 2rem;"></i>`
        }
        ${rating !== 'N/A' ? `<div class="episode-rating">${rating}</div>` : ''}
      </div>
      <div class="episode-info">
        <div class="episode-number">Episode ${episode.episode_number}</div>
        <div class="episode-name">${episode.name || 'Episode ' + episode.episode_number}</div>
        ${episode.overview ? `<div class="episode-overview">${episode.overview}</div>` : ''}
        <div class="episode-airdate">${formatDate(episode.air_date)}</div>
      </div>
    `;
    
    container.appendChild(episodeCard);
  });
}

/**
 * Selects an episode
 */
function selectEpisode(episodeNumber) {
  currentEpisodeNumber = episodeNumber;
  
  // Update UI
  const episodeCards = document.querySelectorAll('.episode-card');
  episodeCards.forEach(card => {
    const episodeNumText = card.querySelector('.episode-number').textContent;
    const episodeNum = parseInt(episodeNumText.replace('Episode ', ''));
    card.classList.toggle('active', episodeNum === episodeNumber);
  });
  
  // Update video if it's a TV series
  if (currentItem && (currentItem.media_type === 'tv' || currentItem.name)) {
    changeServer();
  }
}

/**
 * Updates season navigation buttons
 */
function updateSeasonNavigation() {
  const prevBtn = document.getElementById('prev-season-btn');
  const nextBtn = document.getElementById('next-season-btn');
  
  if (!currentSeasons.length) return;
  
  const currentIndex = currentSeasons.findIndex(s => s.season_number === currentSeasonNumber);
  prevBtn.disabled = currentIndex === 0;
  nextBtn.disabled = currentIndex === currentSeasons.length - 1;
}

// --- API Fetching Functions ---

/**
 * Fetches trending movies or TV shows from TMDB.
 */
async function fetchTrending(type) {
  try {
    const response = await fetch(
      `${API_CONFIG.BASE_URL}/trending/${type}/week?api_key=${API_CONFIG.KEY}`
    );
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    
    const data = await response.json();
    return data.results || [];
  } catch (error) {
    console.error(`Error fetching trending ${type}:`, error);
    return [];
  }
}

/**
 * Fetches trending anime by filtering Japanese animation.
 */
async function fetchTrendingAnime() {
  let allResults = [];
  const MAX_PAGES = 3;
  const ANIME_GENRE_ID = 16;

  for (let page = 1; page <= MAX_PAGES; page++) {
    try {
      const response = await fetch(
        `${API_CONFIG.BASE_URL}/trending/tv/week?api_key=${API_CONFIG.KEY}&page=${page}`
      );
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      
      const data = await response.json();
      const filtered = data.results.filter(item =>
        item.original_language === 'ja' &&
        item.genre_ids && item.genre_ids.includes(ANIME_GENRE_ID)
      );
      
      allResults = allResults.concat(filtered);
    } catch (error) {
      console.error(`Error fetching anime page ${page}:`, error);
    }
  }

  return allResults;
}

// --- DOM Manipulation / Display Functions ---

/**
 * Displays the hero banner with random content.
 */
function displayBanner(item) {
  const bannerElement = document.getElementById('banner');
  const titleElement = document.getElementById('banner-title');
  const descElement = document.getElementById('banner-description');
  
  if (item && item.backdrop_path) {
    bannerElement.style.backgroundImage = `url(${API_CONFIG.IMG_ORIGINAL}${item.backdrop_path})`;
    titleElement.textContent = item.title || item.name || 'StreamFlix';
    descElement.textContent = item.overview 
      ? (item.overview.substring(0, 150) + '...') 
      : 'Discover thousands of movies and TV shows';
  }
}

/**
 * Creates a media card element.
 */
function createMediaCard(item) {
  if (!item.poster_path) return null;

  const card = document.createElement('div');
  card.className = 'media-card';
  card.setAttribute('role', 'button');
  card.setAttribute('tabindex', '0');
  
  // Extract year from release_date or first_air_date
  const releaseYear = item.release_date 
    ? new Date(item.release_date).getFullYear() 
    : item.first_air_date 
    ? new Date(item.first_air_date).getFullYear() 
    : 'N/A';
  
  card.innerHTML = `
    <img src="${API_CONFIG.IMG_URL}${item.poster_path}" 
         alt="Poster for ${item.title || item.name}" 
         class="media-poster" />
    <div class="media-info">
      <h3 class="media-title">${item.title || item.name}</h3>
      <div class="media-meta">
        <div class="stars">${renderRating(item.vote_average)}</div>
        <span>${(item.vote_average / 2).toFixed(1)}</span>
        ${releaseYear !== 'N/A' ? `<span class="release-year">${releaseYear}</span>` : ''}
      </div>
    </div>
  `;

  // Add click and keyboard events
  const clickHandler = () => showDetails(item);
  card.onclick = clickHandler;
  card.onkeydown = (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      clickHandler();
    }
  };

  return card;
}

/**
 * Populates a media list with cards.
 */
function displayList(items, containerId) {
  const container = document.getElementById(containerId);
  if (!container) return;

  container.innerHTML = '';
  items.forEach(item => {
    const card = createMediaCard(item);
    if (card) container.appendChild(card);
  });
}

/**
 * Displays trending movies in 6x4 grid layout
 */
function displayTrendingMoviesGrid(items, containerId) {
  const container = document.getElementById(containerId);
  if (!container) return;

  if (!items || items.length === 0) {
    container.innerHTML = `
      <div class="empty-section" style="grid-column: 1 / -1; text-align: center; padding: 40px; color: var(--text-muted);">
        <i class="fas fa-film" style="font-size: 3rem; margin-bottom: 1rem;"></i>
        <p>No trending movies available at the moment.</p>
      </div>
    `;
    return;
  }

  container.innerHTML = '';
  const moviesToShow = items.slice(0, 24); // Exactly 24 movies for 6x4 grid
  
  moviesToShow.forEach(item => {
    const card = createTrendingMediaCard(item);
    if (card) container.appendChild(card);
  });
}

/**
 * Creates a trending media card element for the 6x4 grid
 */
function createTrendingMediaCard(item) {
  if (!item.poster_path) return null;

  const card = document.createElement('div');
  card.className = 'trending-media-card';
  card.setAttribute('role', 'button');
  card.setAttribute('tabindex', '0');
  card.setAttribute('aria-label', `View details for ${item.title || item.name}`);
  
  // Extract year from release_date or first_air_date
  const releaseYear = item.release_date 
    ? new Date(item.release_date).getFullYear() 
    : item.first_air_date 
    ? new Date(item.first_air_date).getFullYear() 
    : 'N/A';
  
  const rating = (item.vote_average / 2).toFixed(1);
  
  card.innerHTML = `
    <div class="trending-poster-container">
      <img src="${API_CONFIG.IMG_URL}${item.poster_path}" 
           alt="Poster for ${item.title || item.name}" 
           class="trending-media-poster"
           loading="lazy" />
      <div class="trending-quick-rating">
        <i class="fas fa-star"></i>
        <span>${rating}</span>
      </div>
      <div class="trending-overlay">
        <button class="trending-play-btn" onclick="event.stopPropagation(); showDetails(${JSON.stringify(item).replace(/"/g, '&quot;')})">
          <i class="fas fa-play"></i>
        </button>
      </div>
    </div>
    <div class="trending-media-info">
      <h3 class="trending-media-title">${item.title || item.name}</h3>
      <div class="trending-media-meta">
        <div class="trending-rating">
          <span>${renderRating(item.vote_average)}</span>
        </div>
        ${releaseYear !== 'N/A' ? `<span class="trending-year">${releaseYear}</span>` : ''}
      </div>
    </div>
  `;

  // Add click event
  card.onclick = () => showDetails(item);
  card.onkeydown = (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      showDetails(item);
    }
  };

  return card;
}

/**
 * Renders star rating based on vote average.
 */
function renderRating(voteAverage) {
  const ratingOutOfFive = Math.round(voteAverage / 2);
  return '★'.repeat(ratingOutOfFive) + '☆'.repeat(5 - ratingOutOfFive);
}

// --- Modal and Details Logic ---

/**
 * Shows detailed modal for selected media item.
 */
async function showDetails(item) {
  currentItem = item;
  
  // Reset season/episode state
  currentSeasons = [];
  currentSeasonNumber = 1;
  currentEpisodes = [];
  currentEpisodeNumber = 1;
  
  // Set media details
  document.getElementById('modal-title').textContent = item.title || item.name;
  document.getElementById('modal-description').textContent = 
    item.overview || 'No description available.';
  document.getElementById('modal-image').src = 
    `${API_CONFIG.IMG_ORIGINAL}${item.poster_path}`;
  document.getElementById('modal-image').alt = 
    `Poster for ${item.title || item.name}`;
  
 // Set additional metadata
const releaseYear = item.release_date 
  ? new Date(item.release_date).getFullYear() 
  : item.first_air_date 
  ? new Date(item.first_air_date).getFullYear() 
  : 'N/A';

document.getElementById('modal-rating').innerHTML = renderRating(item.vote_average);
document.getElementById('modal-rating-text').innerHTML = 
  `${(item.vote_average / 2).toFixed(1)}/5${releaseYear !== 'N/A' ? `<span class="modal-year">${releaseYear}</span>` : ''}`;
document.getElementById('modal-date').textContent = 
  formatDate(item.release_date || item.first_air_date);
  
  // Handle TV series season/episode selector
  const seasonEpisodeSelector = document.getElementById('season-episode-selector');
  if (item.media_type === 'tv' || item.name) {
    // It's a TV series
    seasonEpisodeSelector.style.display = 'block';
    
    // Fetch seasons
    currentSeasons = await fetchTVSeasons(item.id);
    
    // Filter out seasons with 0 episodes
    currentSeasons = currentSeasons.filter(season => season.episode_count > 0 && season.season_number > 0);
    
    if (currentSeasons.length > 0) {
      // Load first season episodes
      await loadSeasonEpisodes(item.id, currentSeasons[0].season_number);
      updateSeasonNavigation();
    } else {
      // No seasons available
      seasonEpisodeSelector.innerHTML = `
        <div class="empty-state">
          <i class="fas fa-tv"></i>
          <p>No seasons available for this series</p>
        </div>
      `;
    }
  } else {
    // It's a movie
    seasonEpisodeSelector.style.display = 'none';
  }
  
  // Reset server and load video
  document.getElementById('server').value = 'vidsrc.cc';
  changeServer();
  
  // Show modal
  document.getElementById('modal').style.display = 'flex';
  document.body.style.overflow = 'hidden';
}

/**
 * Updates video iframe based on selected server.
 */
function changeServer() {
  if (!currentItem) return;

  const server = document.getElementById('server').value;
  const type = (currentItem.media_type === "movie" || currentItem.title) ? "movie" : "tv";
  let embedURL = "";

  if (server === "vidsrc.cc") {
    if (type === "tv") {
      embedURL = `https://vidsrc.cc/v2/embed/tv/${currentItem.id}/${currentSeasonNumber}/${currentEpisodeNumber}`;
    } else {
      embedURL = `https://vidsrc.cc/v2/embed/movie/${currentItem.id}`;
    }
  } else if (server === "vidsrc.net") {
    if (type === "tv") {
      embedURL = `https://vidsrc.net/embed/tv/?tmdb=${currentItem.id}&season=${currentSeasonNumber}&episode=${currentEpisodeNumber}`;
    } else {
      embedURL = `https://vidsrc.net/embed/movie/?tmdb=${currentItem.id}`;
    }
  } else if (server === "player.videasy.net") {
    if (type === "tv") {
      embedURL = `https://player.videasy.net/tv/${currentItem.id}/${currentSeasonNumber}/${currentEpisodeNumber}`;
    } else {
      embedURL = `https://player.videasy.net/movie/${currentItem.id}`;
    }
  }

  document.getElementById('modal-video').src = embedURL;
}

/**
 * Closes the details modal.
 */
function closeModal() {
  document.getElementById('modal').style.display = 'none';
  document.getElementById('modal-video').src = '';
  document.body.style.overflow = 'auto';
}

// --- Search Functionality ---

/**
 * Opens search modal.
 */
function openSearchModal() {
  document.getElementById('search-modal').style.display = 'block';
  document.getElementById('search-input').focus();
  document.body.style.overflow = 'hidden';
}

/**
 * Closes search modal.
 */
function closeSearchModal() {
  document.getElementById('search-modal').style.display = 'none';
  document.getElementById('search-results').innerHTML = '';
  document.getElementById('search-input').value = '';
  document.body.style.overflow = 'auto';
}

/**
 * Searches TMDB and displays results.
 */
async function searchTMDB() {
  const query = document.getElementById('search-input').value.trim();
  const container = document.getElementById('search-results');
  const emptyState = document.getElementById('search-empty');
  
  if (!query) {
    container.innerHTML = '';
    if (emptyState) container.appendChild(emptyState);
    return;
  }

  // Remove empty state during search
  if (emptyState) emptyState.remove();

  try {
    const response = await fetch(
      `${API_CONFIG.BASE_URL}/search/multi?api_key=${API_CONFIG.KEY}&query=${encodeURIComponent(query)}`
    );
    if (!response.ok) throw new Error(`Search error! status: ${response.status}`);
    
    const data = await response.json();
    container.innerHTML = '';

    const validResults = data.results.filter(item =>
      item.media_type !== 'person' &&
      (item.poster_path || item.backdrop_path) &&
      (item.title || item.name)
    );

    if (validResults.length === 0) {
      container.innerHTML = `
        <div class="empty-state">
          <i class="fas fa-search"></i>
          <p>No results found for "${query}"</p>
        </div>
      `;
      return;
    }

    validResults.forEach(item => {
      const card = createMediaCard(item);
      if (card) {
        // Update click handler to close search modal first
        const originalClick = card.onclick;
        card.onclick = () => {
          closeSearchModal();
          originalClick();
        };
        container.appendChild(card);
      }
    });

  } catch (error) {
    console.error("Search error:", error);
    container.innerHTML = `
      <div class="empty-state">
        <i class="fas fa-exclamation-triangle"></i>
        <p>Search failed. Please try again.</p>
      </div>
    `;
  }
}

// --- Event Listeners and Initialization ---

/**
 * Main initialization function.
 */
async function init() {
  showLoading();
  loadThemePreference();
  setupEventListeners();

  try {
    const [movies, tvShows, anime] = await Promise.all([
      fetchTrending('movie'),
      fetchTrending('tv'),
      fetchTrendingAnime()
    ]);

    // Display banner with random content
    if (movies.length > 0) {
      const randomMovie = movies[Math.floor(Math.random() * movies.length)];
      displayBanner(randomMovie);
    }

    // Display all lists - Trending Movies in 6x4 grid, others in scroller
    displayTrendingMoviesGrid(movies, 'trending-movies-grid');
    displayList(tvShows, 'tvshows-list');
    displayList(anime, 'anime-list');

  } catch (error) {
    console.error('Initialization error:', error);
  } finally {
    setTimeout(hideLoading, 1000);
  }

  // Expose functions globally
  window.closeModal = closeModal;
  window.changeServer = changeServer;
  window.openSearchModal = openSearchModal;
  window.closeSearchModal = closeSearchModal;
  window.searchTMDB = searchTMDB;
  window.toggleTheme = toggleTheme;
  window.scrollToTop = scrollToTop;
  window.scrollToContent = scrollToContent;
  window.scrollList = scrollList;
  window.openDisclaimerModal = openDisclaimerModal;
  window.closeDisclaimerModal = closeDisclaimerModal;
  window.changeSeason = changeSeason;
  window.selectEpisode = selectEpisode;
  window.playTrailer = () => alert('Trailer feature coming soon!');
  window.addToFavorites = () => alert('Added to favorites!');
  window.shareMedia = () => alert('Share feature coming soon!');
}

// Start the application when DOM is loaded
document.addEventListener('DOMContentLoaded', init);
