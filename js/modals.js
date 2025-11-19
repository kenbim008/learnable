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
            // Reset cover file input
            const coverFile = document.getElementById('coverFile');
            if (coverFile) {
                coverFile.value = '';
                document.getElementById('coverFileStatus').textContent = '📸 Click to upload cover image';
                document.getElementById('coverFilePreview').style.display = 'none';
            }
        }
    }
}

// Handle cover file selection
function handleCoverFileSelect(input) {
    if (input.files && input.files[0]) {
        const file = input.files[0];
        const fileSizeMB = (file.size / (1024 * 1024)).toFixed(2);
        document.getElementById('coverFileStatus').textContent = `✅ ${file.name} (${fileSizeMB} MB)`;
        
        // Show preview
        const reader = new FileReader();
        reader.onload = function(e) {
            const previewImg = document.getElementById('coverPreviewImg');
            const previewDiv = document.getElementById('coverFilePreview');
            if (previewImg && previewDiv) {
                previewImg.src = e.target.result;
                previewDiv.style.display = 'block';
            }
        };
        reader.readAsDataURL(file);
    }
}

// Handle preview video file selection
function handlePreviewFileSelect(input) {
    if (input.files && input.files[0]) {
        const file = input.files[0];
        const fileSizeMB = (file.size / (1024 * 1024)).toFixed(2);
        document.getElementById('previewFileStatus').textContent = `✅ ${file.name} (${fileSizeMB} MB)`;
        document.getElementById('previewFileInfo').textContent = `File selected: ${file.name} | Size: ${fileSizeMB} MB`;
        document.getElementById('previewFileInfo').style.display = 'block';
    }
}

// Handle course video file selection
function handleCourseVideoSelect(input) {
    if (input.files && input.files[0]) {
        const file = input.files[0];
        const fileSizeMB = (file.size / (1024 * 1024)).toFixed(2);
        const statusEl = document.getElementById('courseVideoFileStatus');
        if (statusEl) {
            statusEl.textContent = `✅ ${file.name} (${fileSizeMB} MB)`;
        }
        const infoEl = document.getElementById('singleVideoStatus');
        if (infoEl) {
            infoEl.textContent = `File selected: ${file.name} | Size: ${fileSizeMB} MB`;
            infoEl.style.display = 'block';
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
// Initialize courses storage
function initializeCourses() {
    if (!localStorage.getItem('courses')) {
        localStorage.setItem('courses', JSON.stringify([]));
    }
}

// Get all courses
function getAllCourses() {
    const courses = localStorage.getItem('courses');
    return courses ? JSON.parse(courses) : [];
}

// Save course
function saveCourse(course) {
    const courses = getAllCourses();
    courses.push(course);
    localStorage.setItem('courses', JSON.stringify(courses));
    return course;
}

// Update course status
function updateCourseStatus(courseId, status, reviewedBy) {
    const courses = getAllCourses();
    const courseIndex = courses.findIndex(c => c.id === courseId);
    if (courseIndex !== -1) {
        courses[courseIndex].status = status;
        courses[courseIndex].reviewedBy = reviewedBy;
        courses[courseIndex].reviewedAt = new Date().toISOString();
        localStorage.setItem('courses', JSON.stringify(courses));
        return courses[courseIndex];
    }
    return null;
}

// Get course by ID
function getCourseById(courseId) {
    const courses = getAllCourses();
    return courses.find(c => c.id === courseId);
}

// Create file URL from File object
function createFileURL(file) {
    return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = (e) => resolve(e.target.result);
        reader.readAsDataURL(file);
    });
}

function handleCreateCourse(e) {
    e.preventDefault();
    
    // Get form data
    const title = document.querySelector('#createCourseModal input[type="text"]').value;
    const description = document.querySelector('#createCourseModal textarea').value;
    const price = document.querySelector('#createCourseModal input[type="number"]').value;
    const category = document.getElementById('courseCategory').value;
    const subcategory = document.getElementById('courseSubcategory').value;
    const structure = document.getElementById('courseStructure').value;
    
    // Get cover image
    const coverFile = document.getElementById('coverFile').files[0];
    const coverOption = document.getElementById('coverOption').value;
    
    // Get preview video
    const previewFile = document.getElementById('previewFile').files[0];
    
    // Get course videos
    let courseVideos = [];
    if (structure === 'single') {
        const videoFile = document.getElementById('courseVideoFile').files[0];
        if (!videoFile) {
            alert('Please upload a course video!');
            return;
        }
        courseVideos.push({
            type: 'single',
            file: videoFile,
            name: videoFile.name
        });
    } else {
        const modules = document.querySelectorAll('.module-item');
        if (modules.length === 0) {
            alert('Please add at least one module!');
            return;
        }
        modules.forEach((module, index) => {
            const videoInput = module.querySelector('.module-video');
            const titleInput = module.querySelector('.module-title');
            const descInput = module.querySelector('.module-description');
            if (videoInput && videoInput.files[0]) {
                courseVideos.push({
                    type: 'module',
                    moduleNumber: index + 1,
                    title: titleInput ? titleInput.value : `Module ${index + 1}`,
                    description: descInput ? descInput.value : '',
                    file: videoInput.files[0],
                    name: videoInput.files[0].name
                });
            }
        });
        if (courseVideos.length === 0) {
            alert('Please upload at least one module video!');
            return;
        }
    }
    
    // Create course object
    const courseId = 'course-' + Date.now();
    const userSession = JSON.parse(localStorage.getItem('userSession') || '{}');
    
    // Store file references (we'll use FileReader to create object URLs)
    Promise.all([
        coverFile && coverOption === 'custom' ? createFileURL(coverFile) : Promise.resolve(null),
        previewFile ? createFileURL(previewFile) : Promise.resolve(null),
        ...courseVideos.map(v => createFileURL(v.file))
    ]).then(([coverURL, previewURL, ...videoURLs]) => {
        const course = {
            id: courseId,
            title: title,
            description: description,
            price: parseFloat(price),
            category: category,
            subcategory: subcategory,
            structure: structure,
            coverImage: coverURL || 'default',
            previewVideo: previewURL || null,
            videos: courseVideos.map((v, i) => ({
                ...v,
                url: videoURLs[i]
            })),
            instructor: userSession.email || 'instructor@learnable.com',
            instructorName: userSession.name || 'Instructor',
            status: 'pending',
            createdAt: new Date().toISOString(),
            submittedAt: new Date().toISOString()
        };
        
        // Save course
        saveCourse(course);
        
        alert(`Course "${title}" created successfully!\n\nYour course is now pending review. It will be available for purchase after approval.`);
        closeModal('createCourse');
        
        // Reset form
        document.querySelector('#createCourseModal form').reset();
        
        // Refresh course lists if on relevant pages
        if (typeof refreshCourseLists === 'function') {
            refreshCourseLists();
        }
    });
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

// Course Review Functions
let currentReviewingCourseId = null;
let currentReviewingRole = null;

function reviewCourse(courseId, role) {
    currentReviewingCourseId = courseId;
    currentReviewingRole = role;
    
    const course = getCourseById(courseId);
    if (!course) {
        // For demo purposes, create a sample course
        const sampleCourse = {
            id: courseId,
            title: courseId === 'python-beginners' ? 'Python for Beginners' : 
                   courseId === 'digital-marketing' ? 'Digital Marketing Mastery' : 
                   'Advanced JavaScript',
            description: 'A comprehensive course covering all the fundamentals and advanced topics.',
            price: courseId === 'python-beginners' ? 39.99 : 
                   courseId === 'digital-marketing' ? 59.99 : 79.99,
            category: 'Technology & IT',
            structure: 'modules',
            coverImage: 'default',
            previewVideo: null,
            videos: [
                { type: 'module', moduleNumber: 1, title: 'Introduction', url: null, name: 'intro.mp4' },
                { type: 'module', moduleNumber: 2, title: 'Getting Started', url: null, name: 'getting-started.mp4' }
            ],
            instructor: 'instructor@learnable.com',
            instructorName: 'Instructor Name',
            status: 'pending'
        };
        displayCourseReview(sampleCourse);
    } else {
        displayCourseReview(course);
    }
    
    openModal('courseReview');
}

function displayCourseReview(course) {
    document.getElementById('reviewCourseTitle').textContent = course.title;
    document.getElementById('reviewCourseInstructor').textContent = `By ${course.instructorName || course.instructor}`;
    document.getElementById('reviewCourseDescription').textContent = course.description || 'No description provided.';
    document.getElementById('reviewCoursePrice').textContent = `$${course.price.toFixed(2)}`;
    document.getElementById('reviewCourseCategory').textContent = course.category || 'Uncategorized';
    
    // Display cover image
    const coverImg = document.getElementById('reviewCourseCover');
    if (course.coverImage && course.coverImage !== 'default') {
        coverImg.src = course.coverImage;
        coverImg.style.display = 'block';
    } else {
        coverImg.style.display = 'none';
    }
    
    // Display preview video
    const previewVideo = document.getElementById('reviewPreviewVideo');
    const previewContainer = previewVideo ? previewVideo.parentElement : null;
    if (previewContainer) {
        if (course.previewVideo) {
            // Ensure video element exists
            if (!previewVideo) {
                const video = document.createElement('video');
                video.id = 'reviewPreviewVideo';
                video.controls = true;
                video.style.width = '100%';
                video.style.maxHeight = '400px';
                video.style.background = '#000';
                video.style.borderRadius = '6px';
                video.preload = 'metadata';
                previewContainer.innerHTML = '<h4>Course Preview Video</h4>';
                previewContainer.appendChild(video);
                video.src = course.previewVideo;
            } else {
                previewVideo.src = course.previewVideo;
                previewVideo.style.display = 'block';
            }
        } else {
            if (previewVideo) {
                previewVideo.style.display = 'none';
            }
            // Remove any existing message and add new one
            const existingMsg = previewContainer.querySelector('p');
            if (!existingMsg) {
                const msg = document.createElement('p');
                msg.style.color = '#718096';
                msg.textContent = 'No preview video uploaded';
                previewContainer.appendChild(msg);
            }
        }
    }
    
    // Display course videos
    const videosContainer = document.getElementById('reviewCourseVideos');
    if (course.videos && course.videos.length > 0) {
        videosContainer.innerHTML = course.videos.map((video, index) => {
            if (video.url) {
                return `
                    <div style="margin-bottom: 1rem;">
                        <h5>${video.type === 'module' ? `Module ${video.moduleNumber}: ${video.title || 'Untitled'}` : 'Course Video'}</h5>
                        <video controls style="width: 100%; max-height: 300px; background: #000; border-radius: 6px;" preload="metadata">
                            <source src="${video.url}" type="video/mp4">
                            Your browser does not support the video tag.
                        </video>
                        <p style="font-size: 0.9rem; color: #718096; margin-top: 0.25rem;">${video.name}</p>
                    </div>
                `;
            } else {
                return `
                    <div style="margin-bottom: 1rem; padding: 1rem; background: #F7FAFC; border-radius: 6px;">
                        <h5>${video.type === 'module' ? `Module ${video.moduleNumber}: ${video.title || 'Untitled'}` : 'Course Video'}</h5>
                        <p style="color: #718096;">${video.name} (File uploaded, preview not available)</p>
                    </div>
                `;
            }
        }).join('');
    } else {
        videosContainer.innerHTML = '<p style="color: #718096;">No course videos uploaded</p>';
    }
}

function approveCourseFromReview() {
    if (!currentReviewingCourseId) return;
    
    const userSession = JSON.parse(localStorage.getItem('userSession') || '{}');
    const reviewedBy = userSession.email || (currentReviewingRole === 'admin' ? 'admin@learnable.com' : 'superadmin@learnable.com');
    
    const updatedCourse = updateCourseStatus(currentReviewingCourseId, 'approved', reviewedBy);
    if (updatedCourse) {
        alert(`Course "${updatedCourse.title || currentReviewingCourseId}" has been approved and is now available for purchase!`);
    } else {
        // For demo courses, just show success
        alert('Course has been approved and is now available for purchase!');
    }
    
    closeModal('courseReview');
    currentReviewingCourseId = null;
    currentReviewingRole = null;
    
    // Refresh course lists
    if (typeof refreshCourseLists === 'function') {
        refreshCourseLists();
    }
}

function rejectCourseFromReview() {
    if (!currentReviewingCourseId) return;
    
    const reason = prompt('Please provide a reason for rejection:');
    if (reason === null) return; // User cancelled
    
    const userSession = JSON.parse(localStorage.getItem('userSession') || '{}');
    const reviewedBy = userSession.email || (currentReviewingRole === 'admin' ? 'admin@learnable.com' : 'superadmin@learnable.com');
    
    const updatedCourse = updateCourseStatus(currentReviewingCourseId, 'rejected', reviewedBy);
    if (updatedCourse) {
        updatedCourse.rejectionReason = reason;
        const courses = getAllCourses();
        const courseIndex = courses.findIndex(c => c.id === currentReviewingCourseId);
        if (courseIndex !== -1) {
            courses[courseIndex] = updatedCourse;
            localStorage.setItem('courses', JSON.stringify(courses));
        }
        alert(`Course "${updatedCourse.title || currentReviewingCourseId}" has been rejected.`);
    } else {
        alert('Course has been rejected.');
    }
    
    closeModal('courseReview');
    currentReviewingCourseId = null;
    currentReviewingRole = null;
    
    // Refresh course lists
    if (typeof refreshCourseLists === 'function') {
        refreshCourseLists();
    }
}

function approveCourse(courseId, role) {
    currentReviewingCourseId = courseId;
    currentReviewingRole = role;
    
    const userSession = JSON.parse(localStorage.getItem('userSession') || '{}');
    const reviewedBy = userSession.email || (role === 'admin' ? 'admin@learnable.com' : 'superadmin@learnable.com');
    
    const updatedCourse = updateCourseStatus(courseId, 'approved', reviewedBy);
    if (updatedCourse) {
        alert(`Course "${updatedCourse.title || courseId}" has been approved and is now available for purchase!`);
    } else {
        alert('Course has been approved and is now available for purchase!');
    }
    
    // Refresh course lists
    if (typeof refreshCourseLists === 'function') {
        refreshCourseLists();
    }
}

function rejectCourse(courseId, role) {
    const reason = prompt('Please provide a reason for rejection:');
    if (reason === null) return; // User cancelled
    
    const userSession = JSON.parse(localStorage.getItem('userSession') || '{}');
    const reviewedBy = userSession.email || (role === 'admin' ? 'admin@learnable.com' : 'superadmin@learnable.com');
    
    const updatedCourse = updateCourseStatus(courseId, 'rejected', reviewedBy);
    if (updatedCourse) {
        updatedCourse.rejectionReason = reason;
        const courses = getAllCourses();
        const courseIndex = courses.findIndex(c => c.id === courseId);
        if (courseIndex !== -1) {
            courses[courseIndex] = updatedCourse;
            localStorage.setItem('courses', JSON.stringify(courses));
        }
        alert(`Course "${updatedCourse.title || courseId}" has been rejected.`);
    } else {
        alert('Course has been rejected.');
    }
    
    // Refresh course lists
    if (typeof refreshCourseLists === 'function') {
        refreshCourseLists();
    }
}

// Get approved courses (available for purchase)
function getApprovedCourses() {
    const courses = getAllCourses();
    return courses.filter(c => c.status === 'approved');
}

// Initialize courses and access codes on page load
document.addEventListener('DOMContentLoaded', function() {
    initializeCourses();
    initializeAccessCodes();
});

// Close modals when clicking outside
window.onclick = function(event) {
    if (event.target.classList.contains('modal')) {
        event.target.classList.remove('active');
    }
}

