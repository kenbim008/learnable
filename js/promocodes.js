// Promo Code Management Functions

// Load promo codes for a specific role
function loadPromoCodes(role) {
    const allPromoCodes = JSON.parse(localStorage.getItem('promoCodes') || '[]');
    const userSession = JSON.parse(localStorage.getItem('userSession') || '{}');
    
    // Filter promo codes based on role
    let filteredCodes = [];
    if (role === 'superadmin') {
        // Super admin sees all promo codes
        filteredCodes = allPromoCodes;
    } else if (role === 'admin') {
        // Admin sees all promo codes (can be assigned this permission)
        filteredCodes = allPromoCodes;
    } else if (role === 'instructor') {
        // Instructors see only their own promo codes
        filteredCodes = allPromoCodes.filter(p => p.createdBy === userSession.email);
    }
    
    // Sort by creation date (newest first)
    filteredCodes.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
    
    // Display in appropriate section
    const listId = role === 'superadmin' ? 'superAdminPromoCodesList' : 
                   role === 'admin' ? 'adminPromoCodesList' : 
                   'instructorPromoCodesList';
    const listElement = document.getElementById(listId);
    
    if (!listElement) return;
    
    // Check if admin has permission to create promo codes
    let canCreatePromo = true;
    if (role === 'admin') {
        const adminPermissions = JSON.parse(localStorage.getItem('adminPermissions') || '{}');
        const adminPerms = adminPermissions[userSession.email] || {};
        canCreatePromo = adminPerms.promoCodeManagement || false;
        
        // Hide/show create button based on permission
        const createButton = document.querySelector(`#adminPromoCodesSection button[onclick*="openCreatePromoCodeModal"]`);
        if (createButton) {
            createButton.style.display = canCreatePromo ? 'block' : 'none';
        }
    }
    
    if (filteredCodes.length === 0) {
        listElement.innerHTML = '<p style="color: #718096; text-align: center; padding: 2rem;">No promo codes created yet.</p>';
        return;
    }
    
    listElement.innerHTML = filteredCodes.map(promo => {
        const statusBadge = promo.active 
            ? '<span style="background: #10B981; color: white; padding: 0.25rem 0.75rem; border-radius: 4px; font-size: 0.85rem;">Active</span>'
            : '<span style="background: #718096; color: white; padding: 0.25rem 0.75rem; border-radius: 4px; font-size: 0.85rem;">Inactive</span>';
        
        const discountText = promo.discountType === 'percentage' 
            ? `${promo.discountValue}% off`
            : `$${promo.discountValue} off`;
        
        const expiryText = promo.expiryDate 
            ? new Date(promo.expiryDate) < new Date() 
                ? '<span style="color: #EF4444;">Expired</span>'
                : `Expires: ${new Date(promo.expiryDate).toLocaleDateString()}`
            : 'No expiry';
        
        const usesText = promo.maxUses 
            ? `${promo.usedCount || 0}/${promo.maxUses} uses`
            : `${promo.usedCount || 0} uses`;
        
        return `
            <div class="content-item">
                <div>
                    <h3>${promo.code} ${statusBadge}</h3>
                    <p>${discountText} • ${usesText} • ${expiryText}</p>
                    <p style="font-size: 0.85rem; color: #718096; margin-top: 0.25rem;">Created: ${new Date(promo.createdAt).toLocaleDateString()}</p>
                </div>
                <div>
                    <button class="btn btn-outline" onclick="togglePromoCodeStatus('${promo.id}')">${promo.active ? 'Deactivate' : 'Activate'}</button>
                    <button class="btn btn-outline" style="margin-left: 0.5rem;" onclick="deletePromoCode('${promo.id}')">Delete</button>
                </div>
            </div>
        `;
    }).join('');
}

// Open create promo code modal
function openCreatePromoCodeModal(role) {
    const userSession = JSON.parse(localStorage.getItem('userSession') || '{}');
    
    // Check if admin has permission to create promo codes
    if (role === 'admin') {
        const adminPermissions = JSON.parse(localStorage.getItem('adminPermissions') || '{}');
        const adminPerms = adminPermissions[userSession.email] || {};
        
        if (!adminPerms.promoCodeManagement) {
            alert('You do not have permission to create promo codes. Please contact Super Admin to grant this permission.');
            return;
        }
    }
    
    openModal('createPromoCode');
    document.getElementById('promoCodeCreatorRole').value = role;
    document.getElementById('promoCodeName').value = '';
    document.getElementById('promoDiscountType').value = 'percentage';
    document.getElementById('promoDiscountValue').value = '';
    document.getElementById('promoMaxDiscount').value = '';
    document.getElementById('promoExpiryDate').value = '';
    document.getElementById('promoMaxUses').value = '';
    document.getElementById('promoActive').checked = true;
    togglePromoDiscountFields();
}

// Toggle promo discount fields based on type
function togglePromoDiscountFields() {
    const discountType = document.getElementById('promoDiscountType')?.value;
    const label = document.getElementById('promoDiscountValueLabel');
    const maxDiscountGroup = document.getElementById('promoMaxDiscountGroup');
    
    if (label) {
        label.textContent = discountType === 'percentage' ? 'Discount Percentage (%)' : 'Discount Amount ($)';
    }
    
    if (maxDiscountGroup) {
        maxDiscountGroup.style.display = discountType === 'percentage' ? 'block' : 'none';
    }
}

// Save promo code
function savePromoCode(event) {
    event.preventDefault();
    
    const code = document.getElementById('promoCodeName').value.trim().toUpperCase();
    const discountType = document.getElementById('promoDiscountType').value;
    const discountValue = parseFloat(document.getElementById('promoDiscountValue').value);
    const maxDiscount = document.getElementById('promoMaxDiscount').value ? parseFloat(document.getElementById('promoMaxDiscount').value) : null;
    const expiryDate = document.getElementById('promoExpiryDate').value || null;
    const maxUses = document.getElementById('promoMaxUses').value ? parseInt(document.getElementById('promoMaxUses').value) : null;
    const active = document.getElementById('promoActive').checked;
    const creatorRole = document.getElementById('promoCodeCreatorRole').value;
    
    // Validation
    if (!code || code.length < 3) {
        alert('Promo code must be at least 3 characters long');
        return;
    }
    
    if (discountValue <= 0) {
        alert('Discount value must be greater than 0');
        return;
    }
    
    if (discountType === 'percentage' && discountValue > 100) {
        alert('Percentage discount cannot exceed 100%');
        return;
    }
    
    // Check if code already exists
    const existingCodes = JSON.parse(localStorage.getItem('promoCodes') || '[]');
    if (existingCodes.find(p => p.code.toUpperCase() === code)) {
        alert('This promo code already exists!');
        return;
    }
    
    const userSession = JSON.parse(localStorage.getItem('userSession') || '{}');
    
    // Create promo code object
    const promoCode = {
        id: 'promo_' + Date.now(),
        code: code,
        discountType: discountType,
        discountValue: discountValue,
        maxDiscount: maxDiscount,
        expiryDate: expiryDate,
        maxUses: maxUses,
        usedCount: 0,
        active: active,
        createdBy: userSession.email || 'system',
        createdAt: new Date().toISOString()
    };
    
    // Save to localStorage
    existingCodes.push(promoCode);
    localStorage.setItem('promoCodes', JSON.stringify(existingCodes));
    
    alert(`Promo code "${code}" created successfully!`);
    closeModal('createPromoCode');
    
    // Reload promo codes list
    loadPromoCodes(creatorRole);
}

// Toggle promo code status
function togglePromoCodeStatus(promoId) {
    const promoCodes = JSON.parse(localStorage.getItem('promoCodes') || '[]');
    const promoIndex = promoCodes.findIndex(p => p.id === promoId);
    
    if (promoIndex === -1) {
        alert('Promo code not found!');
        return;
    }
    
    promoCodes[promoIndex].active = !promoCodes[promoIndex].active;
    localStorage.setItem('promoCodes', JSON.stringify(promoCodes));
    
    // Reload lists
    const userSession = JSON.parse(localStorage.getItem('userSession') || '{}');
    const role = userSession.role || 'instructor';
    loadPromoCodes(role === 'superadmin' ? 'superadmin' : role === 'admin' ? 'admin' : 'instructor');
}

// Delete promo code
function deletePromoCode(promoId) {
    if (!confirm('Are you sure you want to delete this promo code? This action cannot be undone.')) {
        return;
    }
    
    const promoCodes = JSON.parse(localStorage.getItem('promoCodes') || '[]');
    const filteredCodes = promoCodes.filter(p => p.id !== promoId);
    localStorage.setItem('promoCodes', JSON.stringify(filteredCodes));
    
    alert('Promo code deleted successfully!');
    
    // Reload lists
    const userSession = JSON.parse(localStorage.getItem('userSession') || '{}');
    const role = userSession.role || 'instructor';
    loadPromoCodes(role === 'superadmin' ? 'superadmin' : role === 'admin' ? 'admin' : 'instructor');
}

// Update admin permissions to include promo code management
function editAdminPermissions(adminEmail) {
    const userSession = JSON.parse(localStorage.getItem('userSession') || '{}');
    if (userSession.role !== 'superadmin') {
        alert('Only Super Admin can edit admin permissions!');
        return;
    }
    
    // Get admin permissions (stored in localStorage)
    const adminPermissions = JSON.parse(localStorage.getItem('adminPermissions') || '{}');
    const currentPerms = adminPermissions[adminEmail] || {
        userManagement: false,
        courseReview: false,
        communityModeration: false,
        promoCodeManagement: false,
        analyticsAccess: false,
        systemLogs: false
    };
    
    // Create modal for editing permissions
    const modal = document.createElement('div');
    modal.className = 'modal active';
    modal.style.zIndex = '10000';
    modal.innerHTML = `
        <div class="modal-content" style="max-width: 500px;">
            <button class="modal-close" onclick="this.closest('.modal').remove()">×</button>
            <h2>Edit Admin Permissions</h2>
            <p style="color: #718096; margin-bottom: 1.5rem;">Admin: ${adminEmail}</p>
            <form onsubmit="saveAdminPermissions(event, '${adminEmail}')">
                <div style="display: grid; gap: 1rem;">
                    <label style="display: flex; align-items: center;">
                        <input type="checkbox" id="permUserManagement" ${currentPerms.userManagement ? 'checked' : ''} style="margin-right: 0.5rem;"> User Management
                    </label>
                    <label style="display: flex; align-items: center;">
                        <input type="checkbox" id="permCourseReview" ${currentPerms.courseReview ? 'checked' : ''} style="margin-right: 0.5rem;"> Course Review
                    </label>
                    <label style="display: flex; align-items: center;">
                        <input type="checkbox" id="permCommunityModeration" ${currentPerms.communityModeration ? 'checked' : ''} style="margin-right: 0.5rem;"> Community Moderation
                    </label>
                    <label style="display: flex; align-items: center;">
                        <input type="checkbox" id="permPromoCodeManagement" ${currentPerms.promoCodeManagement ? 'checked' : ''} style="margin-right: 0.5rem;"> Promo Code Management
                    </label>
                    <label style="display: flex; align-items: center;">
                        <input type="checkbox" id="permAnalyticsAccess" ${currentPerms.analyticsAccess ? 'checked' : ''} style="margin-right: 0.5rem;"> Analytics Access
                    </label>
                    <label style="display: flex; align-items: center;">
                        <input type="checkbox" id="permSystemLogs" ${currentPerms.systemLogs ? 'checked' : ''} style="margin-right: 0.5rem;"> System Logs
                    </label>
                </div>
                <button type="submit" class="btn btn-success" style="width: 100%; margin-top: 1.5rem;">Save Permissions</button>
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

// Save admin permissions
function saveAdminPermissions(event, adminEmail) {
    event.preventDefault();
    
    const permissions = {
        userManagement: document.getElementById('permUserManagement').checked,
        courseReview: document.getElementById('permCourseReview').checked,
        communityModeration: document.getElementById('permCommunityModeration').checked,
        promoCodeManagement: document.getElementById('permPromoCodeManagement').checked,
        analyticsAccess: document.getElementById('permAnalyticsAccess').checked,
        systemLogs: document.getElementById('permSystemLogs').checked
    };
    
    const adminPermissions = JSON.parse(localStorage.getItem('adminPermissions') || '{}');
    adminPermissions[adminEmail] = permissions;
    localStorage.setItem('adminPermissions', JSON.stringify(adminPermissions));
    
    alert('Admin permissions updated successfully!');
    
    // Close modal
    const modal = document.querySelector('.modal.active');
    if (modal) modal.remove();
    
    // Refresh admin management section
    if (typeof showSuperAdminSection === 'function') {
        showSuperAdminSection('adminManagement', null);
    }
}

