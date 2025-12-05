// ==========================================
// HOLO HUB FEED PAGE - JavaScript
// Fetch and render video feed dynamically
// ==========================================

// State
let feedData = null;
let currentCategory = 'all';

// DOM Elements
const categoriesContainer = document.getElementById('categories');
const videoGridContainer = document.getElementById('videoGrid');
const loadingElement = document.getElementById('loading');
const errorElement = document.getElementById('error');

// Platform icons
const platformIcons = {
  'YouTube': '▶',
  'Vimeo': '▶',
  'Dailymotion': '▶',
  'Default': '▶'
};

// Utility: Parse categories from string (e.g., "Underwater / Marine" -> ["underwater", "marine"])
function parseCategories(categoryString) {
  if (!categoryString) return [];
  return categoryString.split(' / ').map(c => c.trim().toLowerCase());
}

// Utility: Get or create shuffle seed with 1-hour expiration
function getShuffleSeed() {
  const CACHE_KEY = 'feedShuffleSeed';
  const CACHE_DURATION = 3600000; // 1 hour in milliseconds

  try {
    const cached = localStorage.getItem(CACHE_KEY);
    if (cached) {
      const { seed, timestamp } = JSON.parse(cached);
      const age = Date.now() - timestamp;

      if (age < CACHE_DURATION) {
        console.log(`Using cached shuffle seed (age: ${Math.floor(age / 1000)}s)`);
        return seed;
      } else {
        console.log('Shuffle seed expired, generating new one');
      }
    }
  } catch (error) {
    console.warn('Failed to read cached shuffle seed:', error);
  }

  // Generate new seed
  const newSeed = Date.now().toString();
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify({
      seed: newSeed,
      timestamp: Date.now()
    }));
    console.log('Generated new shuffle seed:', newSeed);
  } catch (error) {
    console.warn('Failed to cache shuffle seed:', error);
  }

  return newSeed;
}

// Seeded random number generator (LCG algorithm)
function seededRandom(seed) {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
}

// Utility: Shuffle array using Fisher-Yates algorithm with seed
function shuffleArrayWithSeed(array, seedString) {
  const shuffled = [...array];
  let seed = parseInt(seedString, 10) || Date.now();

  for (let i = shuffled.length - 1; i > 0; i--) {
    // Generate seeded random number
    seed = (seed * 9301 + 49297) % 233280;
    const randomValue = seed / 233280;

    const j = Math.floor(randomValue * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }

  return shuffled;
}

// Handle thumbnail load error - hide the video card
function handleThumbnailError(event, videoTitle, thumbnailUrl) {
  const videoCard = event.target.closest('.video-card');
  if (videoCard) {
    videoCard.style.display = 'none';
    console.warn(`Thumbnail failed to load for video: "${videoTitle}"`, thumbnailUrl);
  }
}

// Initialize
async function init() {
  try {
    showLoading();
    await fetchFeedData();
    renderCategories();
    renderVideos();
    hideLoading();
  } catch (error) {
    console.error('Failed to load feed:', error);
    showError();
  }
}

// Fetch data from feed/config/data.json
async function fetchFeedData() {
  const response = await fetch('feed/config/data.json');

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  feedData = await response.json();
  console.log('Feed data loaded:', feedData);
}

// Render category pills (skip categories with no videos)
function renderCategories() {
  if (!feedData || !feedData.categories) return;

  // Count videos per category (handle multi-category videos)
  const videoCounts = {};
  feedData.videos.forEach(video => {
    const categories = parseCategories(video.category);
    categories.forEach(cat => {
      videoCounts[cat] = (videoCounts[cat] || 0) + 1;
    });
  });

  // Filter categories with videos (or "all")
  const categoriesWithVideos = feedData.categories.filter(cat => {
    return cat.id === 'all' || videoCounts[cat.id] > 0;
  });

  // Render category pills
  categoriesContainer.innerHTML = categoriesWithVideos.map(category => `
    <button
      class="category-pill ${category.id === currentCategory ? 'active' : ''}"
      data-category="${category.id}"
      onclick="filterByCategory('${category.id}')"
    >
      ${category.name}
    </button>
  `).join('');
}

// Render videos based on current category
function renderVideos() {
  if (!feedData || !feedData.videos) return;

  // Filter videos by category (handle multi-category videos)
  const filteredVideos = currentCategory === 'all'
    ? feedData.videos
    : feedData.videos.filter(video => {
        const categories = parseCategories(video.category);
        return categories.includes(currentCategory);
      });

  // Randomize the filtered videos with cached seed (preserves order for 1 hour)
  const seed = getShuffleSeed();
  const randomizedVideos = shuffleArrayWithSeed(filteredVideos, seed);

  // Render video cards
  if (randomizedVideos.length === 0) {
    videoGridContainer.innerHTML = `
      <div style="grid-column: 1 / -1; text-align: center; padding: 80px 20px; color: rgba(255, 255, 255, 0.5);">
        <p style="font-size: 20px;">No videos in this category</p>
      </div>
    `;
    return;
  }

  videoGridContainer.innerHTML = randomizedVideos.map(video => {
    const platformIcon = platformIcons[video.platform] || platformIcons['Default'];
    // Escape quotes for inline event handler
    const escapedTitle = video.title.replace(/'/g, "\\'");
    const escapedThumbnail = video.thumbnail.replace(/'/g, "\\'");

    return `
      <a href="${video.url}" class="video-card">
        <img
          src="${video.thumbnail}"
          alt="${video.title}"
          class="video-thumbnail"
          loading="lazy"
          onerror="handleThumbnailError(event, '${escapedTitle}', '${escapedThumbnail}')"
        >
        <div class="video-info">
          <h3 class="video-title">${video.title}</h3>
          <div class="video-platform">
            <span class="platform-icon">${platformIcon}</span>
            <span>${video.platform}</span>
          </div>
        </div>
      </a>
    `;
  }).join('');
}

// Filter videos by category
function filterByCategory(categoryId) {
  currentCategory = categoryId;

  // Update active category pill
  document.querySelectorAll('.category-pill').forEach(pill => {
    pill.classList.toggle('active', pill.dataset.category === categoryId);
  });

  // Re-render videos
  renderVideos();
}

// Show loading state
function showLoading() {
  loadingElement.style.display = 'flex';
  videoGridContainer.style.display = 'none';
  categoriesContainer.style.display = 'none';
  errorElement.style.display = 'none';
}

// Hide loading state
function hideLoading() {
  loadingElement.style.display = 'none';
  videoGridContainer.style.display = 'grid';
  categoriesContainer.style.display = 'flex';
}

// Show error state
function showError() {
  loadingElement.style.display = 'none';
  videoGridContainer.style.display = 'none';
  categoriesContainer.style.display = 'none';
  errorElement.style.display = 'flex';
}

// Start the app
init();
