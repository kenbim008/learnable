// Bot FAQ with Typing Functionality

let chatbotMessages = [];
let chatbotTyping = false;

// Initialize chatbot
function initChatbot() {
    const chatbotInput = document.querySelector('.chatbot-input input');
    const chatbotSendBtn = document.querySelector('.chatbot-input button');
    const chatbotBody = document.querySelector('.chatbot-body');
    
    // Update FAQ buttons with editable content
    if (typeof updateChatbotFAQButtons === 'function') {
        updateChatbotFAQButtons();
    }
    
    // Add welcome message
    if (chatbotBody && chatbotMessages.length === 0) {
        addBotMessage('👋 Hi! I\'m your LEARNible FAQ Bot. Ask me anything or click the buttons below for quick answers!');
    }
    
    // Handle send button click
    if (chatbotSendBtn) {
        chatbotSendBtn.addEventListener('click', handleChatbotSend);
    }
    
    // Handle Enter key
    if (chatbotInput) {
        chatbotInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleChatbotSend();
            }
        });
    }
}

// Handle sending message
function handleChatbotSend() {
    const input = document.querySelector('.chatbot-input input');
    if (!input) return;
    
    const message = input.value.trim();
    if (!message || chatbotTyping) return;
    
    // Add user message
    addUserMessage(message);
    input.value = '';
    
    // Process message and get bot response
    setTimeout(() => {
        processUserMessage(message);
    }, 500);
}

// Add user message
function addUserMessage(text) {
    chatbotMessages.push({ type: 'user', text });
    renderChatbotMessages();
}

// Add bot message with typing effect
function addBotMessage(text, instant = false) {
    chatbotMessages.push({ type: 'bot', text });
    renderChatbotMessages(instant);
}

// Render chatbot messages
function renderChatbotMessages(instant = false) {
    const chatbotBody = document.querySelector('.chatbot-body');
    if (!chatbotBody) return;
    
    // Clear existing messages (keep FAQ buttons container if it exists)
    const existingMessages = chatbotBody.querySelectorAll('.chatbot-message-item, .chatbot-typing');
    existingMessages.forEach(el => el.remove());
    
    // Render messages
    const messagesContainer = document.createElement('div');
    messagesContainer.style.marginBottom = '1rem';
    
    chatbotMessages.forEach((msg, index) => {
        const messageDiv = document.createElement('div');
        messageDiv.className = 'chatbot-message-item';
        messageDiv.style.cssText = `
            padding: 0.75rem 1rem;
            margin-bottom: 0.75rem;
            border-radius: 12px;
            max-width: 80%;
            word-wrap: break-word;
            ${msg.type === 'user' 
                ? 'background: #4F7CFF; color: white; margin-left: auto; text-align: right;' 
                : 'background: #F5F7FA; color: #2D3748;'
            }
        `;
        
        if (instant || index < chatbotMessages.length - 1 || msg.type === 'user') {
            messageDiv.textContent = msg.text;
        } else {
            // Show typing effect for last bot message
            showTypingEffect(messageDiv, msg.text);
        }
        
        messagesContainer.appendChild(messageDiv);
    });
    
    chatbotBody.appendChild(messagesContainer);
    
    // Scroll to bottom
    chatbotBody.scrollTop = chatbotBody.scrollHeight;
}

// Show typing effect
function showTypingEffect(element, text) {
    chatbotTyping = true;
    let index = 0;
    
    const typeInterval = setInterval(() => {
        if (index < text.length) {
            element.textContent = text.substring(0, index + 1);
            index++;
            
            // Scroll to bottom as typing
            const chatbotBody = document.querySelector('.chatbot-body');
            if (chatbotBody) {
                chatbotBody.scrollTop = chatbotBody.scrollHeight;
            }
        } else {
            clearInterval(typeInterval);
            chatbotTyping = false;
        }
    }, 30); // Typing speed: 30ms per character
}

// Process user message and generate response
function processUserMessage(message) {
    const lowerMessage = message.toLowerCase();
    
    // Show typing indicator
    showTypingIndicator();
    
    setTimeout(() => {
        hideTypingIndicator();
        
        let response = '';
        
        // Keyword matching for FAQ responses
        if (lowerMessage.includes('price') || lowerMessage.includes('cost') || lowerMessage.includes('pricing')) {
            response = '💰 **Pricing Information:**\n\nCourse pricing is set by instructors. Instructors keep 60% of course sales, and we only deduct fees when you earn. Prices are displayed in your local currency and processed securely through Stripe.';
        } else if (lowerMessage.includes('instructor') || lowerMessage.includes('teach') || lowerMessage.includes('create course')) {
            response = '👨‍🏫 **Becoming an Instructor:**\n\n1. Sign up as an instructor\n2. Create your first course with videos and descriptions\n3. Submit for review\n4. Once approved, your course goes live!\n\nYou can upload course videos, preview videos, cover images, and course materials.';
        } else if (lowerMessage.includes('earn') || lowerMessage.includes('earning') || lowerMessage.includes('money')) {
            response = '💵 **Earnings:**\n\nYou keep 60% of every course sale with no monthly fees. Set your own prices and track earnings in real-time. Top instructors earn thousands per month!';
        } else if (lowerMessage.includes('payment') || lowerMessage.includes('pay') || lowerMessage.includes('card')) {
            response = '💳 **Payment Methods:**\n\nWe accept all major payment methods through Stripe: Credit cards, debit cards, digital wallets (Apple Pay, Google Pay), and bank transfers in supported regions. All payments are secure and encrypted.';
        } else if (lowerMessage.includes('currency') || lowerMessage.includes('currencies') || lowerMessage.includes('money')) {
            response = '🌍 **Supported Currencies:**\n\nWe support USD, NGN, GBP, EUR, CAD, and more. Prices are automatically converted to your local currency based on current exchange rates.';
        } else if (lowerMessage.includes('help') || lowerMessage.includes('support') || lowerMessage.includes('contact')) {
            response = '🆘 **Help & Support:**\n\nYou can:\n• Browse our FAQ buttons below\n• Contact us through the Contact Us page\n• Check the Help Center for detailed guides\n• Message your course instructors for course-specific questions';
        } else if (lowerMessage.includes('hello') || lowerMessage.includes('hi') || lowerMessage.includes('hey')) {
            response = '👋 Hello! How can I help you today? Feel free to ask about pricing, becoming an instructor, payments, or anything else about LEARNible!';
        } else {
            response = 'I understand you\'re asking about "' + message + '". While I can help with general questions about LEARNible, for specific course questions, please message your instructor. You can also click the FAQ buttons below for quick answers!';
        }
        
        addBotMessage(response);
    }, 800 + Math.random() * 500); // Simulate thinking time
}

// Show typing indicator
function showTypingIndicator() {
    const chatbotBody = document.querySelector('.chatbot-body');
    if (!chatbotBody) return;
    
    const typingDiv = document.createElement('div');
    typingDiv.className = 'chatbot-typing';
    typingDiv.innerHTML = '<div class="typing-dots"><span></span><span></span><span></span></div>';
    typingDiv.style.cssText = 'padding: 0.75rem 1rem; margin-bottom: 0.75rem;';
    
    chatbotBody.appendChild(typingDiv);
    chatbotBody.scrollTop = chatbotBody.scrollHeight;
}

// Hide typing indicator
function hideTypingIndicator() {
    const typingIndicator = document.querySelector('.chatbot-typing');
    if (typingIndicator) {
        typingIndicator.remove();
    }
}

// Handle FAQ button clicks
function showFAQAnswer(faqType) {
    // Get FAQ content from localStorage (editable content)
    let answer;
    
    if (typeof getFAQContent === 'function') {
        answer = getFAQContent(faqType);
    } else {
        // Fallback to default content
        const defaultAnswers = {
            'pricing': {
                title: '💰 How does pricing work?',
                content: `Course pricing is set by instructors. Here's how it works:

• Instructors set their own course prices
• Students pay the listed price to enroll
• LEARNIBLE uses Stripe for secure payment processing
• Prices are displayed in your local currency
• All payments are processed securely with DRM protection

Instructors keep 60% of course sales, and we only deduct fees when you earn - no hidden costs!`
            },
            'instructor': {
                title: '👨‍🏫 How do I become an instructor?',
                content: `Becoming an instructor is easy:

1. Sign up as an instructor
2. Create your first course with videos, descriptions, and pricing
3. Submit your course for review
4. Once approved, your course goes live and students can enroll

You can upload:
• Course videos (single or module-based)
• Optional preview videos
• Custom cover images
• Course descriptions and materials

Start sharing your knowledge today!`
            },
            'earnings': {
                title: '💵 How much can I earn?',
                content: `Your earning potential is unlimited! Here's the breakdown:

• You keep 60% of every course sale
• No monthly fees - we only take a percentage when you make a sale
• Set your own course prices
• Track your earnings in real-time through your instructor dashboard

Top instructors earn thousands per month by creating quality courses and building their student base. The more courses you create and the better they are, the more you can earn!`
            },
            'payments': {
                title: '💳 What payment methods do you accept?',
                content: `We accept all major payment methods through Stripe:

• Credit cards (Visa, Mastercard, American Express)
• Debit cards
• Digital wallets (Apple Pay, Google Pay)
• Bank transfers (in supported regions)

All payments are processed securely through Stripe's industry-leading security. Your payment information is never stored on our servers.`
            },
            'currencies': {
                title: '🌍 Which currencies are supported?',
                content: `We support multiple currencies for global accessibility:

• USD - US Dollar
• NGN - Nigerian Naira
• GBP - British Pound
• EUR - Euro
• CAD - Canadian Dollar

Prices are automatically converted to your local currency based on current exchange rates. You can change your currency preference in the header selector.`
            }
        };
        answer = defaultAnswers[faqType];
    }
    
    if (answer && answer.title && answer.content) {
        // Add as bot message with typing effect
        const fullResponse = `${answer.title}\n\n${answer.content}`;
        addBotMessage(fullResponse);
    }
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initChatbot);
} else {
    initChatbot();
}

