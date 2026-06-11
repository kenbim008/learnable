/* LEARNible FAQ chatbot — client-side only, no backend dependency */

let chatbotMessages = [];
let chatbotTyping = false;

const FAQ_ANSWERS = {
    pricing: {
        title: "💰 How does pricing work?",
        content: `Course pricing is set by instructors. Here's how it works:

• Instructors set their own course prices
• Students pay the listed price to enroll
• LEARNible uses Stripe for secure payment processing
• Prices are displayed in your local currency
• All payments are processed securely

Instructors keep 60% of course sales, and we only deduct fees when you earn.`,
    },
    instructor: {
        title: "👨‍🏫 How do I become an instructor?",
        content: `Becoming an instructor is easy:

1. Sign up as an instructor
2. Create your first course with videos, descriptions, and pricing
3. Submit your course for review
4. Once approved, your course goes live and students can enroll

Start sharing your knowledge today!`,
    },
    earnings: {
        title: "💵 How much can I earn?",
        content: `Your earning potential is unlimited:

• You keep 60% of every course sale
• No monthly fees — we only take a percentage when you make a sale
• Set your own course prices
• Track your earnings in real-time through your instructor dashboard`,
    },
    payments: {
        title: "💳 What payment methods do you accept?",
        content: `We accept all major payment methods through Stripe:

• Credit cards (Visa, Mastercard, American Express)
• Debit cards
• Digital wallets (Apple Pay, Google Pay)
• Bank transfers (in supported regions)

All payments are processed securely through Stripe.`,
    },
    currencies: {
        title: "🌍 Which currencies are supported?",
        content: `We support multiple currencies for global accessibility:

• USD — US Dollar
• NGN — Nigerian Naira
• GBP — British Pound
• EUR — Euro
• CAD — Canadian Dollar

Prices are automatically converted based on current exchange rates. Change your currency in the header selector.`,
    },
};

function toggleChatbot() {
    const win = document.getElementById("chatbotWindow");
    if (win) win.classList.toggle("active");
}

function initChatbot() {
    const chatbot = document.querySelector(".chatbot");
    if (!chatbot) return;

    const chatbotInput = document.querySelector(".chatbot-input input");
    const chatbotSendBtn = document.querySelector(".chatbot-input button");
    const chatbotBody = document.querySelector(".chatbot-body");

    document.querySelectorAll(".faq-btn").forEach((btn) => {
        btn.addEventListener("click", () => {
            const faqType = btn.getAttribute("data-faq");
            if (faqType) showFAQAnswer(faqType);
        });
    });

    if (chatbotBody && chatbotMessages.length === 0) {
        addBotMessage(
            "👋 Hi! I'm your LEARNible FAQ Bot. Ask me anything or click the buttons below for quick answers!",
            true
        );
    }

    chatbotSendBtn?.addEventListener("click", handleChatbotSend);
    chatbotInput?.addEventListener("keypress", (e) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleChatbotSend();
        }
    });
}

function handleChatbotSend() {
    const input = document.querySelector(".chatbot-input input");
    if (!input) return;

    const message = input.value.trim();
    if (!message || chatbotTyping) return;

    addUserMessage(message);
    input.value = "";

    setTimeout(() => processUserMessage(message), 400);
}

function addUserMessage(text) {
    chatbotMessages.push({ type: "user", text });
    renderChatbotMessages();
}

function addBotMessage(text, instant = false) {
    chatbotMessages.push({ type: "bot", text });
    renderChatbotMessages(instant);
}

function renderChatbotMessages(instant = false) {
    const chatbotBody = document.querySelector(".chatbot-body");
    if (!chatbotBody) return;

    let messagesContainer = chatbotBody.querySelector(".chatbot-messages");
    if (!messagesContainer) {
        messagesContainer = document.createElement("div");
        messagesContainer.className = "chatbot-messages";
        const faqButtons = chatbotBody.querySelector(".faq-buttons");
        chatbotBody.insertBefore(messagesContainer, faqButtons || null);
    }

    messagesContainer.innerHTML = "";
    chatbotBody.querySelectorAll(".chatbot-typing").forEach((el) => el.remove());

    chatbotMessages.forEach((msg, index) => {
        const messageDiv = document.createElement("div");
        messageDiv.className = `chatbot-message-item chatbot-message-item--${msg.type}`;

        if (instant || index < chatbotMessages.length - 1 || msg.type === "user") {
            messageDiv.textContent = msg.text;
        } else {
            showTypingEffect(messageDiv, msg.text);
        }

        messagesContainer.appendChild(messageDiv);
    });

    chatbotBody.scrollTop = chatbotBody.scrollHeight;
}

function showTypingEffect(element, text) {
    chatbotTyping = true;
    let index = 0;

    const typeInterval = setInterval(() => {
        if (index < text.length) {
            element.textContent = text.substring(0, index + 1);
            index++;
            const chatbotBody = document.querySelector(".chatbot-body");
            if (chatbotBody) chatbotBody.scrollTop = chatbotBody.scrollHeight;
        } else {
            clearInterval(typeInterval);
            chatbotTyping = false;
        }
    }, 24);
}

function processUserMessage(message) {
    const lowerMessage = message.toLowerCase();
    showTypingIndicator();

    setTimeout(() => {
        hideTypingIndicator();

        let response;
        if (lowerMessage.includes("price") || lowerMessage.includes("cost") || lowerMessage.includes("pricing")) {
            response = FAQ_ANSWERS.pricing.title + "\n\n" + FAQ_ANSWERS.pricing.content;
        } else if (lowerMessage.includes("instructor") || lowerMessage.includes("teach")) {
            response = FAQ_ANSWERS.instructor.title + "\n\n" + FAQ_ANSWERS.instructor.content;
        } else if (lowerMessage.includes("earn") || lowerMessage.includes("earning")) {
            response = FAQ_ANSWERS.earnings.title + "\n\n" + FAQ_ANSWERS.earnings.content;
        } else if (lowerMessage.includes("payment") || lowerMessage.includes("pay") || lowerMessage.includes("card")) {
            response = FAQ_ANSWERS.payments.title + "\n\n" + FAQ_ANSWERS.payments.content;
        } else if (lowerMessage.includes("currency") || lowerMessage.includes("currencies")) {
            response = FAQ_ANSWERS.currencies.title + "\n\n" + FAQ_ANSWERS.currencies.content;
        } else if (lowerMessage.includes("hello") || lowerMessage.includes("hi") || lowerMessage.includes("hey")) {
            response =
                "👋 Hello! How can I help you today? Feel free to ask about pricing, becoming an instructor, payments, or anything else about LEARNible!";
        } else {
            response =
                'I can help with general questions about LEARNible. Try the FAQ buttons below, or ask about pricing, instructors, payments, or currencies.';
        }

        addBotMessage(response);
    }, 700 + Math.random() * 400);
}

function showFAQAnswer(faqType) {
    const answer = FAQ_ANSWERS[faqType];
    if (!answer) return;
    addBotMessage(`${answer.title}\n\n${answer.content}`);
}

function showTypingIndicator() {
    const chatbotBody = document.querySelector(".chatbot-body");
    if (!chatbotBody) return;

    const typingDiv = document.createElement("div");
    typingDiv.className = "chatbot-typing";
    typingDiv.innerHTML = '<div class="typing-dots"><span></span><span></span><span></span></div>';
    chatbotBody.appendChild(typingDiv);
    chatbotBody.scrollTop = chatbotBody.scrollHeight;
}

function hideTypingIndicator() {
    document.querySelector(".chatbot-typing")?.remove();
}

document.addEventListener("DOMContentLoaded", initChatbot);
