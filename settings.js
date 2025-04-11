class SettingsManager {
  constructor() {
    this.settings = {
      opacity: 0.8,
      backgroundColor: '#1a1a1a',
      backgroundImage: null,
      backgroundSize: 'cover'
    };
    
    this.loadSettings();
  }

  async loadSettings() {
    try {
      const savedSettings = await window.electronAPI.getSettings();
      this.settings = { ...this.settings, ...savedSettings };
      this.applySettings();
      
      // Update UI elements with loaded settings
      if (document.querySelector('input[type="range"]')) {
        document.querySelector('input[type="range"]').value = this.settings.opacity * 100;
        document.querySelector('.opacity-value').textContent = `${Math.round(this.settings.opacity * 100)}%`;
      }
      if (document.querySelector('input[type="color"]')) {
        document.querySelector('input[type="color"]').value = this.settings.backgroundColor;
      }
    } catch (error) {
      console.error('Error loading settings:', error);
    }
  }

  async saveSettings(newSettings) {
    try {
      this.settings = { ...this.settings, ...newSettings };
      await window.electronAPI.saveSettings(this.settings);
      this.applySettings();
    } catch (error) {
      console.error('Error saving settings:', error);
    }
  }

  applySettings() {
    const root = document.documentElement;
    const appContainer = document.querySelector('.app-container');
    
    // Convert hex color to RGB
    const rgb = this.hexToRgb(this.settings.backgroundColor);
    
    // Apply background color with opacity
    appContainer.style.backgroundColor = `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${this.settings.opacity})`;
    
    // Apply CSS variables
    root.style.setProperty('--background-opacity', this.settings.opacity);
    root.style.setProperty('--background-color', this.settings.backgroundColor);
    
    // Apply background image if exists
    if (this.settings.backgroundImage) {
      appContainer.style.backgroundImage = `url('${this.settings.backgroundImage}')`;
      appContainer.style.backgroundSize = this.settings.backgroundSize;
      appContainer.style.backgroundPosition = 'center';
      appContainer.style.backgroundRepeat = 'no-repeat';
    } else {
      appContainer.style.backgroundImage = 'none';
    }
  }

  hexToRgb(hex) {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : { r: 26, g: 26, b: 26 }; // Default dark gray
  }

  async selectBackgroundImage() {
    try {
      const imagePath = await window.electronAPI.selectBackgroundImage();
      if (imagePath) {
        await this.saveSettings({ backgroundImage: imagePath });
      }
    } catch (error) {
      console.error('Error selecting background image:', error);
    }
  }

  getSettings() {
    return { ...this.settings };
  }
}

module.exports = SettingsManager; 