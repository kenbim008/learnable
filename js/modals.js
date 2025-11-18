// Modal functions
function openModal(type) {
    const modal = document.getElementById(type + 'Modal');
    if (modal) {
        modal.classList.add('active');
    }
}

function closeModal(type) {
    const modal = document.getElementById(type + 'Modal');
    if (modal) {
        modal.classList.remove('active');
    }
}

function openSignupAsStudent() {
    selectRole('student');
    openModal('signup');
}

function openSignupAsInstructor() {
    selectRole('instructor');
    openModal('signup');
}

function selectRole(role) {
    const roleInput = document.getElementById('signupRole');
    const studentBtn = document.getElementById('studentRoleBtn');
    const instructorBtn = document.getElementById('instructorRoleBtn');
    
    if (roleInput) roleInput.value = role;
    if (studentBtn) studentBtn.classList.toggle('active', role === 'student');
    if (instructorBtn) instructorBtn.classList.toggle('active', role === 'instructor');
}

function showAdminLogin() {
    openModal('login');
    const roleSelect = document.getElementById('loginRole');
    if (roleSelect) {
        roleSelect.value = 'admin';
        toggleAdminCode('login');
    }
}

function showAdminSignup() {
    closeModal('signup');
    openModal('adminSignup');
}

function showSuperAdminSignup() {
    closeModal('signup');
    openModal('superAdminSignup');
}

// Initialize access codes in localStorage if not exists
function initializeAccessCodes() {
    if (!localStorage.getItem('superAdminAccessCode')) {
        localStorage.setItem('superAdminAccessCode', 'SUPERADMIN2024');
    }
    if (!localStorage.getItem('adminAccessCodes')) {
        localStorage.setItem('adminAccessCodes', JSON.stringify(['ADMIN2024']));
    }
    // Update display
    updateAccessCodeDisplay();
}

// Update access code display
function updateAccessCodeDisplay() {
    const superAdminCode = localStorage.getItem('superAdminAccessCode') || 'SUPERADMIN2024';
    const currentCodeElement = document.getElementById('currentSuperAdminCode');
    if (currentCodeElement) {
        currentCodeElement.textContent = superAdminCode;
    }
}

// Get Super Admin access code
function getSuperAdminAccessCode() {
    return localStorage.getItem('superAdminAccessCode') || 'SUPERADMIN2024';
}

// Get Admin access codes
function getAdminAccessCodes() {
    const codes = localStorage.getItem('adminAccessCodes');
    return codes ? JSON.parse(codes) : ['ADMIN2024'];
}

// Update Super Admin access code
function updateSuperAdminAccessCode() {
    const newCode = document.getElementById('superAdminAccessCode').value.trim();
    if (!newCode) {
        alert('Please enter a new access code!');
        return;
    }
    if (newCode.length < 6) {
        alert('Access code must be at least 6 characters long!');
        return;
    }
    localStorage.setItem('superAdminAccessCode', newCode);
    updateAccessCodeDisplay();
    document.getElementById('superAdminAccessCode').value = '';
    alert('Super Admin access code updated successfully!');
}

// Generate Admin access code
function generateAdminAccessCode() {
    const customCode = document.getElementById('newAdminCode').value.trim();
    let newCode;
    
    if (customCode) {
        newCode = customCode;
    } else {
        // Auto-generate code
        const timestamp = Date.now().toString(36).toUpperCase();
        const random = Math.random().toString(36).substring(2, 8).toUpperCase();
        newCode = `ADMIN-${timestamp}-${random}`;
    }
    
    // Get existing codes
    const codes = getAdminAccessCodes();
    codes.push(newCode);
    localStorage.setItem('adminAccessCodes', JSON.stringify(codes));
    
    // Display generated code
    document.getElementById('displayAdminCode').textContent = newCode;
    document.getElementById('generatedAdminCode').style.display = 'block';
    document.getElementById('newAdminCode').value = '';
    
    // Add to recent codes list
    addCodeToList(newCode);
}

// Copy admin code to clipboard
function copyAdminCode() {
    const code = document.getElementById('displayAdminCode').textContent;
    navigator.clipboard.writeText(code).then(() => {
        alert('Access code copied to clipboard!');
    }).catch(() => {
        // Fallback for older browsers
        const textArea = document.createElement('textarea');
        textArea.value = code;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
        alert('Access code copied to clipboard!');
    });
}

// Add code to recent codes list
function addCodeToList(code) {
    const list = document.getElementById('adminCodesList');
    if (list) {
        const now = new Date();
        const dateStr = now.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
        const newItem = document.createElement('div');
        newItem.className = 'content-item';
        newItem.innerHTML = `
            <div>
                <h3>${code}</h3>
                <p>Generated: ${dateStr} • Used: No • Expires: Never</p>
            </div>
            <button class="btn btn-outline" onclick="revokeAdminCode('${code}', this)">Revoke</button>
        `;
        list.insertBefore(newItem, list.firstChild);
    }
}

// Revoke admin code
function revokeAdminCode(code, button) {
    if (confirm(`Are you sure you want to revoke access code: ${code}?`)) {
        const codes = getAdminAccessCodes();
        const index = codes.indexOf(code);
        if (index > -1) {
            codes.splice(index, 1);
            localStorage.setItem('adminAccessCodes', JSON.stringify(codes));
        }
        button.closest('.content-item').remove();
        alert('Access code revoked successfully!');
    }
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', function() {
    initializeAccessCodes();
});

function toggleAdminCode(type) {
    const role = document.getElementById(type + 'Role');
    const codeGroup = document.getElementById(type + 'AdminCodeGroup');
    if (role && codeGroup) {
        if (role.value === 'admin' || role.value === 'superadmin') {
            codeGroup.classList.remove('hidden');
        } else {
            codeGroup.classList.add('hidden');
        }
    }
}

function toggleCoverUpload() {
    const option = document.getElementById('coverOption');
    const uploadDiv = document.getElementById('customCoverUpload');
    if (option && uploadDiv) {
        if (option.value === 'custom') {
            uploadDiv.classList.remove('hidden');
        } else {
            uploadDiv.classList.add('hidden');
        }
    }
}

// Handle login
function handleLogin(e) {
    e.preventDefault();
    const role = document.getElementById('loginRole').value;
    const email = document.getElementById('loginEmail').value;
    const adminCode = document.getElementById('loginAdminCode')?.value;
    
    // Verify admin code for admin/superadmin
    if ((role === 'admin' || role === 'superadmin') && !adminCode) {
        alert('Admin access code is required!');
        return;
    }

    // Check access codes dynamically
    if (role === 'superadmin') {
        const superAdminCode = getSuperAdminAccessCode();
        if (adminCode !== superAdminCode) {
            alert('Invalid Super Admin access code!');
            return;
        }
    } else if (role === 'admin') {
        const adminCodes = getAdminAccessCodes();
        if (!adminCodes.includes(adminCode)) {
            alert('Invalid admin access code!');
            return;
        }
    }
    
    closeModal('login');
    
    // Save session data
    const sessionData = {
        role: role,
        email: email,
        timestamp: Date.now(),
        expiresAt: Date.now() + (15 * 60 * 1000) // 15 minutes
    };
    localStorage.setItem('userSession', JSON.stringify(sessionData));
    
    // Show appropriate dashboard based on role
    if (role === 'student') {
        showPage('studentDashboard');
    } else if (role === 'instructor') {
        showPage('instructorDashboard');
    } else if (role === 'admin') {
        showPage('adminDashboard');
    } else if (role === 'superadmin') {
        showPage('superAdminDashboard');
    }
}

// Handle signup
function handleSignup(e) {
    e.preventDefault();
    const password = document.getElementById('signupPassword').value;
    const confirmPassword = document.getElementById('signupConfirmPassword').value;
    
    if (password !== confirmPassword) {
        alert('Passwords do not match!');
        return;
    }
    
    const role = document.getElementById('signupRole').value;
    const name = document.getElementById('signupName').value;
    
    alert(`Account created successfully for ${name} as ${role}!`);
    closeModal('signup');
    
    // Auto-login after signup
    if (role === 'student') {
        showPage('studentDashboard');
    } else if (role === 'instructor') {
        showPage('instructorDashboard');
    }
}

// Handle admin signup
function handleAdminSignup(e) {
    e.preventDefault();
    const code = document.getElementById('adminSignupCode').value;
    const password = document.getElementById('adminSignupPassword').value;
    const confirmPassword = document.getElementById('adminSignupConfirmPassword').value;
    
    // Check against stored admin access codes
    const adminCodes = getAdminAccessCodes();
    if (!adminCodes.includes(code)) {
        alert('Invalid admin access code! Contact Super Admin for a valid code.');
        return;
    }

    if (password !== confirmPassword) {
        alert('Passwords do not match!');
        return;
    }
    
    const name = document.getElementById('adminSignupName').value;
    alert(`Admin account created successfully for ${name}!`);
    closeModal('adminSignup');
    showPage('adminDashboard');
}

// Handle Super Admin signup
function handleSuperAdminSignup(e) {
    e.preventDefault();
    const code = document.getElementById('superAdminSignupCode').value;
    const password = document.getElementById('superAdminSignupPassword').value;
    const confirmPassword = document.getElementById('superAdminSignupConfirmPassword').value;
    
    // Check against stored Super Admin access code
    const superAdminCode = getSuperAdminAccessCode();
    if (code !== superAdminCode) {
        alert('Invalid Super Admin access code!');
        return;
    }

    if (password !== confirmPassword) {
        alert('Passwords do not match!');
        return;
    }
    
    const name = document.getElementById('superAdminSignupName').value;
    alert(`Super Admin account created successfully for ${name}!`);
    closeModal('superAdminSignup');
    showPage('superAdminDashboard');
}

// Toggle course structure (single vs modules)
function toggleCourseStructure() {
    const structure = document.getElementById('courseStructure').value;
    const singleVideo = document.getElementById('singleCourseVideo');
    const moduleVideos = document.getElementById('moduleCourseVideos');
    
    if (structure === 'single') {
        singleVideo.classList.remove('hidden');
        moduleVideos.classList.add('hidden');
    } else {
        singleVideo.classList.add('hidden');
        moduleVideos.classList.remove('hidden');
    }
}

// Add new module
let moduleCount = 1;
function addModule() {
    moduleCount++;
    const container = document.getElementById('modulesContainer');
    const newModule = document.createElement('div');
    newModule.className = 'module-item';
    newModule.style.cssText = 'border: 1px solid #E2E8F0; padding: 1rem; border-radius: 6px; margin-bottom: 1rem;';
    newModule.innerHTML = `
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem;">
            <h4 style="margin: 0;">Module ${moduleCount}</h4>
            <button type="button" class="btn btn-outline" onclick="removeModule(this)" style="padding: 0.25rem 0.75rem; font-size: 0.85rem;">Remove</button>
        </div>
        <div class="form-group">
            <label>Module ${moduleCount} Title</label>
            <input type="text" placeholder="Enter module title" class="module-title" style="width: 100%; padding: 0.75rem; border: 1px solid #E2E8F0; border-radius: 6px;">
        </div>
        <div class="form-group">
            <label>Module ${moduleCount} Description</label>
            <textarea rows="2" placeholder="Describe this module..." class="module-description" style="width: 100%; padding: 0.75rem; border: 1px solid #E2E8F0; border-radius: 6px;"></textarea>
        </div>
        <div class="form-group">
            <label>Module ${moduleCount} Video</label>
            <label onclick="this.querySelector('input[type=file]').click()" class="file-upload-area">
                🎥 Click to upload module video<br>
                <small style="color: #718096;">Upload video for this module (Max: 1GB per module)</small>
                <input type="file" class="module-video" accept="video/*" onchange="updateModuleVideoStatus(this)">
            </label>
            <div class="module-video-status" style="margin-top: 0.5rem; font-size: 0.9rem; color: #718096;"></div>
        </div>
    `;
    container.appendChild(newModule);
}

// Remove module
function removeModule(button) {
    button.closest('.module-item').remove();
    // Update module numbers
    const modules = document.querySelectorAll('.module-item');
    modules.forEach((module, index) => {
        const title = module.querySelector('h4');
        if (title) title.textContent = `Module ${index + 1}`;
        const labels = module.querySelectorAll('label');
        labels.forEach(label => {
            if (label.textContent.includes('Module')) {
                label.textContent = label.textContent.replace(/Module \d+/, `Module ${index + 1}`);
            }
        });
    });
    moduleCount = modules.length;
}

// Update module video status
function updateModuleVideoStatus(input) {
    const file = input.files[0];
    const statusDiv = input.closest('.form-group').querySelector('.module-video-status');
    if (file) {
        const fileSize = (file.size / (1024 * 1024)).toFixed(2);
        statusDiv.textContent = `✓ Selected: ${file.name} (${fileSize} MB)`;
        statusDiv.style.color = '#10B981';
    } else {
        statusDiv.textContent = '';
    }
}

// Handle single course video upload
document.addEventListener('DOMContentLoaded', function() {
    const courseVideoFile = document.getElementById('courseVideoFile');
    if (courseVideoFile) {
        courseVideoFile.addEventListener('change', function() {
            const file = this.files[0];
            const statusDiv = document.getElementById('singleVideoStatus');
            if (file) {
                const fileSize = (file.size / (1024 * 1024)).toFixed(2);
                statusDiv.textContent = `✓ Selected: ${file.name} (${fileSize} MB)`;
                statusDiv.style.color = '#10B981';
            } else {
                statusDiv.textContent = '';
            }
        });
    }
});

// Handle create course
function handleCreateCourse(e) {
    e.preventDefault();
    
    // Get course structure
    const structure = document.getElementById('courseStructure').value;
    let videoInfo = '';
    
    if (structure === 'single') {
        const videoFile = document.getElementById('courseVideoFile').files[0];
        if (!videoFile) {
            alert('Please upload a course video!');
            return;
        }
        videoInfo = `Single video: ${videoFile.name}`;
    } else {
        const modules = document.querySelectorAll('.module-item');
        if (modules.length === 0) {
            alert('Please add at least one module!');
            return;
        }
        let moduleVideos = [];
        modules.forEach((module, index) => {
            const videoInput = module.querySelector('.module-video');
            const titleInput = module.querySelector('.module-title');
            if (videoInput && videoInput.files[0]) {
                moduleVideos.push(`Module ${index + 1} (${titleInput.value || 'Untitled'}): ${videoInput.files[0].name}`);
            }
        });
        if (moduleVideos.length === 0) {
            alert('Please upload at least one module video!');
            return;
        }
        videoInfo = `Modules: ${moduleVideos.length} module(s) with videos`;
    }
    
    alert(`Course created successfully!\n\n${videoInfo}\n\nYour content is protected with DRM - students can stream but not download.`);
    closeModal('createCourse');
}

// Open Add User Modal
function openAddUserModal() {
    openModal('addUser');
}

// Handle Add User
function handleAddUser(e) {
    e.preventDefault();
    const name = document.getElementById('newUserName').value;
    const email = document.getElementById('newUserEmail').value;
    const role = document.getElementById('newUserRole').value;
    const password = document.getElementById('newUserPassword').value;
    const confirmPassword = document.getElementById('newUserConfirmPassword').value;
    
    if (password !== confirmPassword) {
        alert('Passwords do not match!');
        return;
    }
    
    if (!role) {
        alert('Please select a role!');
        return;
    }
    
    alert(`User "${name}" (${role}) created successfully!`);
    closeModal('addUser');
    
    // Reset form
    document.getElementById('newUserName').value = '';
    document.getElementById('newUserEmail').value = '';
    document.getElementById('newUserRole').value = '';
    document.getElementById('newUserPassword').value = '';
    document.getElementById('newUserConfirmPassword').value = '';
}

// Save Admin Permissions (Super Admin Portal)
function saveAdminPermissions() {
    const permissions = {
        userManagement: document.getElementById('perm1').checked,
        courseReview: document.getElementById('perm2').checked,
        financialReports: document.getElementById('perm3').checked,
        communityModeration: document.getElementById('perm4').checked,
        contentManagement: document.getElementById('perm5').checked,
        analyticsAccess: document.getElementById('perm6').checked,
        settingsConfiguration: document.getElementById('perm7').checked,
        systemLogs: document.getElementById('perm8').checked
    };
    
    // Store in localStorage
    localStorage.setItem('adminPermissions', JSON.stringify(permissions));
    
    alert('Admin permissions saved successfully!');
}

// Save Platform Settings (Super Admin Portal)
function savePlatformSettings() {
    const monthlyFee = document.getElementById('instructorMonthlyFee').value;
    const revenueShare = document.getElementById('instructorRevenueShare').value;
    
    if (!monthlyFee || monthlyFee <= 0) {
        alert('Please enter a valid monthly fee!');
        return;
    }
    
    if (!revenueShare || revenueShare < 0 || revenueShare > 100) {
        alert('Revenue share must be between 0 and 100!');
        return;
    }
    
    const settings = {
        instructorMonthlyFee: parseFloat(monthlyFee),
        instructorRevenueShare: parseInt(revenueShare),
        platformRevenueShare: 100 - parseInt(revenueShare)
    };
    
    // Store in localStorage
    localStorage.setItem('platformSettings', JSON.stringify(settings));
    
    alert('Platform settings saved successfully!');
}

// Save Admin Preferences (Admin Portal)
function saveAdminPreferences() {
    const preferences = {
        pendingReviews: document.getElementById('adminNotifPendingReviews').checked,
        newUsers: document.getElementById('adminNotifNewUsers').checked,
        communityReports: document.getElementById('adminNotifCommunityReports').checked
    };
    
    // Store in localStorage
    localStorage.setItem('adminPreferences', JSON.stringify(preferences));
    
    alert('Preferences saved successfully!');
}

// Generate Admin Code from Dashboard (Super Admin Portal)
function generateAdminCodeFromDashboard() {
    // Check admin count (this would normally come from backend)
    const adminCount = 2; // This should be dynamic
    if (adminCount >= 2) {
        if (confirm('Maximum admin count reached (2/2). Do you want to generate a code anyway? This will allow creating a new admin but you may need to remove an existing one first.')) {
            // Navigate to Access Codes section to generate code
            showSuperAdminSection('accessCodes', {target: document.querySelector('[onclick*="accessCodes"]')});
        }
    } else {
        // Navigate to Access Codes section to generate code
        showSuperAdminSection('accessCodes', {target: document.querySelector('[onclick*="accessCodes"]')});
    }
}

// Close modals when clicking outside
window.onclick = function(event) {
    if (event.target.classList.contains('modal')) {
        event.target.classList.remove('active');
    }
}

