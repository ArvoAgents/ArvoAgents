// Create and initialize star background
function initializeStarBackground() {
    const starsContainer = document.querySelector('.stars');
    if (!starsContainer) return;

    // Clear any existing stars
    starsContainer.innerHTML = '';
    
    // Create stars
    for (let i = 0; i < 400; i++) {
        const star = document.createElement('div');
        star.className = 'star';
        
        // Random size between 1 and 4 pixels
        const size = Math.random() * 3 + 1;
        star.style.width = `${size}px`;
        star.style.height = `${size}px`;
        
        // Random position
        star.style.left = `${Math.random() * 100}%`;
        star.style.top = `${Math.random() * 100}%`;
        
        // Random animation duration and delay
        star.style.setProperty('--duration', `${Math.random() * 4 + 2}s`);
        star.style.setProperty('--opacity', Math.random() * 0.8 + 0.4);
        star.style.animationDelay = `${Math.random() * 4}s`;
        
        // Add glow effect for larger stars
        if (size > 2.5) {
            star.style.boxShadow = '0 0 3px rgba(255, 255, 255, 0.8)';
        }
        
        starsContainer.appendChild(star);
    }
}

// Initialize stars when DOM is loaded
document.addEventListener('DOMContentLoaded', initializeStarBackground);
