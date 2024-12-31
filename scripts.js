const OPENAI_API_KEY = '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';

// Function to verify API key
async function verifyApiKey() {
    try {
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${OPENAI_API_KEY}`
            },
            body: JSON.stringify({
                model: "gpt-4",
                messages: [{ role: 'user', content: 'test' }],
                max_tokens: 100,
                temperature: 0.9
            })
        });
        const data = await response.json();
        return response.ok;
    } catch (error) {
        console.error('API Key verification failed:', error);
        return false;
    }
}

// State management
let currentStep = 1;
const totalSteps = 3;
let aiConfig = {
    name: 'Atlas',
    personality: 'friendly',
    communicationStyle: 3,
    expertise: [],
    customKnowledge: '',
    decisionStyle: 'balanced',
    ethics: ['privacy', 'transparency', 'fairness']
};

// DOM Elements
const prevButton = document.getElementById('prev-step');
const nextButton = document.getElementById('next-step');
const createButton = document.getElementById('create-agent');
const steps = document.querySelectorAll('.step');

// Preview Elements
const previewName = document.getElementById('preview-name');
const previewPersonality = document.getElementById('preview-personality');
const avatarInitial = document.querySelector('.avatar-initial');
const progressBars = document.querySelectorAll('.progress');

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM Content Loaded');
    
    // Verify DOM elements
    const elements = {
        prevButton,
        nextButton,
        createButton,
        steps,
        previewName,
        previewPersonality,
        avatarInitial,
        progressBars
    };
    
    // Log which elements are missing
    Object.entries(elements).forEach(([name, element]) => {
        if (!element) {
            console.error(`Missing element: ${name}`);
        }
    });
    
    updatePreview();
    setupEventListeners();
    initFloatingAnimation();
});

function setupEventListeners() {
    // Step Navigation
    prevButton.addEventListener('click', () => navigateStep(-1));
    nextButton.addEventListener('click', () => navigateStep(1));
    
    // Form Inputs
    document.getElementById('agent-name').addEventListener('input', (e) => {
        aiConfig.name = e.target.value;
        updatePreview();
    });

    // Personality Selection
    document.querySelectorAll('.personality-card').forEach(card => {
        card.addEventListener('click', () => {
            const personality = card.dataset.personality;
            aiConfig.personality = personality;
            
            // Update UI
            document.querySelectorAll('.personality-card').forEach(c => {
                c.classList.remove('active');
                const radio = c.querySelector('input[type="radio"]');
                radio.checked = c.dataset.personality === personality;
            });
            card.classList.add('active');
            
            updatePreview();
            updateProgress();
        });
    });

    document.getElementById('communication-style').addEventListener('input', (e) => {
        aiConfig.communicationStyle = parseInt(e.target.value);
        updateProgress();
    });

    // Expertise Checkboxes
    const expertiseBoxes = document.querySelectorAll('.expertise-item input');
    expertiseBoxes.forEach(box => {
        box.addEventListener('change', () => {
            aiConfig.expertise = Array.from(expertiseBoxes)
                .filter(b => b.checked)
                .map(b => b.id);
            updateProgress();
        });
    });

    document.getElementById('custom-knowledge').addEventListener('input', (e) => {
        aiConfig.customKnowledge = e.target.value;
        updateProgress();
    });

    document.getElementById('decision-style').addEventListener('change', (e) => {
        aiConfig.decisionStyle = e.target.value;
        updateProgress();
    });

    // Ethics Checkboxes
    const ethicsBoxes = document.querySelectorAll('.ethics-item input');
    ethicsBoxes.forEach(box => {
        box.addEventListener('change', () => {
            aiConfig.ethics = Array.from(ethicsBoxes)
                .filter(b => b.checked)
                .map(b => b.id);
            updateProgress();
        });
    });

    // Create AI Button
    createButton.addEventListener('click', async () => {
        // Validate required fields
        if (!aiConfig.name) {
            alert('Please give your Agent a name');
            return;
        }
        
        if (aiConfig.expertise.length === 0) {
            alert('Please select at least one area of expertise');
            return;
        }

        // Verify API key before proceeding
        const isApiKeyValid = await verifyApiKey();
        if (!isApiKeyValid) {
            alert('Error: Unable to connect to AI service. Please try again later.');
            return;
        }

        // Save configuration before animation
        localStorage.setItem('currentAI', JSON.stringify(aiConfig));
        saveAgentConfig();

        // Add creation animation
        document.body.classList.add('creating-agent');
        
        // Redirect to chat interface with a slight delay for animation
        setTimeout(() => {
            window.location.href = 'chat.html';
        }, 1000);
    });

    // Add particle effects on hover for expertise items
    document.querySelectorAll('.expertise-item').forEach(item => {
        item.addEventListener('mouseover', () => {
            item.style.transform = 'scale(1.05)';
            createParticleEffect(item);
        });
        
        item.addEventListener('mouseout', () => {
            item.style.transform = 'scale(1)';
        });
    });

    // Add ripple effect to buttons
    document.querySelectorAll('button').forEach(button => {
        button.addEventListener('click', (e) => {
            const ripple = document.createElement('div');
            ripple.className = 'ripple';
            button.appendChild(ripple);
            
            const rect = button.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            
            ripple.style.left = x + 'px';
            ripple.style.top = y + 'px';
            
            setTimeout(() => ripple.remove(), 1000);
        });
    });

}

function navigateStep(direction) {
    const newStep = currentStep + direction;
    
    if (newStep < 1 || newStep > totalSteps) return;
    
    steps[currentStep - 1].classList.remove('active');
    steps[newStep - 1].classList.add('active');
    
    currentStep = newStep;
    
    // Update button states
    prevButton.disabled = currentStep === 1;
    if (currentStep === totalSteps) {
        nextButton.style.display = 'none';
        createButton.style.display = 'block';
    } else {
        nextButton.style.display = 'block';
        createButton.style.display = 'none';
    }
    
    updateProgress();
}

function updatePreview() {
    previewName.textContent = aiConfig.name || 'Atlas';
    avatarInitial.textContent = (aiConfig.name || 'A')[0];
    
    const personalityMap = {
        friendly: 'Friendly & Helpful',
        professional: 'Professional & Formal',
        creative: 'Creative & Artistic',
        analytical: 'Analytical & Precise'
    };
    
    previewPersonality.textContent = personalityMap[aiConfig.personality] || 'Friendly & Helpful';
}

function updateProgress() {
    const personalityProgress = calculateStepProgress([
        !!aiConfig.name,
        true, // personality always selected
        !!aiConfig.communicationStyle
    ]);
    
    const knowledgeProgress = calculateStepProgress([
        aiConfig.expertise.length > 0,
        !!aiConfig.customKnowledge.trim()
    ]);
    
    const ethicsProgress = calculateStepProgress([
        !!aiConfig.decisionStyle,
        aiConfig.ethics.length > 0
    ]);
    
    animateProgress(progressBars[0], personalityProgress);
    animateProgress(progressBars[1], knowledgeProgress);
    animateProgress(progressBars[2], ethicsProgress);
}

function calculateStepProgress(conditions) {
    const completed = conditions.filter(Boolean).length;
    return (completed / conditions.length) * 100;
}

function animateProgress(element, targetWidth) {
    const currentWidth = parseInt(element.style.width) || 0;
    const increment = (targetWidth - currentWidth) / 20;
    let progress = currentWidth;
    
    const animate = () => {
        progress += increment;
        if ((increment > 0 && progress < targetWidth) || 
            (increment < 0 && progress > targetWidth)) {
            element.style.width = progress + '%';
            requestAnimationFrame(animate);
        } else {
            element.style.width = targetWidth + '%';
        }
    };
    
    requestAnimationFrame(animate);
}

function createParticleEffect(element, count = 5) {
    const container = element.querySelector('.particle-container');
    for (let i = 0; i < count; i++) {
        const particle = document.createElement('div');
        particle.className = 'particle';
        
        const x = Math.random() * 100;
        const y = Math.random() * 100;
        particle.style.left = `${x}%`;
        particle.style.top = `${y}%`;
        
        container.appendChild(particle);
        setTimeout(() => particle.remove(), 1000);
    }
}

function initFloatingAnimation() {
    const previewCard = document.querySelector('.preview-card');
    if (!previewCard) return;

    let floatY = 0;
    let floatDirection = 1;

    function floatAnimation() {
        floatY += 0.05 * floatDirection;
        if (Math.abs(floatY) > 10) floatDirection *= -1;
        
        previewCard.style.transform = `translateY(${floatY}px)`;
        requestAnimationFrame(floatAnimation);
    }

    floatAnimation();
}

function saveAgentConfig() {
    const savedConfigs = JSON.parse(localStorage.getItem('agentConfigs') || '[]');
    savedConfigs.push({
        ...aiConfig,
        id: Date.now(),
        created: new Date().toISOString()
    });
    localStorage.setItem('agentConfigs', JSON.stringify(savedConfigs));
}
