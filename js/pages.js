// Update user name display on all pages
function updateUserNameDisplay() {
    const userSession = JSON.parse(localStorage.getItem('userSession') || '{}');
    if (!userSession.email) return;
    
    const userName = userSession.name || userSession.email.split('@')[0];
    const userRole = userSession.role || '';
    
    // Update dashboard headers
    const studentUserName = document.getElementById('studentUserName');
    const instructorUserName = document.getElementById('instructorUserName');
    const adminUserName = document.getElementById('adminUserName');
    const superAdminUserName = document.getElementById('superAdminUserName');
    const landingUserName = document.getElementById('landingUserName');
    
    if (studentUserName && userRole === 'student') {
        studentUserName.textContent = `👤 ${userName}`;
    }
    if (instructorUserName && userRole === 'instructor') {
        instructorUserName.textContent = `👤 ${userName}`;
    }
    if (adminUserName && userRole === 'admin') {
        adminUserName.textContent = `👤 ${userName}`;
    }
    if (superAdminUserName && userRole === 'superadmin') {
        superAdminUserName.textContent = `👤 ${userName}`;
    }
    if (landingUserName) {
        landingUserName.textContent = `👤 ${userName}`;
        landingUserName.style.display = 'inline-block';
    }
    
    // Show/hide dashboard button and auth buttons on landing page
    const landingDashboardButton = document.getElementById('landingDashboardButton');
    const landingAuthButtons = document.getElementById('landingAuthButtons');
    
    if (landingDashboardButton && landingAuthButtons) {
        if (userSession.email) {
            landingDashboardButton.style.display = 'inline-block';
            landingAuthButtons.style.display = 'none';
        } else {
            landingDashboardButton.style.display = 'none';
            landingAuthButtons.style.display = 'inline-block';
        }
    }
}

// Navigate to website (from dashboard)
function navigateToWebsite() {
    showPage('landing');
    updateUserNameDisplay();
}

// Navigate to dashboard (from website)
function navigateToDashboard() {
    const userSession = JSON.parse(localStorage.getItem('userSession') || '{}');
    const userRole = userSession.role || '';
    
    if (!userSession.email) {
        alert('Please log in to access your dashboard.');
        if (typeof openModal === 'function') {
            openModal('login');
        }
        return;
    }
    
    switch(userRole) {
        case 'student':
            showPage('studentDashboard');
            break;
        case 'instructor':
            showPage('instructorDashboard');
            break;
        case 'admin':
            showPage('adminDashboard');
            break;
        case 'superadmin':
            showPage('superAdminDashboard');
            break;
        default:
            showPage('landing');
    }
    
    updateUserNameDisplay();
}

// Page navigation
function showPage(pageName) {
    // Hide all pages
    const pages = ['landingPage', 'communityPage', 'aboutPage', 'helpCenterPage', 'contactUsPage', 'termsOfServicePage', 'privacyPolicyPage', 'studentDashboard', 'instructorDashboard', 'adminDashboard', 'superAdminDashboard'];
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
        'about': 'aboutPage',
        'helpCenter': 'helpCenterPage',
        'contactUs': 'contactUsPage',
        'termsOfService': 'termsOfServicePage',
        'privacyPolicy': 'privacyPolicyPage',
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
    
    // Update user name display whenever page changes
    updateUserNameDisplay();
    
    // Scroll to top
    window.scrollTo(0, 0);
}

// Initialize user display on page load
document.addEventListener('DOMContentLoaded', function() {
    updateUserNameDisplay();
});

// Show About Page
function showAboutPage() {
    // Show the About page (content is static in HTML now)
    showPage('about');
    // Show first tab by default
    if (typeof showAboutTab === 'function') {
        showAboutTab('vision-mission');
    }
}

// Show Help Center Page
function showHelpCenter() {
    showPage('helpCenter');
    // Load content from localStorage if available
    const contentPages = JSON.parse(localStorage.getItem('contentPages') || '{}');
    const helpContent = contentPages['help'];
    const contentDiv = document.getElementById('helpCenterContent');
    
    if (helpContent && contentDiv) {
        contentDiv.innerHTML = `
            <div style="background: #F7FAFC; padding: 2rem; border-radius: 12px; margin-bottom: 2rem;">
                <h2>${helpContent.title}</h2>
                <div style="white-space: pre-line; line-height: 1.8;">${helpContent.content}</div>
            </div>
        `;
    }
}

// Show Contact Us Page
function showContactUs() {
    showPage('contactUs');
}

// Show Terms of Service Page
function showTermsOfService() {
    showPage('termsOfService');
    // Load content from localStorage if available
    const contentPages = JSON.parse(localStorage.getItem('contentPages') || '{}');
    const termsContent = contentPages['terms'];
    const contentDiv = document.getElementById('termsContent');
    
    if (termsContent && contentDiv) {
        contentDiv.innerHTML = `
            <h2>${termsContent.title}</h2>
            <div style="white-space: pre-line; line-height: 1.8;">${termsContent.content}</div>
        `;
    } else if (contentDiv) {
        contentDiv.innerHTML = `
            <p>Please read these terms carefully before using our platform.</p>
            <h2 style="margin-top: 2rem;">1. Acceptance of Terms</h2>
            <p>By accessing and using LEARNIBLE, you accept and agree to be bound by the terms and provision of this agreement.</p>
            <h2 style="margin-top: 2rem;">2. Use License</h2>
            <p>Permission is granted to temporarily access the materials on LEARNIBLE for personal, non-commercial transitory viewing only.</p>
            <h2 style="margin-top: 2rem;">3. User Accounts</h2>
            <p>You are responsible for maintaining the confidentiality of your account and password.</p>
            <h2 style="margin-top: 2rem;">4. Course Content</h2>
            <p>All course content is protected by copyright and other intellectual property laws.</p>
        `;
    }
}

// Show Privacy Policy Page
function showPrivacyPolicy() {
    showPage('privacyPolicy');
    // Load content from localStorage if available
    const contentPages = JSON.parse(localStorage.getItem('contentPages') || '{}');
    const privacyContent = contentPages['privacy'];
    const contentDiv = document.getElementById('privacyContent');
    
    if (privacyContent && contentDiv) {
        contentDiv.innerHTML = `
            <h2>${privacyContent.title}</h2>
            <div style="white-space: pre-line; line-height: 1.8;">${privacyContent.content}</div>
        `;
    } else if (contentDiv) {
        contentDiv.innerHTML = `
            <p>We respect your privacy and are committed to protecting your personal data.</p>
            <h2 style="margin-top: 2rem;">1. Information We Collect</h2>
            <p>We collect information that you provide directly to us, including name, email address, and payment information.</p>
            <h2 style="margin-top: 2rem;">2. How We Use Your Information</h2>
            <p>We use the information we collect to provide, maintain, and improve our services.</p>
            <h2 style="margin-top: 2rem;">3. Data Security</h2>
            <p>We implement appropriate security measures to protect your personal information.</p>
            <h2 style="margin-top: 2rem;">4. Your Rights</h2>
            <p>You have the right to access, update, or delete your personal information at any time.</p>
        `;
    }
}

// About Page Tab Navigation
function showAboutTab(tabName) {
    // Hide all tab contents
    const tabContents = document.querySelectorAll('.about-tab-content');
    tabContents.forEach(content => {
        content.classList.add('hidden');
        content.classList.remove('active');
    });
    
    // Remove active class from all tabs
    const tabs = document.querySelectorAll('.about-tab');
    tabs.forEach(tab => {
        tab.classList.remove('active');
    });
    
    // Show selected tab content
    const selectedTabContent = document.getElementById(tabName + '-tab');
    if (selectedTabContent) {
        selectedTabContent.classList.remove('hidden');
        selectedTabContent.classList.add('active');
    }
    
    // Add active class to clicked tab
    const selectedTab = event ? event.target : null;
    if (selectedTab) {
        selectedTab.classList.add('active');
    } else {
        // Find and activate the corresponding tab button
        const tabButtons = document.querySelectorAll('.about-tab');
        tabButtons.forEach(button => {
            if (button.getAttribute('onclick') === `showAboutTab('${tabName}')`) {
                button.classList.add('active');
            }
        });
    }
    
    // Scroll to top of tab content
    if (selectedTabContent) {
        selectedTabContent.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
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

// Initialize user display on page load
document.addEventListener('DOMContentLoaded', function() {
    updateUserNameDisplay();
});

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

// Student section navigation
function showStudentSection(sectionName, event) {
    // Hide all student sections
    const sections = document.querySelectorAll('.student-section');
    sections.forEach(section => {
        section.classList.add('hidden');
    });
    
    // Show selected section
    const sectionMap = {
        'dashboard': 'studentDashboardSection',
        'myCourses': 'studentMyCoursesSection',
        'learningPath': 'studentLearningPathSection',
        'wishlist': 'studentWishlistSection',
        'certificates': 'studentCertificatesSection',
        'messages': 'studentMessagesSection',
        'settings': 'studentSettingsSection'
    };
    
    const targetSectionId = sectionMap[sectionName] || sectionName;
    const targetSection = document.getElementById(targetSectionId);
    if (targetSection) {
        targetSection.classList.remove('hidden');
    }
    
    // Update active state in sidebar
    const sidebarLinks = document.querySelectorAll('#studentDashboard .sidebar-menu li a');
    sidebarLinks.forEach(link => {
        link.classList.remove('active');
    });
    
    // Set active state on clicked link
    if (event && event.target) {
        event.target.classList.add('active');
    }
    
    // Load data when opening messages section
    if (sectionName === 'messages' && typeof loadStudentMessages === 'function') {
        loadStudentMessages();
    }
    
    // Load enrolled courses when opening My Courses section
    if (sectionName === 'myCourses' && typeof loadStudentEnrolledCourses === 'function') {
        loadStudentEnrolledCourses();
    }
    
    // Load course suggestions when opening dashboard
    if (sectionName === 'dashboard' && typeof loadCourseSuggestions === 'function') {
        loadCourseSuggestions();
    }
    
    // Scroll to top
    window.scrollTo(0, 0);
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
        'promoCodes': 'adminPromoCodesSection',
        'messages': 'adminMessagesSection',
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
    
    // Load data when opening specific sections
    if (sectionName === 'pendingReview' && typeof loadAdminPendingCourses === 'function') {
        loadAdminPendingCourses();
    } else if (sectionName === 'courses' && typeof loadAdminAllCourses === 'function') {
        loadAdminAllCourses();
    } else if (sectionName === 'promoCodes' && typeof loadPromoCodes === 'function') {
        loadPromoCodes('admin');
    } else if (sectionName === 'messages' && typeof loadAdminMessages === 'function') {
        loadAdminMessages();
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
        'settings': 'instructorSettingsSection',
        'promoCodes': 'instructorPromoCodesSection'
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
    
    // Load data when opening specific sections
    if (sectionName === 'myCourses' && typeof loadInstructorCourses === 'function') {
        loadInstructorCourses();
    } else if (sectionName === 'revenue' && typeof loadInstructorRevenue === 'function') {
        loadInstructorRevenue();
    } else if (sectionName === 'analytics' && typeof loadInstructorAnalytics === 'function') {
        loadInstructorAnalytics();
    } else if (sectionName === 'reviews' && typeof loadInstructorReviews === 'function') {
        loadInstructorReviews();
    } else if (sectionName === 'messages' && typeof loadInstructorMessages === 'function') {
        loadInstructorMessages();
    } else if (sectionName === 'promoCodes' && typeof loadPromoCodes === 'function') {
        loadPromoCodes('instructor');
        loadInstructorMessages();
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
        'dataManagement': 'superAdminDataManagementSection',
        'siteSettings': 'superAdminSiteSettingsSection',
        'promoCodes': 'superAdminPromoCodesSection',
        'messages': 'superAdminMessagesSection',
        'settings': 'superAdminSettingsSection',
        'socialMedia': 'superAdminSocialMediaSection',
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
    
    // Load social media settings if Social Media section is opened
    if (sectionName === 'socialMedia' && typeof loadSocialMediaSettings === 'function') {
        loadSocialMediaSettings();
    }
    
    // Load promo codes if Promo Codes section is opened
    if (sectionName === 'promoCodes' && typeof loadPromoCodes === 'function') {
        loadPromoCodes('superadmin');
    }
    
    // Load messages if Messages section is opened
    if (sectionName === 'messages' && typeof loadAdminMessages === 'function') {
        loadAdminMessages();
    }
    
    // Load data when opening specific sections
    if (sectionName === 'dataManagement' && typeof loadDataManagementTable === 'function') {
        loadDataManagementTable();
    } else if (sectionName === 'allCourses' && typeof loadSuperAdminAllCourses === 'function') {
        loadSuperAdminAllCourses();
    } else if (sectionName === 'stripeSettings') {
        if (typeof loadStripeSettings === 'function') {
            loadStripeSettings();
        }
    } else if (sectionName === 'siteSettings') {
        if (typeof loadVideoPreviewSettings === 'function') {
            loadVideoPreviewSettings();
        }
    } else if (sectionName === 'promoCodes' && typeof loadPromoCodes === 'function') {
        loadPromoCodes('superadmin');
    }
    
    // Load promo codes for admin
    if (sectionName === 'promoCodes' && typeof loadPromoCodes === 'function') {
        loadPromoCodes('admin');
    }
    
    // Scroll to top
    window.scrollTo(0, 0);
}

