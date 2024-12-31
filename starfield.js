// Create stars
function createStars() {
    const stars = document.querySelector('.stars');
    const starCount = Math.floor((window.innerWidth * window.innerHeight) / 500); // More stars based on screen size
    
    for (let i = 0; i < starCount; i++) {
        const star = document.createElement('div');
        star.className = 'star';
        
        // Random star properties
        const size = Math.random() * 2;
        const opacity = Math.random() * 0.7 + 0.3;
        const duration = Math.random() * 3 + 2;
        const x = Math.random() * 100;
        const y = Math.random() * 100;
        const delay = Math.random() * duration;
        
        // Random color (white to blue-ish)
        const hue = Math.random() * 30 + 200; // 200-230 for blue range
        const saturation = Math.random() * 50; // 0-50% saturation
        const lightness = 80 + Math.random() * 20; // 80-100% lightness
        
        star.style.cssText = `
            width: ${size}px;
            height: ${size}px;
            left: ${x}%;
            top: ${y}%;
            background: hsl(${hue}, ${saturation}%, ${lightness}%);
            box-shadow: 0 0 ${size * 2}px hsl(${hue}, ${saturation}%, ${lightness}%);
            opacity: 0;
            animation-duration: ${duration}s;
            animation-delay: ${delay}s;
            --opacity: ${opacity};
        `;
        
        stars.appendChild(star);
    }
}

// Create nebula effect
function enhanceNebula() {
    const nebula = document.querySelector('.nebula');
    if (nebula) {
        nebula.style.background = `
            radial-gradient(circle at 20% 30%, rgba(255, 42, 255, 0.15) 0%, transparent 50%),
            radial-gradient(circle at 80% 70%, rgba(0, 255, 242, 0.15) 0%, transparent 50%),
            radial-gradient(circle at 50% 50%, rgba(0, 0, 30, 0.8) 0%, transparent 100%),
            radial-gradient(circle at 30% 40%, rgba(42, 42, 255, 0.1) 0%, transparent 40%),
            radial-gradient(circle at 70% 60%, rgba(42, 255, 255, 0.1) 0%, transparent 40%)
        `;
        nebula.style.opacity = '0.8';
    }
}

// Shooting stars
function createShootingStar() {
    const stars = document.querySelector('.stars');
    const star = document.createElement('div');
    star.className = 'shooting-star';
    
    const startX = Math.random() * 100;
    const startY = Math.random() * 100;
    const angle = Math.random() * 45 - 45; // -45 to 0 degrees
    
    star.style.cssText = `
        position: absolute;
        left: ${startX}%;
        top: ${startY}%;
        width: 2px;
        height: 2px;
        background: white;
        transform: rotate(${angle}deg);
        opacity: 0;
        pointer-events: none;
    `;
    
    const keyframes = [
        { opacity: 0, transform: `rotate(${angle}deg) translateX(0)` },
        { opacity: 1, transform: `rotate(${angle}deg) translateX(-50px)`, offset: 0.1 },
        { opacity: 1, transform: `rotate(${angle}deg) translateX(-100px)`, offset: 0.9 },
        { opacity: 0, transform: `rotate(${angle}deg) translateX(-150px)` }
    ];
    
    const animation = star.animate(keyframes, {
        duration: 1000,
        easing: 'ease-out'
    });
    
    stars.appendChild(star);
    animation.onfinish = () => star.remove();
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    createStars();
    enhanceNebula();
    
    // Randomly create shooting stars
    setInterval(() => {
        if (Math.random() > 0.9) { // 10% chance every interval
            createShootingStar();
        }
    }, 2000);
    
    // Handle window resize
    let resizeTimeout;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(() => {
            const stars = document.querySelector('.stars');
            stars.innerHTML = '';
            createStars();
        }, 150);
    });
});

// Add styles to the document
const style = document.createElement('style');
style.textContent = `
    body {
        background-color: #020204 !important;
    }
    
    .stars {
        z-index: 1;
    }
    
    .shooting-star::after {
        content: '';
        position: absolute;
        top: 50%;
        right: 0;
        width: 20px;
        height: 1px;
        background: linear-gradient(to left, rgba(255,255,255,0.8), transparent);
        transform: translateY(-50%);
    }
    
    .nebula {
        z-index: 0;
        mix-blend-mode: screen;
    }
`;
document.head.appendChild(style);
