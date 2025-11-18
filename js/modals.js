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

// Handle create course
function handleCreateCourse(e) {
    e.preventDefault();
    alert('Course created successfully! Your content is protected with DRM - students can stream but not download.');
    closeModal('createCourse');
}

// Close modals when clicking outside
window.onclick = function(event) {
    if (event.target.classList.contains('modal')) {
        event.target.classList.remove('active');
    }
}

