// FAQ Content Management Functions

// Load FAQ content for editing
function loadFAQContent() {
    const faqList = document.getElementById('faqContentList');
    if (!faqList) return;
    
    // Get FAQ content from localStorage or use defaults
    let faqContent = JSON.parse(localStorage.getItem('faqContent') || '{}');
    
    // Default FAQ content if none exists
    const defaultFAQ = {
        'pricing': {
            id: 'pricing',
            buttonText: '💰 Pricing',
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
            id: 'instructor',
            buttonText: '👨‍🏫 Become Instructor',
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
            id: 'earnings',
            buttonText: '💵 Earnings',
            title: '💵 How much can I earn?',
            content: `Your earning potential is unlimited! Here's the breakdown:

• You keep 60% of every course sale
• No monthly fees - we only take a percentage when you make a sale
• Set your own course prices
• Track your earnings in real-time through your instructor dashboard

Top instructors earn thousands per month by creating quality courses and building their student base. The more courses you create and the better they are, the more you can earn!`
        },
        'payments': {
            id: 'payments',
            buttonText: '💳 Payments',
            title: '💳 What payment methods do you accept?',
            content: `We accept all major payment methods through Stripe:

• Credit cards (Visa, Mastercard, American Express)
• Debit cards
• Digital wallets (Apple Pay, Google Pay)
• Bank transfers (in supported regions)

All payments are processed securely through Stripe's industry-leading security. Your payment information is never stored on our servers.`
        },
        'currencies': {
            id: 'currencies',
            buttonText: '🌍 Currencies',
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
    
    // Merge defaults with saved content
    const allFAQ = { ...defaultFAQ, ...faqContent };
    
    // Display FAQ items
    faqList.innerHTML = Object.values(allFAQ).map(faq => `
        <div class="content-item">
            <div>
                <h3>${faq.title || faq.buttonText}</h3>
                <p style="color: #718096; margin-top: 0.25rem;">Button: ${faq.buttonText}</p>
                <p style="color: #4A5568; margin-top: 0.5rem; white-space: pre-wrap; max-height: 100px; overflow: hidden;">${faq.content.substring(0, 150)}${faq.content.length > 150 ? '...' : ''}</p>
            </div>
            <button class="btn btn-outline" onclick="editFAQContent('${faq.id}')">Edit</button>
        </div>
    `).join('');
}

// Edit FAQ content
function editFAQContent(faqId) {
    // Get FAQ content from localStorage or use defaults
    let faqContent = JSON.parse(localStorage.getItem('faqContent') || '{}');
    
    // Default FAQ content
    const defaultFAQ = {
        'pricing': {
            id: 'pricing',
            buttonText: '💰 Pricing',
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
            id: 'instructor',
            buttonText: '👨‍🏫 Become Instructor',
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
            id: 'earnings',
            buttonText: '💵 Earnings',
            title: '💵 How much can I earn?',
            content: `Your earning potential is unlimited! Here's the breakdown:

• You keep 60% of every course sale
• No monthly fees - we only take a percentage when you make a sale
• Set your own course prices
• Track your earnings in real-time through your instructor dashboard

Top instructors earn thousands per month by creating quality courses and building their student base. The more courses you create and the better they are, the more you can earn!`
        },
        'payments': {
            id: 'payments',
            buttonText: '💳 Payments',
            title: '💳 What payment methods do you accept?',
            content: `We accept all major payment methods through Stripe:

• Credit cards (Visa, Mastercard, American Express)
• Debit cards
• Digital wallets (Apple Pay, Google Pay)
• Bank transfers (in supported regions)

All payments are processed securely through Stripe's industry-leading security. Your payment information is never stored on our servers.`
        },
        'currencies': {
            id: 'currencies',
            buttonText: '🌍 Currencies',
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
    
    const faq = faqContent[faqId] || defaultFAQ[faqId] || {
        id: faqId,
        buttonText: '',
        title: '',
        content: ''
    };
    
    // Create edit modal
    const modal = document.createElement('div');
    modal.className = 'modal active';
    modal.style.zIndex = '10000';
    modal.innerHTML = `
        <div class="modal-content" style="max-width: 800px; max-height: 90vh; overflow-y: auto;">
            <button class="modal-close" onclick="this.closest('.modal').remove()">×</button>
            <h2>Edit FAQ Content</h2>
            <form onsubmit="saveFAQContent(event, '${faqId}')">
                <div class="form-group">
                    <label>Button Text (shown on FAQ button)</label>
                    <input type="text" id="faqButtonText" value="${faq.buttonText || ''}" required style="width: 100%; padding: 0.75rem; border: 1px solid #E2E8F0; border-radius: 6px;">
                    <p style="font-size: 0.85rem; color: #718096; margin-top: 0.25rem;">This text appears on the FAQ button in the chatbot</p>
                </div>
                <div class="form-group">
                    <label>FAQ Title</label>
                    <input type="text" id="faqTitle" value="${(faq.title || '').replace(/"/g, '&quot;')}" required style="width: 100%; padding: 0.75rem; border: 1px solid #E2E8F0; border-radius: 6px;">
                    <p style="font-size: 0.85rem; color: #718096; margin-top: 0.25rem;">Title shown when FAQ is displayed</p>
                </div>
                <div class="form-group">
                    <label>FAQ Content/Answer</label>
                    <textarea id="faqContent" rows="15" required style="width: 100%; padding: 0.75rem; border: 1px solid #E2E8F0; border-radius: 6px; font-family: inherit;">${(faq.content || '').replace(/</g, '&lt;').replace(/>/g, '&gt;')}</textarea>
                    <p style="font-size: 0.85rem; color: #718096; margin-top: 0.25rem;">The full answer content displayed when user clicks the FAQ button</p>
                </div>
                <button type="submit" class="btn btn-success" style="width: 100%;">Save FAQ Content</button>
            </form>
        </div>
    `;
    document.body.appendChild(modal);
    
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.remove();
        }
    });
}

// Save FAQ content
function saveFAQContent(event, faqId) {
    event.preventDefault();
    
    const buttonText = document.getElementById('faqButtonText').value;
    const title = document.getElementById('faqTitle').value;
    const content = document.getElementById('faqContent').value;
    
    // Get existing FAQ content
    let faqContent = JSON.parse(localStorage.getItem('faqContent') || '{}');
    
    // Save FAQ item
    faqContent[faqId] = {
        id: faqId,
        buttonText: buttonText,
        title: title,
        content: content,
        updatedAt: new Date().toISOString()
    };
    
    localStorage.setItem('faqContent', JSON.stringify(faqContent));
    
    alert('FAQ content saved successfully! The chatbot will now use the updated content.');
    
    // Close modal
    const modal = document.querySelector('.modal.active');
    if (modal) modal.remove();
    
    // Reload FAQ list
    loadFAQContent();
    
    // Update chatbot buttons if they exist
    updateChatbotFAQButtons();
}

// Update chatbot FAQ buttons with new content
function updateChatbotFAQButtons() {
    const faqButtonsContainer = document.querySelector('.faq-buttons');
    if (!faqButtonsContainer) return;
    
    const faqContent = JSON.parse(localStorage.getItem('faqContent') || '{}');
    
    // Default button texts
    const defaultButtons = {
        'pricing': '💰 Pricing',
        'instructor': '👨‍🏫 Become Instructor',
        'earnings': '💵 Earnings',
        'payments': '💳 Payments',
        'currencies': '🌍 Currencies'
    };
    
    // Update each button
    const buttons = faqButtonsContainer.querySelectorAll('.faq-btn');
    buttons.forEach(btn => {
        const onclickAttr = btn.getAttribute('onclick');
        if (onclickAttr) {
            const match = onclickAttr.match(/showFAQAnswer\('(\w+)'\)/);
            if (match) {
                const faqId = match[1];
                const faq = faqContent[faqId];
                if (faq && faq.buttonText) {
                    btn.textContent = faq.buttonText;
                } else if (defaultButtons[faqId]) {
                    btn.textContent = defaultButtons[faqId];
                }
            }
        }
    });
}

// Get FAQ content for chatbot (used by chatbot.js)
function getFAQContent(faqId) {
    const faqContent = JSON.parse(localStorage.getItem('faqContent') || '{}');
    
    // Default FAQ content
    const defaultFAQ = {
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
    
    // Return saved content or default
    if (faqContent[faqId]) {
        return {
            title: faqContent[faqId].title,
            content: faqContent[faqId].content
        };
    }
    
    return defaultFAQ[faqId] || { title: '', content: '' };
}

