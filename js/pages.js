// Page navigation
function showPage(pageName) {
    // Hide all pages
    const pages = ['landingPage', 'communityPage', 'studentDashboard', 'instructorDashboard', 'adminDashboard', 'superAdminDashboard'];
    pages.forEach(pageId => {
        const page = document.getElementById(pageId);
        if (page) {
            page.classList.add('hidden');
        }
    });
    
    // Show selected page
    const pageMap = {
        'landing': 'landingPage',
        'community': 'communityPage',
        'studentDashboard': 'studentDashboard',
        'instructorDashboard': 'instructorDashboard',
        'adminDashboard': 'adminDashboard',
        'superAdminDashboard': 'superAdminDashboard'
    };
    
    const targetPageId = pageMap[pageName] || pageName;
    const targetPage = document.getElementById(targetPageId);
    if (targetPage) {
        targetPage.classList.remove('hidden');
    }
    
    // Scroll to top
    window.scrollTo(0, 0);
}

// Logout
function logout() {
    showPage('landing');
}

// Toggle chatbot
function toggleChatbot() {
    const window = document.getElementById('chatbotWindow');
    if (window) {
        window.classList.toggle('active');
    }
}

