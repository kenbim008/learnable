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
        const fileSizeMB = file.size / (1024 * 1024);
        const sizeDisplay = fileSizeMB >= 1 
            ? `${(fileSizeMB / 1024).toFixed(2)} GB` 
            : `${fileSizeMB.toFixed(2)} MB`;
        document.getElementById('coverFileStatus').textContent = `✅ ${file.name} (${sizeDisplay})`;
        
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
        const fileSizeMB = file.size / (1024 * 1024);
        const fileSizeGB = fileSizeMB / 1024;
        const sizeDisplay = fileSizeGB >= 1 
            ? `${fileSizeGB.toFixed(2)} GB` 
            : `${fileSizeMB.toFixed(2)} MB`;
        document.getElementById('previewFileStatus').textContent = `✅ ${file.name} (${sizeDisplay})`;
        let message = `File selected: ${file.name} | Size: ${sizeDisplay}`;
        if (fileSizeGB > 2) {
            message += ` - Large preview file`;
        }
        document.getElementById('previewFileInfo').textContent = message;
        document.getElementById('previewFileInfo').style.display = 'block';
    }
}

// Handle course video file selection
function handleCourseVideoSelect(input) {
    if (input.files && input.files[0]) {
        const file = input.files[0];
        const fileSizeMB = file.size / (1024 * 1024);
        const fileSizeGB = fileSizeMB / 1024;
        
        // Display size in GB if >= 1GB, otherwise MB
        const sizeDisplay = fileSizeGB >= 1 
            ? `${fileSizeGB.toFixed(2)} GB` 
            : `${fileSizeMB.toFixed(2)} MB`;
        
        const statusEl = document.getElementById('courseVideoFileStatus');
        if (statusEl) {
            statusEl.textContent = `✅ ${file.name} (${sizeDisplay})`;
        }
        const infoEl = document.getElementById('singleVideoStatus');
        if (infoEl) {
            let message = `File selected: ${file.name} | Size: ${sizeDisplay}`;
            // Add helpful note for large files
            if (fileSizeGB > 5) {
                message += `\n⚠️ Large file detected. Upload may take longer. Please be patient.`;
            }
            infoEl.textContent = message;
            infoEl.style.display = 'block';
            infoEl.style.color = fileSizeGB > 5 ? '#FFB800' : '#10B981';
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
    
    // Get user name from users data if available
    let userName = email.split('@')[0];
    const allUsers = JSON.parse(localStorage.getItem('users') || '[]');
    const existingUser = allUsers.find(u => u.email === email);
    if (existingUser && existingUser.name) {
        userName = existingUser.name;
    }
    
    // Save session data
    const sessionData = {
        role: role,
        email: email,
        name: userName,
        timestamp: Date.now(),
        expiresAt: Date.now() + (15 * 60 * 1000) // 15 minutes
    };
    localStorage.setItem('userSession', JSON.stringify(sessionData));
    
    // Update user display
    if (typeof updateUserNameDisplay === 'function') {
        updateUserNameDisplay();
    }
    
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
    const email = document.getElementById('signupEmail').value;
    
    // Save user data
    let users = JSON.parse(localStorage.getItem('users') || '[]');
    users.push({
        name: name,
        email: email,
        role: role,
        createdAt: new Date().toISOString()
    });
    localStorage.setItem('users', JSON.stringify(users));
    
    // Create session
    const sessionData = {
        role: role,
        email: email,
        name: name,
        timestamp: Date.now(),
        expiresAt: Date.now() + (15 * 60 * 1000) // 15 minutes
    };
    localStorage.setItem('userSession', JSON.stringify(sessionData));
    
    alert(`Account created successfully for ${name} as ${role}!`);
    closeModal('signup');
    
    // Update user display
    if (typeof updateUserNameDisplay === 'function') {
        updateUserNameDisplay();
    }
    
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
                <small style="color: #718096;">Upload video for this module (Max: 5GB per module recommended, larger files supported)</small>
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
        const fileSizeMB = file.size / (1024 * 1024);
        const fileSizeGB = fileSizeMB / 1024;
        
        // Display size in GB if >= 1GB, otherwise MB
        const sizeDisplay = fileSizeGB >= 1 
            ? `${fileSizeGB.toFixed(2)} GB` 
            : `${fileSizeMB.toFixed(2)} MB`;
        
        let message = `✓ Selected: ${file.name} (${sizeDisplay})`;
        if (fileSizeGB > 3) {
            message += ` - Large file, upload may take time`;
            statusDiv.style.color = '#FFB800';
        } else {
            statusDiv.style.color = '#10B981';
        }
        statusDiv.textContent = message;
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
                const fileSizeMB = file.size / (1024 * 1024);
                const fileSizeGB = fileSizeMB / 1024;
                
                // Display size in GB if >= 1GB, otherwise MB
                const sizeDisplay = fileSizeGB >= 1 
                    ? `${fileSizeGB.toFixed(2)} GB` 
                    : `${fileSizeMB.toFixed(2)} MB`;
                
                let message = `✓ Selected: ${file.name} (${sizeDisplay})`;
                if (fileSizeGB > 5) {
                    message += ` - Large file, upload may take time`;
                    statusDiv.style.color = '#FFB800';
                } else {
                    statusDiv.style.color = '#10B981';
                }
                statusDiv.textContent = message;
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
    try {
        const courses = localStorage.getItem('courses');
        if (courses) {
            const parsed = JSON.parse(courses);
            return Array.isArray(parsed) ? parsed : [];
        }
        return [];
    } catch (error) {
        console.error('Error getting courses:', error);
        return [];
    }
}

// Update existing course
function updateCourse(course) {
    try {
        if (!course || !course.id) {
            console.error('Invalid course data:', course);
            throw new Error('Invalid course data');
        }
        
        // Remove video file objects if they exist (they shouldn't be stored)
        if (course.videos) {
            course.videos = course.videos.map(v => {
                const { file, ...videoMetadata } = v;
                return videoMetadata;
            });
        }
        
        // Estimate size before saving
        const courseString = JSON.stringify(course);
        const estimatedSizeMB = (new Blob([courseString]).size / (1024 * 1024)).toFixed(2);
        
        // Warn if course data is very large
        if (parseFloat(estimatedSizeMB) > 4) {
            console.warn(`Course data size: ${estimatedSizeMB}MB - close to localStorage quota`);
        }
        
        const courses = getAllCourses();
        const courseIndex = courses.findIndex(c => c.id === course.id);
        
        if (courseIndex === -1) {
            // Course not found, save as new
            courses.push(course);
        } else {
            // Update existing course
            courses[courseIndex] = course;
        }
        
        // Try to save
        try {
            localStorage.setItem('courses', JSON.stringify(courses));
        } catch (quotaError) {
            // If quota exceeded, try to clear old draft courses
            if (quotaError.name === 'QuotaExceededError') {
                console.warn('localStorage quota exceeded. Attempting to clear old draft courses...');
                const cleanedCourses = courses.filter(c => c.status !== 'draft' || (new Date() - new Date(c.createdAt)) < 7 * 24 * 60 * 60 * 1000); // Keep drafts less than 7 days old
                
                if (cleanedCourses.length < courses.length) {
                    try {
                        localStorage.setItem('courses', JSON.stringify(cleanedCourses));
                        alert('Storage quota was exceeded. Old draft courses have been cleared. Please try saving again.');
                        throw new Error('Quota exceeded - old drafts cleared. Please retry.');
                    } catch (retryError) {
                        throw new Error('Storage quota exceeded. Please clear old courses or contact support.');
                    }
                } else {
                    throw new Error('Storage quota exceeded. Please clear old courses or contact support.');
                }
            }
            throw quotaError;
        }
        
        return course;
    } catch (error) {
        console.error('Error updating course:', error);
        throw error;
    }
}

// Save course
function saveCourse(course) {
    try {
        if (!course || !course.id) {
            console.error('Invalid course data:', course);
            throw new Error('Invalid course data');
        }
        
        // Remove video file objects if they exist (they shouldn't be stored)
        if (course.videos) {
            course.videos = course.videos.map(v => {
                const { file, ...videoMetadata } = v;
                return videoMetadata;
            });
        }
        
        // Estimate size before saving
        const courseString = JSON.stringify(course);
        const estimatedSizeMB = (new Blob([courseString]).size / (1024 * 1024)).toFixed(2);
        
        // Warn if course data is very large
        if (parseFloat(estimatedSizeMB) > 4) {
            console.warn(`Course data size: ${estimatedSizeMB}MB - close to localStorage quota`);
        }
        
        const courses = getAllCourses();
        courses.push(course);
        
        // Try to save
        try {
            localStorage.setItem('courses', JSON.stringify(courses));
        } catch (quotaError) {
            // If quota exceeded, try to clear old draft courses
            if (quotaError.name === 'QuotaExceededError') {
                console.warn('localStorage quota exceeded. Attempting to clear old draft courses...');
                const cleanedCourses = courses.filter(c => c.status !== 'draft' || (new Date() - new Date(c.createdAt)) < 7 * 24 * 60 * 60 * 1000); // Keep drafts less than 7 days old
                
                if (cleanedCourses.length < courses.length) {
                    try {
                        localStorage.setItem('courses', JSON.stringify(cleanedCourses));
                        alert('Storage quota was exceeded. Old draft courses have been cleared. Please try saving again.');
                        throw new Error('Quota exceeded - old drafts cleared. Please retry.');
                    } catch (retryError) {
                        throw new Error('Storage quota exceeded. Please clear old courses or contact support.');
                    }
                } else {
                    throw new Error('Storage quota exceeded. Please clear old courses or contact support.');
                }
            }
            throw quotaError;
        }
        
        return course;
    } catch (error) {
        console.error('Error saving course:', error);
        throw error;
    }
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
    return new Promise((resolve, reject) => {
        if (!file) {
            resolve(null);
            return;
        }
        try {
            const reader = new FileReader();
            reader.onload = (e) => resolve(e.target.result);
            reader.onerror = (error) => {
                console.error('Error reading file:', error);
                reject(error);
            };
            reader.readAsDataURL(file);
        } catch (error) {
            console.error('Error creating file URL:', error);
            reject(error);
        }
    });
}

function handleCreateCourse(e) {
    e.preventDefault();
    
    // Check if this is an update (edit) or a new course
    const form = e.target;
    const editCourseId = form.getAttribute('data-edit-course-id');
    const isEdit = !!editCourseId;
    
    // Get form data
    const title = document.getElementById('courseTitle')?.value || document.querySelector('#createCourseModal input[type="text"]')?.value;
    const description = document.getElementById('courseDescription')?.value || document.querySelector('#createCourseModal textarea')?.value;
    const price = document.getElementById('coursePrice')?.value || document.querySelector('#createCourseModal input[type="number"]')?.value;
    const category = document.getElementById('courseCategory')?.value;
    const subcategory = document.getElementById('courseSubcategory')?.value;
    const structure = document.getElementById('courseStructure')?.value;
    
    // Validate required fields
    if (!title || !description || !price || !category || !subcategory || !structure) {
        alert('Please fill in all required fields!');
        return;
    }
    
    // If editing, get the existing course to preserve some fields
    let existingCourse = null;
    if (isEdit) {
        existingCourse = typeof getCourseById === 'function' ? getCourseById(editCourseId) : null;
        if (!existingCourse) {
            alert('Course not found! Cannot update.');
            return;
        }
        
        // Check if course belongs to current instructor
        const userSession = JSON.parse(localStorage.getItem('userSession') || '{}');
        if (existingCourse.instructor !== userSession.email) {
            alert('You can only edit your own courses!');
            return;
        }
    }
    
    // Get cover image
    const coverFileInput = document.getElementById('coverFile');
    const coverFile = coverFileInput ? coverFileInput.files[0] : null;
    const coverOptionInput = document.getElementById('coverOption');
    const coverOption = coverOptionInput ? coverOptionInput.value : 'default';
    
    // Get preview video
    const previewFileInput = document.getElementById('previewFile');
    const previewFile = previewFileInput ? previewFileInput.files[0] : null;
    
        // Get course videos
    let courseVideos = [];
    // When editing, videos are optional (can keep existing ones)
    const videoRequired = !isEdit;
    
    if (structure === 'single') {
        const videoFileInput = document.getElementById('courseVideoFile');
        const videoFile = videoFileInput ? videoFileInput.files[0] : null;
        if (!videoFile && videoRequired) {
            alert('Please upload a course video!');
            return;
        }
        if (videoFile) {
            courseVideos.push({
                type: 'single',
                file: videoFile,
                name: videoFile.name
            });
        }
    } else {
        const modules = document.querySelectorAll('.module-item');
        if (modules.length === 0 && videoRequired) {
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
        if (courseVideos.length === 0 && videoRequired) {
            alert('Please upload at least one module video!');
            return;
        }
    }
    
    // Create course object
    const courseId = isEdit ? editCourseId : 'course-' + Date.now();
    const userSession = JSON.parse(localStorage.getItem('userSession') || '{}');
    
    // Store file references - only convert images to data URLs, not videos (to avoid localStorage quota issues)
    // For videos, we'll store metadata only (name, size, type, date) instead of the actual file data
    let coverURLPromise = Promise.resolve(null);
    
    // Determine cover image URL - use existing if editing and no new file uploaded
    if (isEdit && existingCourse && !coverFile && existingCourse.coverImage) {
        coverURLPromise = Promise.resolve(existingCourse.coverImage);
    } else if (coverFile && coverOption === 'custom') {
        // Only convert cover image to data URL (images are small enough for localStorage)
        if (coverFile.size < 5 * 1024 * 1024) { // 5MB limit for images
            coverURLPromise = createFileURL(coverFile);
        } else {
            alert('Cover image is too large (max 5MB). Please use a smaller image.');
            return;
        }
    } else {
        // Use default or existing cover
        coverURLPromise = Promise.resolve(isEdit && existingCourse ? (existingCourse.coverImage || 'default') : 'default');
    }
    
    coverURLPromise.then((coverURL) => {
        // Determine preview video - use existing if editing and no new file uploaded
        let previewVideoData = null;
        if (previewFile) {
            // New preview video uploaded
            previewVideoData = {
                name: previewFile.name,
                size: previewFile.size,
                type: previewFile.type,
                uploadedAt: new Date().toISOString()
            };
        } else if (isEdit && existingCourse && existingCourse.previewVideo) {
            // Keep existing preview video
            previewVideoData = existingCourse.previewVideo;
        }
        
        // Determine videos - merge new videos with existing if editing
        let videosData = courseVideos.map(v => ({
            type: v.type,
            moduleNumber: v.moduleNumber,
            title: v.title,
            description: v.description,
            name: v.name,
            size: v.file ? v.file.size : null,
            type: v.file ? v.file.type : null,
            uploadedAt: new Date().toISOString(),
            // Note: Actual video file would be uploaded to server in production
            url: null
        }));
        
        // If editing and no new videos uploaded, keep existing videos
        if (isEdit && existingCourse && courseVideos.length === 0 && existingCourse.videos && existingCourse.videos.length > 0) {
            videosData = existingCourse.videos;
        }
        
        // Create course object with video metadata (not actual video data)
        const course = {
            id: courseId,
            title: title,
            description: description,
            price: parseFloat(price),
            category: category,
            subcategory: subcategory,
            structure: structure,
            coverImage: coverURL || 'default',
            previewVideo: previewVideoData,
            videos: videosData,
            instructor: userSession.email || (existingCourse ? existingCourse.instructor : 'instructor@learnable.com'),
            instructorName: userSession.name || (existingCourse ? existingCourse.instructorName : 'Instructor'),
            // Preserve status if editing published courses, otherwise set to pending
            status: isEdit && existingCourse && existingCourse.status === 'approved' ? 'approved' : 
                    isEdit && existingCourse && existingCourse.status === 'pending' ? 'pending' :
                    isEdit && existingCourse && existingCourse.status === 'rejected' ? 'draft' : // If rejected, make it draft after edit
                    'pending',
            // Preserve creation date if editing
            createdAt: isEdit && existingCourse ? existingCourse.createdAt : new Date().toISOString(),
            // Preserve submitted date if editing, otherwise set to now
            submittedAt: isEdit && existingCourse ? existingCourse.submittedAt : new Date().toISOString(),
            // Add updated timestamp
            updatedAt: new Date().toISOString()
        };
        
        // Save course
        try {
            // Update or save course
            if (isEdit) {
                updateCourse(course);
            } else {
                saveCourse(course);
            }
            
            if (isEdit) {
                alert(`Course "${title}" updated successfully!\n\nYour changes have been saved.${existingCourse && existingCourse.status === 'approved' ? ' The course remains published with your updates.' : ''}`);
            } else {
                alert(`Course "${title}" created successfully!\n\nYour course is now pending review. It will be available for purchase after approval.\n\nNote: Video files are stored as references. In production, these would be uploaded to cloud storage.`);
            }
    closeModal('createCourse');
            
            // Reset form and remove edit attribute
            const form = document.querySelector('#createCourseModal form');
            if (form) {
                form.removeAttribute('data-edit-course-id');
            }
            if (form) {
                form.reset();
            }
            
            // Refresh course lists if on relevant pages
            if (typeof loadInstructorCourses === 'function') {
                loadInstructorCourses();
            }
            if (typeof refreshCourseLists === 'function') {
                refreshCourseLists();
            }
        } catch (saveError) {
            console.error('Error saving course:', saveError);
            // Check if it's a quota error
            if (saveError.message && saveError.message.includes('quota')) {
                alert('Storage quota exceeded. Please clear old courses or contact support.\n\nError: ' + saveError.message);
            } else {
                alert('Error saving course: ' + (saveError.message || 'Unknown error') + '\n\nPlease try again.');
            }
        }
    }).catch(error => {
        console.error('Error processing course:', error);
        alert('An error occurred while processing the course: ' + (error.message || 'Unknown error') + '\n\nPlease try again or save as draft first.');
    });
}

// Save Course as Draft
function saveCourseAsDraft() {
    // Get form data (don't require all fields for draft)
    const title = document.getElementById('courseTitle')?.value || document.querySelector('#createCourseModal input[type="text"]')?.value || 'Untitled Course';
    const description = document.getElementById('courseDescription')?.value || document.querySelector('#createCourseModal textarea')?.value || '';
    const price = document.getElementById('coursePrice')?.value || document.querySelector('#createCourseModal input[type="number"]')?.value || '0';
    const category = document.getElementById('courseCategory')?.value || '';
    const subcategory = document.getElementById('courseSubcategory')?.value || '';
    const structure = document.getElementById('courseStructure')?.value || 'single';
    
    // Get cover image
    const coverFile = document.getElementById('coverFile')?.files[0];
    const coverOption = document.getElementById('coverOption')?.value || 'default';
    
    // Get preview video
    const previewFile = document.getElementById('previewFile')?.files[0];
    
    // Get course videos (optional for draft)
    let courseVideos = [];
    if (structure === 'single') {
        const videoFile = document.getElementById('courseVideoFile')?.files[0];
        if (videoFile) {
            courseVideos.push({
                type: 'single',
                file: videoFile,
                name: videoFile.name
            });
        }
    } else {
        const modules = document.querySelectorAll('.module-item');
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
    }
    
    // Create course object for draft
    const courseId = 'draft-course-' + Date.now();
    const userSession = JSON.parse(localStorage.getItem('userSession') || '{}');
    
    // Store file references - only convert images to data URLs, not videos (to avoid localStorage quota issues)
    // For videos, we'll store metadata only (name, size, type, date) instead of the actual file data
    let coverURLPromise = Promise.resolve(null);
    
    // Only convert cover image to data URL (images are small enough for localStorage)
    if (coverFile && coverOption === 'custom') {
        // Check if it's an image (not too large)
        if (coverFile.size < 5 * 1024 * 1024) { // 5MB limit for images
            coverURLPromise = createFileURL(coverFile);
        } else {
            alert('Cover image is too large (max 5MB). Please use a smaller image.');
            return;
        }
    }
    
    coverURLPromise.then((coverURL) => {
        // Create course object with video metadata (not actual video data)
        const course = {
            id: courseId,
            title: title,
            description: description,
            price: parseFloat(price) || 0,
            category: category,
            subcategory: subcategory,
            structure: structure,
            coverImage: coverURL || 'default',
            // Store video metadata only, not the actual video files
            previewVideo: previewFile ? {
                name: previewFile.name,
                size: previewFile.size,
                type: previewFile.type,
                uploadedAt: new Date().toISOString()
            } : null,
            videos: courseVideos.map(v => ({
                type: v.type,
                moduleNumber: v.moduleNumber,
                title: v.title,
                description: v.description,
                name: v.name,
                size: v.file ? v.file.size : null,
                type: v.file ? v.file.type : null,
                uploadedAt: new Date().toISOString(),
                // Note: Actual video file would be uploaded to server in production
                url: null
            })),
            instructor: userSession.email || 'instructor@learnable.com',
            instructorName: userSession.name || 'Instructor',
            status: 'draft',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };
        
        // Save draft course
        try {
            // Update or save course
            if (isEdit) {
                updateCourse(course);
            } else {
                saveCourse(course);
            }
            
            alert(`Course draft "${title}" saved successfully!\n\nYou can continue editing and submit for review later.\n\nNote: Video files are stored as references. In production, these would be uploaded to cloud storage.`);
            
            // Note: We don't close the modal or reset the form for drafts
            // The user can continue editing and submit later
        } catch (saveError) {
            console.error('Error saving draft:', saveError);
            // Check if it's a quota error
            if (saveError.message && saveError.message.includes('quota')) {
                alert('Storage quota exceeded. Please clear old courses or contact support.\n\nError: ' + saveError.message);
            } else {
                alert('Error saving draft: ' + (saveError.message || 'Unknown error') + '\n\nPlease check that all file inputs are valid and try again.');
            }
        }
    }).catch(error => {
        console.error('Error processing draft:', error);
        alert('An error occurred while processing the draft: ' + (error.message || 'Unknown error') + '\n\nPlease check that all file inputs are valid and try again.');
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
    
    // Reload pending courses if in admin/super admin portal
    if (role === 'admin' && typeof loadAdminPendingCourses === 'function') {
        loadAdminPendingCourses();
    }
    if ((role === 'admin' || role === 'superadmin') && typeof loadSuperAdminAllCourses === 'function') {
        loadSuperAdminAllCourses();
    }
    
    // Reload marketplace courses
    if (typeof loadCourses === 'function') {
        loadCourses();
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
    
    // Reload pending courses if in admin/super admin portal
    if (role === 'admin' && typeof loadAdminPendingCourses === 'function') {
        loadAdminPendingCourses();
    }
    if ((role === 'admin' || role === 'superadmin') && typeof loadSuperAdminAllCourses === 'function') {
        loadSuperAdminAllCourses();
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

// ==================== Stripe Integration Functions ====================

// Load Stripe settings
function loadStripeSettings() {
    const stripeData = JSON.parse(localStorage.getItem('stripeSettings') || '{}');
    
    const publishableKey = stripeData.publishableKey || '';
    const secretKey = stripeData.secretKey || '';
    const accountId = stripeData.accountId || '';
    const webhookSecret = stripeData.webhookSecret || '';
    const webhookUrl = stripeData.webhookUrl || 'https://learnable.com/api/stripe/webhook';
    const isConnected = !!(publishableKey && secretKey);
    
    // Update connection status
    const connectedStatus = document.getElementById('stripeConnectionStatus');
    const disconnectedStatus = document.getElementById('stripeDisconnectedStatus');
    const accountInfo = document.getElementById('stripeAccountInfo');
    const accountIdSpan = document.getElementById('stripeAccountId');
    const connectBtn = document.getElementById('connectStripeBtn');
    
    if (isConnected) {
        if (connectedStatus) connectedStatus.style.display = 'block';
        if (disconnectedStatus) disconnectedStatus.style.display = 'none';
        if (accountInfo) accountInfo.style.display = 'block';
        if (accountIdSpan) accountIdSpan.textContent = accountId || 'Connected';
        if (connectBtn) connectBtn.style.display = 'none';
    } else {
        if (connectedStatus) connectedStatus.style.display = 'none';
        if (disconnectedStatus) disconnectedStatus.style.display = 'block';
        if (accountInfo) accountInfo.style.display = 'none';
        if (connectBtn) connectBtn.style.display = 'inline-block';
    }
    
    // Update API keys display
    const publishableKeyInput = document.getElementById('stripePublishableKey');
    const secretKeyInput = document.getElementById('stripeSecretKey');
    const webhookSecretInput = document.getElementById('stripeWebhookSecret');
    const webhookUrlInput = document.querySelector('input[placeholder*="webhook"]');
    
    if (publishableKeyInput) {
        publishableKeyInput.value = publishableKey || '';
        publishableKeyInput.placeholder = 'pk_live_...';
    }
    if (secretKeyInput) {
        secretKeyInput.value = secretKey || '';
        secretKeyInput.type = 'password';
        secretKeyInput.placeholder = 'sk_live_...';
    }
    if (webhookSecretInput) {
        webhookSecretInput.value = webhookSecret || '';
        webhookSecretInput.type = 'password';
        webhookSecretInput.placeholder = 'whsec_...';
    }
    if (webhookUrlInput && webhookUrl) {
        webhookUrlInput.value = webhookUrl;
    }
}

// Open Stripe connect modal
function openStripeConnectModal() {
    openModal('stripeConnect');
    
    // Pre-fill with existing data if available
    const stripeData = JSON.parse(localStorage.getItem('stripeSettings') || '{}');
    const publishableInput = document.getElementById('connectPublishableKey');
    const secretInput = document.getElementById('connectSecretKey');
    const accountInput = document.getElementById('connectAccountId');
    
    if (publishableInput && stripeData.publishableKey) {
        publishableInput.value = stripeData.publishableKey;
    }
    if (secretInput && stripeData.secretKey) {
        secretInput.value = stripeData.secretKey;
    }
    if (accountInput && stripeData.accountId) {
        accountInput.value = stripeData.accountId;
    }
}

// Handle Stripe connection
function handleStripeConnect(event) {
    event.preventDefault();
    
    const publishableKey = document.getElementById('connectPublishableKey')?.value.trim();
    const secretKey = document.getElementById('connectSecretKey')?.value.trim();
    const accountId = document.getElementById('connectAccountId')?.value.trim();
    
    if (!publishableKey || !secretKey) {
        alert('Please enter both Publishable Key and Secret Key!');
        return;
    }
    
    // Validate key formats
    if (!publishableKey.startsWith('pk_')) {
        alert('Invalid Publishable Key format. Should start with "pk_"');
        return;
    }
    
    if (!secretKey.startsWith('sk_')) {
        alert('Invalid Secret Key format. Should start with "sk_"');
        return;
    }
    
    // Save Stripe settings
    const stripeData = {
        publishableKey: publishableKey,
        secretKey: secretKey,
        accountId: accountId || '',
        connectedAt: new Date().toISOString(),
        webhookUrl: document.querySelector('input[placeholder*="webhook"]')?.value || 'https://learnable.com/api/stripe/webhook',
        webhookSecret: document.getElementById('stripeWebhookSecret')?.value || ''
    };
    
    localStorage.setItem('stripeSettings', JSON.stringify(stripeData));
    
    alert('Stripe account connected successfully!');
    closeModal('stripeConnect');
    
    // Reload settings display
    loadStripeSettings();
}

// Disconnect Stripe
function disconnectStripe() {
    if (!confirm('Are you sure you want to disconnect your Stripe account? Payment processing will not work until you reconnect.')) {
        return;
    }
    
    localStorage.removeItem('stripeSettings');
    alert('Stripe account disconnected successfully.');
    loadStripeSettings();
}

// Copy Stripe key
function copyStripeKey(keyType) {
    let keyValue = '';
    
    if (keyType === 'publishable') {
        keyValue = document.getElementById('stripePublishableKey')?.value || '';
    } else if (keyType === 'secret') {
        keyValue = document.getElementById('stripeSecretKey')?.value || '';
    } else if (keyType === 'webhook') {
        keyValue = document.getElementById('stripeWebhookSecret')?.value || '';
    }
    
    if (!keyValue) {
        alert('No key to copy!');
        return;
    }
    
    navigator.clipboard.writeText(keyValue).then(() => {
        alert(`${keyType.charAt(0).toUpperCase() + keyType.slice(1)} key copied to clipboard!`);
    }).catch(() => {
        const textArea = document.createElement('textarea');
        textArea.value = keyValue;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
        alert(`${keyType.charAt(0).toUpperCase() + keyType.slice(1)} key copied to clipboard!`);
    });
}

// Toggle Stripe secret key visibility
function toggleStripeSecretKey(event) {
    const secretKeyInput = document.getElementById('stripeSecretKey');
    if (!secretKeyInput) return;
    
    const button = event?.target || document.querySelector('[onclick="toggleStripeSecretKey()"]');
    
    if (secretKeyInput.type === 'password') {
        secretKeyInput.type = 'text';
        if (button) button.textContent = 'Hide';
    } else {
        secretKeyInput.type = 'password';
        if (button) button.textContent = 'Show';
    }
}

// Toggle Stripe webhook secret visibility
function toggleStripeWebhookSecret(event) {
    const webhookSecretInput = document.getElementById('stripeWebhookSecret');
    if (!webhookSecretInput) return;
    
    const button = event?.target || document.querySelector('[onclick="toggleStripeWebhookSecret()"]');
    
    if (webhookSecretInput.type === 'password') {
        webhookSecretInput.type = 'text';
        if (button) button.textContent = 'Hide';
    } else {
        webhookSecretInput.type = 'password';
        if (button) button.textContent = 'Show';
    }
}

// Regenerate Stripe keys
function regenerateStripeKeys() {
    if (!confirm('Are you sure you want to regenerate your Stripe keys? This action will invalidate your current keys and you will need to generate new ones from your Stripe dashboard.')) {
        return;
    }
    
    alert('To regenerate Stripe keys:\n\n1. Go to your Stripe Dashboard\n2. Navigate to Developers > API keys\n3. Create new keys\n4. Update them in this section using the "Reconnect" button\n\nNote: This demo does not communicate with Stripe\'s API directly.');
}

