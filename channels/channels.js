// ==========================================
// HOLO PLAYER MAIN PAGE - Channels
// Fetch and render 3D video channels
// ==========================================

// State
let channelsData = null;

// DOM Elements
const channelGridContainer = document.getElementById('channelGrid');
const loadingElement = document.getElementById('loading');
const errorElement = document.getElementById('error');

// Utility: Shuffle array using Fisher-Yates algorithm
function shuffleArray(array) {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

// Initialize
async function init() {
  try {
    showLoading();
    await fetchChannelsData();
    renderChannels();
    hideLoading();
  } catch (error) {
    console.error('Failed to load channels:', error);
    showError();
  }
}

// Fetch data from channels/config/channels.json
async function fetchChannelsData() {
  const response = await fetch('channels/config/channels.json');

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  channelsData = await response.json();
  console.log('Channels data loaded:', channelsData);
}

// Render channels
function renderChannels() {
  if (!channelsData || !Array.isArray(channelsData)) return;

  // Render channel cards
  if (channelsData.length === 0) {
    channelGridContainer.innerHTML = `
      <div style="grid-column: 1 / -1; text-align: center; padding: 80px 20px; color: rgba(255, 255, 255, 0.5);">
        <p style="font-size: 20px;">No channels available</p>
      </div>
    `;
    return;
  }

  // Randomize the channels
  const randomizedChannels = shuffleArray(channelsData);

  channelGridContainer.innerHTML = randomizedChannels.map(channel => {
    return `
      <a href="${channel.url}" class="channel-card" data-source="${channel.source}">
        <div class="channel-logo-container">
          <img
            src="${channel.logo}"
            alt="${channel.name}"
            class="channel-logo"
            loading="lazy"
            onerror="this.src='data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%22100%22 height=%22100%22%3E%3Crect width=%22100%22 height=%22100%22 fill=%22%23333%22/%3E%3Ctext x=%2250%25%22 y=%2250%25%22 dominant-baseline=%22middle%22 text-anchor=%22middle%22 font-size=%2240%22 fill=%22%23666%22%3E3D%3C/text%3E%3C/svg%3E'"
          >
        </div>
        <div class="channel-info">
          <h3 class="channel-name">${channel.name}</h3>
          <div class="channel-source">${channel.source}</div>
        </div>
      </a>
    `;
  }).join('');
}

// Show loading state
function showLoading() {
  loadingElement.style.display = 'flex';
  channelGridContainer.style.display = 'none';
  errorElement.style.display = 'none';
}

// Hide loading state
function hideLoading() {
  loadingElement.style.display = 'none';
  channelGridContainer.style.display = 'grid';
}

// Show error state
function showError() {
  loadingElement.style.display = 'none';
  channelGridContainer.style.display = 'none';
  errorElement.style.display = 'flex';
}

// Start the app
init();
