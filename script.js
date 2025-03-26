class DogExplorer {
    constructor() {
      this.apiBase = 'http://localhost:3000';
      this.currentBreed = null; // Track selected breed
      this.initElements();
      this.setupEventListeners();
      this.loadBreeds();
      
      // Check localStorage support
      if (!this.checkLocalStorage()) {
        alert("Your browser blocks localStorage. Favorites won't be saved in private mode.");
      }
    }
  
    checkLocalStorage() {
      try {
        localStorage.setItem('test', 'test');
        localStorage.removeItem('test');
        return true;
      } catch (e) {
        return false;
      }
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
        
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        
        const breeds = await response.json();
        this.populateBreedSelector(breeds);
        this.showStatus('Ready to explore!', 'success');
      } catch (error) {
        console.error('Error loading breeds:', error);
        this.showStatus('Failed to load breeds. Is json-server running?', 'error');
      }
    }
  
    populateBreedSelector(breeds) {
      this.elements.breedSelector.innerHTML = breeds.map(breed => `
        <option value="${breed.id}">
          ${this.formatBreedName(breed.name)}
        </option>
      `).join('');
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
        
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        
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
        <div class="breed-stats">
          <span>❤️ ${breed.likes || 0} likes</span>
        </div>
      `;
    }
  
    displayDogImages(images) {
      this.elements.dogGrid.innerHTML = images.map((image, index) => `
        <div class="dog-card">
          <img src="${image}" alt="Dog ${index + 1}" class="dog-image">
          <div class="dog-actions">
            <button class="like-btn" onclick="dogExplorer.likeImage(${index})">
              ❤️ Like
            </button>
            <button class="save-btn" onclick="dogExplorer.saveFavorite('${image}')">
              ⭐ Save
            </button>
          </div>
        </div>
      `).join('');
    }
  
    likeImage(imageIndex) {
      if (!this.currentBreed) return;
      
      // Update likes in UI immediately
      const likeButtons = document.querySelectorAll('.like-btn');
      likeButtons[imageIndex].textContent = '❤️ Liked!';
      
      // In a real app, you would update the server here
      console.log(`Liked image ${imageIndex} of ${this.currentBreed.name}`);
    }
  
    saveFavorite(imageUrl) {
      try {
        const favorites = JSON.parse(localStorage.getItem('dogFavorites')) || [];
        
        // Check if already saved
        if (favorites.some(fav => fav.image === imageUrl)) {
          this.showStatus('Already in favorites!', 'info');
          return;
        }
        
        // Add new favorite with metadata
        favorites.push({
          image: imageUrl,
          breed: this.currentBreed.name,
          description: this.currentBreed.description,
          date: new Date().toLocaleString()
        });
        
        localStorage.setItem('dogFavorites', JSON.stringify(favorites));
        this.showStatus('Saved to favorites!', 'success');
      } catch (error) {
        console.error('Save failed:', error);
        this.showStatus('Failed to save favorite. Try a different browser.', 'error');
      }
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
        
        this.elements.dogGrid.innerHTML = favorites.map(fav => `
          <div class="dog-card">
            <img src="${fav.image}" alt="${fav.breed}" class="dog-image">
            <div class="dog-info">
              <h3>${this.formatBreedName(fav.breed)}</h3>
              <p>${fav.description}</p>
              <small>Saved on ${fav.date}</small>
            </div>
          </div>
        `).join('');
        
      } catch (error) {
        console.error('Error loading favorites:', error);
        this.showStatus('Failed to load favorites', 'error');
      }
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
                .replace(/^./, str => str.toUpperCase())
                .replace('shepherd', 'Shepherd');
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