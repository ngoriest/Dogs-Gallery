class DogExplorer {
  constructor() {
    this.apiBase = 'http://localhost:3000';
    this.currentBreed = null;
    this.initElements();
    this.setupEventListeners();
    this.loadBreeds();
  }

  initElements() {
    this.elements = {
      breedSelector: document.getElementById('breed-selector'),
      loadBtn: document.getElementById('load-btn'),
      favoritesBtn: document.getElementById('view-favorites'),
      shuffleBtn: document.getElementById('shuffle-btn'),
      breedInfo: document.getElementById('breed-info'),
      dogGrid: document.getElementById('dog-grid'),
      statusMessage: document.getElementById('status-message')
    };
  }

  setupEventListeners() {
    this.elements.loadBtn.addEventListener('click', () => this.loadBreed());
    this.elements.favoritesBtn.addEventListener('click', () => this.showFavorites());
    this.elements.shuffleBtn.addEventListener('click', () => this.shuffleImages());
  }

  async loadBreeds() {
    try {
      this.showStatus('Loading breeds...', 'loading');
      const response = await fetch(`${this.apiBase}/breeds`);
      const breeds = await response.json();
      
      this.elements.breedSelector.innerHTML = breeds.map(breed => `
        <option value="${breed.id}">${this.formatBreedName(breed.name)}</option>
      `).join('');
      
      this.showStatus('Ready to explore!', 'success');
    } catch (error) {
      console.error('Error loading breeds:', error);
      this.showStatus('Failed to load breeds. Is json-server running?', 'error');
    }
  }

  async loadBreed() {
    const breedId = this.elements.breedSelector.value;
    if (!breedId) {
      this.showStatus('Please select a breed first!', 'error');
      return;
    }

    try {
      this.showStatus('Loading dog info...', 'loading');
      const response = await fetch(`${this.apiBase}/breeds/${breedId}`);
      this.currentBreed = await response.json();
      
      this.displayBreedInfo(this.currentBreed);
      this.displayDogImages(this.currentBreed.images);
      this.showStatus(`Loaded ${this.formatBreedName(this.currentBreed.name)}`, 'success');
    } catch (error) {
      console.error('Error loading breed:', error);
      this.showStatus('Failed to load dog info', 'error');
    }
  }

  displayBreedInfo(breed) {
    this.elements.breedInfo.innerHTML = `
      <h2>${this.formatBreedName(breed.name)}</h2>
      <p>${breed.description}</p>
      <div class="breed-stats">❤️ ${breed.likes || 0} likes</div>
    `;
  }

  displayDogImages(images) {
    this.elements.dogGrid.innerHTML = images.map(image => `
      <div class="dog-card">
        <img src="${image}" alt="Dog" class="dog-image" 
             onerror="this.src='https://via.placeholder.com/300?text=Image+Not+Available'">
        <div class="dog-actions">
          <button class="like-btn" onclick="dogExplorer.likeImage('${image}')">
            ❤️ Like
          </button>
          <button class="save-btn" onclick="dogExplorer.toggleFavorite('${image}')">
            ${this.isFavorite(image) ? '⭐ Saved' : '⭐ Save'}
          </button>
        </div>
      </div>
    `).join('');
  }

  isFavorite(imageUrl) {
    const favorites = JSON.parse(localStorage.getItem('dogFavorites')) || [];
    return favorites.some(fav => fav.image === imageUrl);
  }

  toggleFavorite(imageUrl) {
    const favorites = JSON.parse(localStorage.getItem('dogFavorites')) || [];
    const existingIndex = favorites.findIndex(fav => fav.image === imageUrl);

    if (existingIndex === -1) {
      // Add to favorites
      favorites.push({
        image: imageUrl,
        breed: this.currentBreed.name,
        description: this.currentBreed.description,
        date: new Date().toLocaleString()
      });
      this.showStatus('Added to favorites!', 'success');
    } else {
      // Remove from favorites
      favorites.splice(existingIndex, 1);
      this.showStatus('Removed from favorites!', 'success');
    }

    localStorage.setItem('dogFavorites', JSON.stringify(favorites));
    this.loadBreed(); // Refresh current view
  }

  showFavorites() {
    try {
      const favorites = JSON.parse(localStorage.getItem('dogFavorites')) || [];
      
      if (favorites.length === 0) {
        this.showStatus('No favorites saved yet!', 'info');
        return;
      }
      
      this.elements.breedInfo.innerHTML = `
        <h2>⭐ Your Favorites</h2>
        <p>${favorites.length} saved dogs</p>
      `;
      
      this.elements.dogGrid.innerHTML = favorites.map((fav, index) => `
        <div class="dog-card">
          <img src="${fav.image}" alt="${fav.breed}" class="dog-image"
               onerror="this.src='https://via.placeholder.com/300?text=Image+Removed'">
          <div class="dog-info">
            <h3>${this.formatBreedName(fav.breed)}</h3>
            <p>${fav.description}</p>
            <small>Saved on ${fav.date}</small>
            <button class="remove-btn" onclick="dogExplorer.removeFavorite(${index})">
              🗑️ Remove
            </button>
          </div>
        </div>
      `).join('');
      
    } catch (error) {
      console.error('Error loading favorites:', error);
      this.showStatus('Failed to load favorites', 'error');
    }
  }

  removeFavorite(index) {
    const favorites = JSON.parse(localStorage.getItem('dogFavorites')) || [];
    favorites.splice(index, 1);
    localStorage.setItem('dogFavorites', JSON.stringify(favorites));
    this.showFavorites(); // Refresh the view
    this.showStatus('Favorite removed!', 'success');
  }

  shuffleImages() {
    const cards = Array.from(this.elements.dogGrid.children);
    for (let i = cards.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      this.elements.dogGrid.appendChild(cards[j]);
    }
    this.showStatus('Images shuffled!', 'success');
  }

  formatBreedName(name) {
    return name.replace(/([A-Z])/g, ' $1')
              .replace(/(^|\s)\S/g, l => l.toUpperCase());
  }

  showStatus(message, type = 'info') {
    this.elements.statusMessage.textContent = message;
    this.elements.statusMessage.className = `status-message ${type}`;
  }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  window.dogExplorer = new DogExplorer();
});