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
    // Clear session data
    localStorage.removeItem('userSession');
    showPage('landing');
}

// Check and restore session on page load
function checkSession() {
    const sessionData = localStorage.getItem('userSession');
    if (sessionData) {
        try {
            const session = JSON.parse(sessionData);
            const now = Date.now();
            
            // Check if session is still valid (not expired)
            if (session.expiresAt && now < session.expiresAt) {
                // Restore the session
                if (session.role === 'superadmin') {
                    showPage('superAdminDashboard');
                } else if (session.role === 'admin') {
                    showPage('adminDashboard');
                } else if (session.role === 'instructor') {
                    showPage('instructorDashboard');
                } else if (session.role === 'student') {
                    showPage('studentDashboard');
                }
            } else {
                // Session expired, clear it
                localStorage.removeItem('userSession');
            }
        } catch (e) {
            // Invalid session data, clear it
            localStorage.removeItem('userSession');
        }
    }
}

// Check session expiration periodically (every minute)
setInterval(function() {
    const sessionData = localStorage.getItem('userSession');
    if (sessionData) {
        try {
            const session = JSON.parse(sessionData);
            const now = Date.now();
            
            // If session expired, redirect to landing page
            if (session.expiresAt && now >= session.expiresAt) {
                localStorage.removeItem('userSession');
                if (document.getElementById('superAdminDashboard') && !document.getElementById('superAdminDashboard').classList.contains('hidden')) {
                    showPage('landing');
                    alert('Your session has expired. Please login again.');
                }
            }
        } catch (e) {
            // Invalid session data
        }
    }
}, 60000); // Check every minute

// Check session when page loads
document.addEventListener('DOMContentLoaded', function() {
    checkSession();
});

// Toggle chatbot
function toggleChatbot() {
    const window = document.getElementById('chatbotWindow');
    if (window) {
        window.classList.toggle('active');
    }
}

// Admin section navigation
function showAdminSection(sectionName, event) {
    // Hide all admin sections
    const sections = document.querySelectorAll('.admin-section');
    sections.forEach(section => {
        section.classList.add('hidden');
    });
    
    // Show selected section
    const sectionMap = {
        'dashboard': 'adminDashboardSection',
        'users': 'adminUsersSection',
        'courses': 'adminCoursesSection',
        'pendingReview': 'adminPendingReviewSection',
        'community': 'adminCommunitySection',
        'contentPages': 'adminContentPagesSection',
        'financials': 'adminFinancialsSection',
        'settings': 'adminSettingsSection',
        'analytics': 'adminAnalyticsSection',
        'logs': 'adminLogsSection'
    };
    
    const targetSectionId = sectionMap[sectionName] || sectionName;
    const targetSection = document.getElementById(targetSectionId);
    if (targetSection) {
        targetSection.classList.remove('hidden');
    }
    
    // Update active state in sidebar
    const sidebarLinks = document.querySelectorAll('#adminDashboard .sidebar-menu li a');
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

// Instructor section navigation
function showInstructorSection(sectionName, event) {
    // Hide all instructor sections
    const sections = document.querySelectorAll('.instructor-section');
    sections.forEach(section => {
        section.classList.add('hidden');
    });
    
    // Show selected section
    const sectionMap = {
        'dashboard': 'instructorDashboardSection',
        'myCourses': 'instructorMyCoursesSection',
        'students': 'instructorStudentsSection',
        'revenue': 'instructorRevenueSection',
        'analytics': 'instructorAnalyticsSection',
        'reviews': 'instructorReviewsSection',
        'messages': 'instructorMessagesSection',
        'settings': 'instructorSettingsSection'
    };
    
    const targetSectionId = sectionMap[sectionName] || sectionName;
    const targetSection = document.getElementById(targetSectionId);
    if (targetSection) {
        targetSection.classList.remove('hidden');
    }
    
    // Update active state in sidebar
    const sidebarLinks = document.querySelectorAll('#instructorDashboard .sidebar-menu li a');
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
        'systemLogs': 'superAdminSystemLogsSection',
        'stripeSettings': 'superAdminStripeSettingsSection',
        'viewTransactions': 'superAdminViewTransactionsSection'
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
    
    // Refresh access code display if Access Codes section is opened
    if (sectionName === 'accessCodes' && typeof updateAccessCodeDisplay === 'function') {
        updateAccessCodeDisplay();
    }
    
    // Scroll to top
    window.scrollTo(0, 0);
}

