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

// Super Admin section navigation
function showSuperAdminSection(sectionName, event) {
    // Hide all super admin sections
    const sections = document.querySelectorAll('.super-admin-section');
    sections.forEach(section => {
        section.classList.add('hidden');
    });
    
    // Show selected section
    const sectionMap = {
        'dashboard': 'superAdminDashboardSection',
        'allUsers': 'superAdminAllUsersSection',
        'adminManagement': 'superAdminAdminManagementSection',
        'accessCodes': 'superAdminAccessCodesSection',
        'allCourses': 'superAdminAllCoursesSection',
        'revenuePayouts': 'superAdminRevenuePayoutsSection',
        'pricingSettings': 'superAdminPricingSettingsSection',
        'contentManagement': 'superAdminContentManagementSection',
        'siteSettings': 'superAdminSiteSettingsSection',
        'analytics': 'superAdminAnalyticsSection',
        'systemLogs': 'superAdminSystemLogsSection'
    };
    
    const targetSectionId = sectionMap[sectionName] || sectionName;
    const targetSection = document.getElementById(targetSectionId);
    if (targetSection) {
        targetSection.classList.remove('hidden');
    }
    
    // Update active state in sidebar
    const sidebarLinks = document.querySelectorAll('#superAdminDashboard .sidebar-menu li a');
    sidebarLinks.forEach(link => {
        link.classList.remove('active');
    });
    
    // Set active state on clicked link
    if (event && event.target) {
        event.target.classList.add('active');
    }
    
    // Scroll to top
    window.scrollTo(0, 0);
}

