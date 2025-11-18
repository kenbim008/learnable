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

    if ((role === 'admin' || role === 'superadmin') && adminCode !== 'ADMIN2024') {
        alert('Invalid admin access code!');
        return;
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
    
    if (code !== 'ADMIN2024') {
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

// Close modals when clicking outside
window.onclick = function(event) {
    if (event.target.classList.contains('modal')) {
        event.target.classList.remove('active');
    }
}

