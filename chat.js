// Load AI configuration
let aiConfig;
try {
    const savedConfig = localStorage.getItem('currentAI');
    if (!savedConfig) {
        throw new Error('No AI configuration found');
    }
    aiConfig = JSON.parse(savedConfig);
    console.log('Loaded AI Config:', aiConfig);
} catch (error) {
    console.error('Error loading AI config:', error);
    // Provide default configuration if loading fails
    aiConfig = {
        name: 'Atlas',
        personality: 'friendly',
        communicationStyle: 3,
        expertise: ['General Knowledge'],
        customKnowledge: '',
        decisionStyle: 'balanced',
        ethics: ['privacy', 'transparency', 'fairness']
    };
}
const OPENAI_API_KEY = '';

// Initialize UI elements
const messagesContainer = document.getElementById('messages');
const messageInput = document.getElementById('message-input');
const sendButton = document.getElementById('send-message');
const clearButton = document.getElementById('clear-chat');
const resetButton = document.getElementById('reset-chat');
const customizeButton = document.getElementById('customize-ai');
const expertiseList = document.getElementById('expertise-list');
const fileUpload = document.getElementById('file-upload');
const uploadTrigger = document.getElementById('upload-trigger');
const generateImageButton = document.getElementById('generate-image');
const STABILITY_API_KEY = 'sk-w5osCyXKznIs60OIukzM04yMFb97FgbI3d742CmKkE7kbtAB';

// Update AI profile
document.getElementById('ai-name').textContent = aiConfig.name;
document.getElementById('ai-personality').textContent = 
    aiConfig.personality.charAt(0).toUpperCase() + aiConfig.personality.slice(1);
document.getElementById('communication-value').textContent = 
    `Level ${aiConfig.communicationStyle} - ${aiConfig.communicationStyle <= 2 ? 'Concise' : aiConfig.communicationStyle >= 4 ? 'Detailed' : 'Balanced'}`;
document.getElementById('decision-value').textContent = aiConfig.decisionStyle;

// Add expertise tags
aiConfig.expertise.forEach(exp => {
    const tag = document.createElement('span');
    tag.className = 'expertise-tag';
    tag.textContent = exp;
    expertiseList.appendChild(tag);
});

// Generate system message based on AI configuration
function generateSystemMessage() {
    const personalityTraits = {
        friendly: 'warm, approachable, and helpful. Use casual language and emoticons occasionally.',
        professional: 'formal, structured, and business-oriented. Use professional language and clear formatting.',
        creative: 'imaginative, expressive, and artistic. Use colorful language and creative analogies.',
        analytical: 'logical, precise, and methodical. Use technical language and structured explanations.'
    };

    const communicationStyle = {
        1: 'Be very concise and to the point.',
        2: 'Be somewhat concise while providing necessary context.',
        3: 'Balance detail and brevity.',
        4: 'Provide detailed explanations with examples.',
        5: 'Be very detailed and comprehensive.'
    };

    const decisionStyles = {
        cautious: 'Take a conservative approach, carefully considering risks.',
        balanced: 'Balance innovation with proven methods.',
        innovative: 'Embrace creative solutions and new approaches.'
    };

    const personalityExamples = {
        friendly: "Use warm language, emoticons occasionally (😊, 👍), and show enthusiasm. Be conversational and approachable.",
        professional: "Use formal language, clear structure, and maintain a business-like tone. Avoid colloquialisms and emoticons.",
        creative: "Use colorful language, metaphors, and think outside the box. Express ideas with flair and imagination.",
        analytical: "Use precise language, logical structure, and data-driven explanations. Break down complex topics systematically."
    };

    const communicationExamples = {
        1: "Keep responses under 2 sentences. Be direct and concise.",
        2: "Keep responses under 3-4 sentences. Include key context only.",
        3: "Balance detail with brevity. Aim for 4-5 sentences per response.",
        4: "Provide detailed explanations with examples. Use 5-6 sentences.",
        5: "Be comprehensive. Include background, examples, and implications."
    };

    return `You are ${aiConfig.name}, an AI assistant. You must strictly adhere to these characteristics in every response:

PERSONALITY (${aiConfig.personality}):
${personalityTraits[aiConfig.personality]}
How to express this: ${personalityExamples[aiConfig.personality]}

COMMUNICATION STYLE (Level ${aiConfig.communicationStyle}):
${communicationStyle[aiConfig.communicationStyle]}
How to implement this: ${communicationExamples[aiConfig.communicationStyle]}

DECISION APPROACH (${aiConfig.decisionStyle}):
${decisionStyles[aiConfig.decisionStyle]}

EXPERTISE:
You are particularly knowledgeable in: ${aiConfig.expertise.join(', ')}
When discussing these topics, demonstrate deep understanding while maintaining your personality and communication style.
${aiConfig.customKnowledge ? `\nAdditional Knowledge:\n${aiConfig.customKnowledge}` : ''}

ETHICS FRAMEWORK:
${aiConfig.ethics.map(ethic => `- ${ethic.charAt(0).toUpperCase() + ethic.slice(1)}`).join('\n')}

IMPORTANT: These characteristics must be evident in every response. Your personality should influence your tone, your communication style should guide response length and detail, and your expertise should shine through when relevant topics arise.`;
}

// Chat functionality
let conversationHistory = [
    { role: 'system', content: generateSystemMessage() }
];

// Image generation function
async function generateImage(prompt) {
    try {
        const response = await fetch('https://api.stability.ai/v1/generation/stable-diffusion-xl-1024-v1-0/text-to-image', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${STABILITY_API_KEY}`,
                'Accept': 'application/json'
            },
            body: JSON.stringify({
                text_prompts: [{ text: prompt }],
                cfg_scale: 7,
                height: 1024,
                width: 1024,
                steps: 30,
                samples: 1
            })
        });

        if (!response.ok) {
            throw new Error(`Stability AI API error: ${response.statusText}`);
        }

        const data = await response.json();
        const base64Image = data.artifacts[0].base64;
        
        // Display the generated image
        const imgElement = document.createElement('img');
        imgElement.src = `data:image/png;base64,${base64Image}`;
        imgElement.style.maxWidth = '300px';
        imgElement.style.borderRadius = '8px';
        
        const messageDiv = document.createElement('div');
        messageDiv.className = 'message ai';
        messageDiv.appendChild(imgElement);
        messagesContainer.appendChild(messageDiv);
        messagesContainer.scrollTop = messagesContainer.scrollHeight;

    } catch (error) {
        console.error('Image generation error:', error);
        addMessageToUI('ai', 'Sorry, I encountered an error generating the image. Please make sure your Stability AI API key is valid.');
    }
}

// File handling functions
function handleFileUpload(file) {
    if (!file || !file.type.startsWith('image/')) {
        addMessageToUI('ai', 'Sorry, only image files are supported.');
        return;
    }

    const reader = new FileReader();
    reader.onload = async (e) => {
        const base64Image = e.target.result.split(',')[1];
        await sendMessage(undefined, base64Image);
    };
    reader.readAsDataURL(file);
}

async function sendMessage(textMessage, base64Image) {
    const message = textMessage || messageInput.value.trim();
    if (!message && !base64Image) return;

    // Check if this is an image generation request
    if (message.toLowerCase().startsWith('/image')) {
        const prompt = message.slice(7).trim();
        if (!prompt) {
            addMessageToUI('ai', 'Please provide a description of the image you\'d like me to generate.');
            return;
        }
        addMessageToUI('user', message);
        messageInput.value = '';
        const typingIndicator = addMessageToUI('ai', '...', true);
        await generateImage(prompt);
        typingIndicator.remove();
        return;
    }

    // Clear input if it's a text message
    if (textMessage !== undefined) {
        messageInput.value = '';
    }

    // Add user message to UI
    if (base64Image) {
        const imgElement = document.createElement('img');
        imgElement.src = `data:image/jpeg;base64,${base64Image}`;
        imgElement.style.maxWidth = '300px';
        imgElement.style.borderRadius = '8px';
        const messageDiv = document.createElement('div');
        messageDiv.className = 'message user';
        messageDiv.appendChild(imgElement);
        if (message) {
            const textDiv = document.createElement('div');
            textDiv.textContent = message;
            textDiv.style.marginTop = '10px';
            messageDiv.appendChild(textDiv);
        }
        messagesContainer.appendChild(messageDiv);
    } else {
        addMessageToUI('user', message);
    }

    // Add to conversation history
    if (base64Image) {
        conversationHistory.push({
            role: 'user',
            content: [
                {
                    type: 'image_url',
                    image_url: {
                        url: `data:image/jpeg;base64,${base64Image}`
                    }
                },
                ...(message ? [{
                    type: 'text',
                    text: message
                }] : [])
            ]
        });
    } else {
        conversationHistory.push({ role: 'user', content: message });
    }

    // Show typing indicator
    const typingIndicator = addMessageToUI('ai', '...', true);

    try {
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${OPENAI_API_KEY}`
            },
            body: JSON.stringify({
                model: base64Image ? 'gpt-4-vision-preview' : 'gpt-4',
                messages: conversationHistory,
                max_tokens: aiConfig.communicationStyle >= 4 ? 300 : aiConfig.communicationStyle >= 3 ? 200 : 100,
                temperature: aiConfig.personality === 'creative' ? 0.9 : 
                           aiConfig.personality === 'friendly' ? 0.8 :
                           aiConfig.personality === 'professional' ? 0.6 : 0.5
            })
        });

        const data = await response.json();
        
        if (data.choices && data.choices[0]) {
            // Remove typing indicator and add AI response
            typingIndicator.remove();
            const aiResponse = data.choices[0].message.content.trim();
            addMessageToUI('ai', aiResponse);
            // Add to conversation history
            conversationHistory.push({ role: 'assistant', content: aiResponse });
        }
    } catch (error) {
        console.error('Error:', error);
        typingIndicator.remove();
        addMessageToUI('ai', "I'll do my best to assist you. What would you like to discuss?");
    }
}

function addMessageToUI(role, content, isTyping = false) {
    const message = document.createElement('div');
    message.className = `message ${role}`;
    
    if (isTyping) {
        message.innerHTML = `
            <div class="typing-indicator">
                <span></span>
                <span></span>
                <span></span>
            </div>
        `;
    } else {
        message.textContent = content;
    }
    
    messagesContainer.appendChild(message);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
    return message;
}

// Event listeners
sendButton.addEventListener('click', () => sendMessage());

generateImageButton.addEventListener('click', async (event) => {
    event.preventDefault();
    const currentMessage = messageInput.value.trim();
    if (!currentMessage) {
        addMessageToUI('ai', 'Please provide a description of the image you\'d like me to generate.');
        return;
    }
    sendMessage('/image ' + currentMessage);
});

messageInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        sendMessage();
    }
});

clearButton.addEventListener('click', () => {
    messagesContainer.innerHTML = '';
    conversationHistory = [{ role: 'system', content: generateSystemMessage() }];
});

resetButton.addEventListener('click', () => {
    if (confirm('Are you sure you want to reset the chat? This will clear all messages.')) {
        messagesContainer.innerHTML = '';
        conversationHistory = [{ role: 'system', content: generateSystemMessage() }];
    }
});

customizeButton.addEventListener('click', () => {
    window.location.href = 'design.html';
});

// File upload handling
uploadTrigger.addEventListener('click', () => {
    fileUpload.click();
});

fileUpload.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) {
        handleFileUpload(file);
    }
    // Reset file input
    e.target.value = '';
});

// Auto-resize textarea
messageInput.addEventListener('input', () => {
    messageInput.style.height = 'auto';
    messageInput.style.height = messageInput.scrollHeight + 'px';
});

// Generate welcome message based on AI personality
function generateWelcomeMessage() {
    const greetings = {
        friendly: ["Hey there!", "Hi friend!", "Hello! 😊", "Hey! Great to meet you!"],
        professional: ["Greetings,", "Good day,", "Welcome,", "Hello,"],
        creative: ["Greetings, fellow explorer!", "Welcome to our creative journey!", "Hello, imagination seeker!", "Greetings, creative mind!"],
        analytical: ["Greetings, let's begin.", "Welcome to our analytical session.", "Hello, ready to explore data-driven solutions.", "Greetings, let's approach this systematically."]
    };

    const introStyles = {
        friendly: `I'm ${aiConfig.name}, and I'm super excited to help you out! I specialize in ${aiConfig.expertise.join(', ')}, and I'll be your friendly guide through any questions or challenges you have.`,
        professional: `I am ${aiConfig.name}, your dedicated professional assistant specializing in ${aiConfig.expertise.join(', ')}. I am here to provide you with structured, efficient solutions.`,
        creative: `I'm ${aiConfig.name}, your creative companion in exploring ${aiConfig.expertise.join(', ')}! Let's think outside the box and discover innovative solutions together.`,
        analytical: `I am ${aiConfig.name}, equipped with expertise in ${aiConfig.expertise.join(', ')}. I utilize systematic analysis to provide precise, data-driven assistance.`
    };

    const closings = {
        friendly: "What would you like to chat about? 😊",
        professional: "How may I assist you today?",
        creative: "What exciting challenges shall we tackle together?",
        analytical: "What specific objectives would you like to address?"
    };

    const greeting = greetings[aiConfig.personality][Math.floor(Math.random() * greetings[aiConfig.personality].length)];
    const intro = introStyles[aiConfig.personality];
    const closing = closings[aiConfig.personality];

    return `${greeting} ${intro} ${closing}`;
}

// Welcome message
document.addEventListener('DOMContentLoaded', () => {
    addMessageToUI('ai', generateWelcomeMessage());
});
