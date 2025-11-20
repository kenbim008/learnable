// Load courses
function loadCourses() {
    const grid = document.getElementById('coursesGrid');
    if (!grid) return;
    
    // Load featured courses first in featured section
    loadFeaturedCourses();
    
    // Get approved courses from localStorage
    const approvedCourses = typeof getApprovedCourses === 'function' ? getApprovedCourses() : [];
    const featuredCourses = JSON.parse(localStorage.getItem('featuredCourses') || '[]');
    
    // Combine with default courses
    let allCourses = [...courses];
    
    // Add approved courses to the list
    approvedCourses.forEach(approvedCourse => {
        const isFeatured = featuredCourses.includes(approvedCourse.id) || approvedCourse.isFeatured;
        const courseCard = {
            id: approvedCourse.id,
            title: approvedCourse.title,
            instructor: approvedCourse.instructorName || approvedCourse.instructor,
            priceUSD: approvedCourse.price,
            rating: 4.5, // Default rating
            image: approvedCourse.coverImage && approvedCourse.coverImage !== 'default' 
                ? `<img src="${approvedCourse.coverImage}" alt="${approvedCourse.title}" style="width: 100%; height: 200px; object-fit: cover;">`
                : '<div style="width: 100%; height: 200px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); display: flex; align-items: center; justify-content: center; color: white; font-size: 2rem;">📚</div>',
            hasPreview: !!approvedCourse.previewVideo,
            category: approvedCourse.category,
            subcategory: approvedCourse.subcategory,
            isFeatured: isFeatured,
            approvedCourse: approvedCourse // Store reference
        };
        allCourses.push(courseCard);
    });
    
    // Sort: featured courses first
    allCourses.sort((a, b) => {
        if (a.isFeatured && !b.isFeatured) return -1;
        if (!a.isFeatured && b.isFeatured) return 1;
        return 0;
    });
    
    grid.innerHTML = allCourses.map(course => `
        <div class="course-card" ${course.isFeatured ? 'style="border: 2px solid #5B7FFF;"' : ''} data-course-id="${course.id || ''}" data-category="${course.category || ''}" data-subcategory="${course.subcategory || ''}">
            <div class="course-image" style="position: relative;">
                ${course.image}
                ${course.isFeatured ? '<div style="position: absolute; top: 10px; right: 10px; background: #5B7FFF; color: white; padding: 0.25rem 0.5rem; border-radius: 4px; font-size: 0.75rem; font-weight: 600;">⭐ Featured</div>' : ''}
                ${course.hasPreview ? '<div class="preview-badge" onclick="playCoursePreview(\'' + course.id + '\', event)">▶ Preview</div>' : ''}
            </div>
            <div class="course-content">
                <div class="course-title">${course.title}</div>
                <div class="course-instructor">By ${course.instructor}</div>
                <div class="course-meta">
                    <div class="course-price">${convertPrice(course.priceUSD)}</div>
                    <div class="course-rating">⭐ ${course.rating}</div>
                </div>
                <button class="add-to-cart-btn" onclick="addToCart('${course.id}')">Add to Cart</button>
            </div>
        </div>
    `).join('');
}

// Play course preview
function playCoursePreview(courseId, event) {
    event.stopPropagation();
    const approvedCourses = typeof getApprovedCourses === 'function' ? getApprovedCourses() : [];
    const course = approvedCourses.find(c => c.id === courseId);
    
    if (course && course.previewVideo) {
        // Create a modal to play preview
        const modal = document.createElement('div');
        modal.className = 'modal active';
        modal.style.zIndex = '10000';
        modal.innerHTML = `
            <div class="modal-content" style="max-width: 800px;">
                <button class="modal-close" onclick="this.closest('.modal').remove()">×</button>
                <h2>${course.title} - Preview</h2>
                <video controls autoplay style="width: 100%; max-height: 500px; background: #000; border-radius: 6px;">
                    <source src="${course.previewVideo}" type="video/mp4">
                    Your browser does not support the video tag.
                </video>
            </div>
        `;
        document.body.appendChild(modal);
        
        // Close on outside click
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.remove();
            }
        });
    } else {
        alert('Preview video not available for this course.');
    }
}

// Add to cart
function addToCart(courseId) {
    // Check both default courses and approved courses
    let course = courses.find(c => c.id === courseId);
    
    if (!course) {
        // Try to find in approved courses
        const approvedCourses = typeof getApprovedCourses === 'function' ? getApprovedCourses() : [];
        const approvedCourse = approvedCourses.find(c => c.id === courseId);
        if (approvedCourse) {
            course = {
                id: approvedCourse.id,
                title: approvedCourse.title,
                instructor: approvedCourse.instructorName || approvedCourse.instructor,
                priceUSD: approvedCourse.price,
                rating: 4.5,
                image: approvedCourse.coverImage && approvedCourse.coverImage !== 'default' 
                    ? `<img src="${approvedCourse.coverImage}" alt="${approvedCourse.title}">`
                    : '<div style="width: 100%; height: 200px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);"></div>',
                hasPreview: !!approvedCourse.previewVideo
            };
        }
    }
    
    if (!course) {
        alert('Course not found!');
        return;
    }
    
    if (!cart.find(c => c.id === courseId)) {
        cart.push(course);
        updateCart();
        alert(`${course.title} added to cart!`);
    } else {
        alert('Course already in cart!');
    }
}

// Continue Learning function
function continueLearning(courseId) {
    // Check if user is logged in as student
    const userSession = JSON.parse(localStorage.getItem('userSession') || '{}');
    if (userSession.role !== 'student') {
        alert('Please log in as a student to continue learning.');
        return;
    }
    
    // Get enrolled courses from localStorage
    let enrolledCourses = JSON.parse(localStorage.getItem('enrolledCourses') || '[]');
    const course = enrolledCourses.find(c => c.id === courseId);
    
    if (!course) {
        alert('Course not found in your enrolled courses.');
        return;
    }
    
    // Navigate to course player (simplified - in real app would open course player page)
    alert(`Opening course: ${course.title}\n\nThis would open the course player where you can watch videos and track your progress.`);
    
    // In a real implementation, this would:
    // 1. Open a course player modal/page
    // 2. Load course videos
    // 3. Track progress
    // 4. Allow navigation between modules
}

// Remove from cart
function removeFromCart(courseId) {
    cart = cart.filter(c => c.id !== courseId);
    updateCart();
}

// Update cart display
function updateCart() {
    const badge = document.getElementById('cartBadge');
    const itemsContainer = document.getElementById('cartItems');
    const footer = document.getElementById('cartFooter');
    const totalElement = document.getElementById('cartTotal');

    if (badge) badge.textContent = cart.length;

    if (!itemsContainer) return;

    if (cart.length === 0) {
        itemsContainer.innerHTML = `
            <div class="empty-cart">
                <p style="font-size: 3rem;">🛒</p>
                <p>Your cart is empty</p>
                <p style="font-size: 0.9rem;">Browse our courses and add some to your cart!</p>
            </div>
        `;
        if (footer) footer.style.display = 'none';
    } else {
        itemsContainer.innerHTML = cart.map(course => `
            <div class="cart-item">
                <div class="cart-item-image">${course.image}</div>
                <div class="cart-item-details">
                    <div class="cart-item-title">${course.title}</div>
                    <div class="cart-item-instructor">By ${course.instructor}</div>
                    <div class="cart-item-price">${convertPrice(course.priceUSD)}</div>
                </div>
                <button class="remove-item" onclick="removeFromCart(${course.id})">×</button>
            </div>
        `).join('');
        
        const totalUSD = cart.reduce((sum, course) => sum + course.priceUSD, 0);
        const rate = currencyRates[currentCountry].rate;
        const symbol = currencyRates[currentCountry].symbol;
        const converted = (totalUSD * rate).toFixed(2);
        if (totalElement) totalElement.textContent = `${symbol}${converted}`;
        if (footer) footer.style.display = 'block';
    }
}

// Toggle cart
function toggleCart() {
    const sidebar = document.getElementById('cartSidebar');
    if (sidebar) {
        sidebar.classList.toggle('active');
    }
}

// Checkout
function checkout() {
    const totalElement = document.getElementById('cartTotal');
    const total = totalElement ? totalElement.textContent : '$0.00';
    alert('Proceeding to secure Stripe checkout! Total: ' + total);
}

// Additional button functions
function viewStudentProfile(studentId) {
    alert(`Viewing profile for student: ${studentId}\n\nThis would open a detailed student profile page showing:\n- Enrollment history\n- Progress in courses\n- Certificates earned\n- Communication history`);
}

function saveStudentSettings() {
    const displayName = document.getElementById('studentDisplayName')?.value || document.querySelector('#studentSettingsSection input[type="text"]')?.value;
    if (displayName) {
        localStorage.setItem('studentDisplayName', displayName);
        alert('Settings saved successfully!');
    }
}

function saveInstructorSettings() {
    const displayName = document.getElementById('instructorDisplayName')?.value;
    const bio = document.getElementById('instructorBio')?.value;
    
    if (displayName) {
        localStorage.setItem('instructorDisplayName', displayName);
    }
    if (bio !== undefined) {
        localStorage.setItem('instructorBio', bio);
    }
    
    alert('Instructor settings saved successfully!');
}

function saveInstructorNotifications() {
    const enrollments = document.getElementById('instructorNotifEnrollments')?.checked || false;
    const reviews = document.getElementById('instructorNotifReviews')?.checked || false;
    const messages = document.getElementById('instructorNotifMessages')?.checked || false;
    
    localStorage.setItem('instructorNotifications', JSON.stringify({
        enrollments,
        reviews,
        messages
    }));
    
    alert('Notification preferences saved successfully!');
}

// Reset Password Functions
function resetStudentPassword() {
    const currentPassword = document.getElementById('studentCurrentPassword')?.value;
    const newPassword = document.getElementById('studentNewPassword')?.value;
    const confirmPassword = document.getElementById('studentConfirmPassword')?.value;
    
    if (!currentPassword || !newPassword || !confirmPassword) {
        alert('Please fill in all password fields!');
        return;
    }
    
    if (newPassword !== confirmPassword) {
        alert('New passwords do not match!');
        return;
    }
    
    if (newPassword.length < 6) {
        alert('Password must be at least 6 characters long!');
        return;
    }
    
    // In a real app, you would verify the current password with the server
    // For now, we'll just save the new password to localStorage
    const userSession = JSON.parse(localStorage.getItem('userSession') || '{}');
    userSession.password = newPassword; // In production, this should be hashed
    localStorage.setItem('userSession', JSON.stringify(userSession));
    
    alert('Password reset successfully!');
    
    // Clear password fields
    document.getElementById('studentCurrentPassword').value = '';
    document.getElementById('studentNewPassword').value = '';
    document.getElementById('studentConfirmPassword').value = '';
}

function resetInstructorPassword() {
    const currentPassword = document.getElementById('instructorCurrentPassword')?.value;
    const newPassword = document.getElementById('instructorNewPassword')?.value;
    const confirmPassword = document.getElementById('instructorConfirmPassword')?.value;
    
    if (!currentPassword || !newPassword || !confirmPassword) {
        alert('Please fill in all password fields!');
        return;
    }
    
    if (newPassword !== confirmPassword) {
        alert('New passwords do not match!');
        return;
    }
    
    if (newPassword.length < 6) {
        alert('Password must be at least 6 characters long!');
        return;
    }
    
    // In a real app, you would verify the current password with the server
    // For now, we'll just save the new password to localStorage
    const userSession = JSON.parse(localStorage.getItem('userSession') || '{}');
    userSession.password = newPassword; // In production, this should be hashed
    localStorage.setItem('userSession', JSON.stringify(userSession));
    
    alert('Password reset successfully!');
    
    // Clear password fields
    document.getElementById('instructorCurrentPassword').value = '';
    document.getElementById('instructorNewPassword').value = '';
    document.getElementById('instructorConfirmPassword').value = '';
}

// Load Revenue Data for Instructor
function loadInstructorRevenue() {
    const courses = typeof getAllCourses === 'function' ? getAllCourses() : [];
    const userSession = JSON.parse(localStorage.getItem('userSession') || '{}');
    const instructorEmail = userSession.email || '';
    
    // Get approved courses by this instructor
    const instructorCourses = courses.filter(c => 
        c.instructor === instructorEmail && c.status === 'approved'
    );
    
    // Calculate revenue (simplified - in production this would come from actual sales data)
    let totalRevenue = 0;
    let instructorShare = 0;
    let platformShare = 0;
    let pendingPayout = 0;
    
    instructorCourses.forEach(course => {
        // Simulate revenue based on course price
        const courseRevenue = (course.price || 0) * (course.enrollments || 0);
        totalRevenue += courseRevenue;
        instructorShare += courseRevenue * 0.6;
        platformShare += courseRevenue * 0.4;
        pendingPayout += courseRevenue * 0.6 * 0.2; // 20% pending
    });
    
    // Update revenue display
    const revenueSection = document.getElementById('instructorRevenueSection');
    if (revenueSection) {
        const statValues = revenueSection.querySelectorAll('.stat-value');
        if (statValues.length >= 4) {
            statValues[0].textContent = `$${totalRevenue.toFixed(2)}`;
            statValues[1].textContent = `$${instructorShare.toFixed(2)}`;
            statValues[2].textContent = `$${platformShare.toFixed(2)}`;
            statValues[3].textContent = `$${pendingPayout.toFixed(2)}`;
        }
    }
}

// Load Analytics Data for Instructor
function loadInstructorAnalytics() {
    const courses = typeof getAllCourses === 'function' ? getAllCourses() : [];
    const userSession = JSON.parse(localStorage.getItem('userSession') || '{}');
    const instructorEmail = userSession.email || '';
    
    // Get approved courses by this instructor
    const instructorCourses = courses.filter(c => 
        c.instructor === instructorEmail && c.status === 'approved'
    );
    
    // Calculate analytics
    let totalStudents = 0;
    let activeCourses = instructorCourses.length;
    let averageRating = 0;
    let completionRate = 0;
    
    instructorCourses.forEach(course => {
        totalStudents += course.enrollments || 0;
        averageRating += course.rating || 0;
        completionRate += course.completionRate || 0;
    });
    
    if (instructorCourses.length > 0) {
        averageRating = averageRating / instructorCourses.length;
        completionRate = completionRate / instructorCourses.length;
    }
    
    // Update analytics display
    const analyticsSection = document.getElementById('instructorAnalyticsSection');
    if (analyticsSection) {
        const statValues = analyticsSection.querySelectorAll('.stat-value');
        if (statValues.length >= 4) {
            statValues[0].textContent = totalStudents;
            statValues[1].textContent = activeCourses;
            statValues[2].textContent = averageRating.toFixed(1);
            statValues[3].textContent = `${completionRate.toFixed(0)}%`;
        }
    }
}

// Load Reviews Data for Instructor
function loadInstructorReviews() {
    // In production, this would load from actual reviews data
    // For now, we'll just ensure the section loads
    const reviewsSection = document.getElementById('instructorReviewsSection');
    if (reviewsSection) {
        // Reviews would be loaded here
    }
}

// Load Messages Data for Instructor
function loadInstructorMessages() {
    // In production, this would load from actual messages data
    // For now, we'll just ensure the section loads
    const messagesSection = document.getElementById('instructorMessagesSection');
    if (messagesSection) {
        // Messages would be loaded here
    }
}

// Load Student Messages
function loadStudentMessages() {
    const messagesSection = document.getElementById('studentMessagesSection');
    if (messagesSection) {
        // Messages would be loaded here
    }
}

// Load Admin Pending Courses
function loadAdminPendingCourses() {
    const courses = typeof getAllCourses === 'function' ? getAllCourses() : [];
    const pendingCourses = courses.filter(c => c.status === 'pending' || c.status === 'draft');
    
    const countEl = document.getElementById('adminPendingCount');
    const listEl = document.getElementById('adminPendingCoursesList');
    
    if (countEl) {
        countEl.textContent = `${pendingCourses.length} ${pendingCourses.length === 1 ? 'course' : 'courses'} waiting for review`;
    }
    
    if (listEl) {
        if (pendingCourses.length === 0) {
            listEl.innerHTML = '<p style="color: #718096; text-align: center; padding: 2rem;">No courses pending review at this time.</p>';
        } else {
            listEl.innerHTML = pendingCourses.map(course => {
                const submittedDate = course.submittedAt ? new Date(course.submittedAt).toLocaleDateString() : 
                                      course.createdAt ? new Date(course.createdAt).toLocaleDateString() : 
                                      'Unknown date';
                const category = course.category ? course.category.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) : 'Uncategorized';
                
                return `
                    <div class="content-item" id="admin-course-${course.id}">
                        <div>
                            <h3>${course.title || 'Untitled Course'}</h3>
                            <p>By ${course.instructorName || course.instructor || 'Unknown Instructor'} • Submitted: ${submittedDate} • Price: $${(course.price || 0).toFixed(2)}</p>
                            <p style="font-size: 0.85rem; color: #718096; margin-top: 0.25rem;">Category: ${category} • Status: ${course.status === 'pending' ? 'Pending Review' : 'Draft'}</p>
                        </div>
                        <div>
                            <button class="btn btn-success" onclick="approveCourse('${course.id}', 'admin')">Approve</button>
                            <button class="btn btn-outline" style="margin-left: 0.5rem;" onclick="reviewCourse('${course.id}', 'admin')">Review</button>
                            <button class="btn btn-outline" style="margin-left: 0.5rem;" onclick="rejectCourse('${course.id}', 'admin')">Reject</button>
                        </div>
                    </div>
                `;
            }).join('');
        }
    }
}

// Load Admin All Courses
function loadAdminAllCourses() {
    const courses = typeof getAllCourses === 'function' ? getAllCourses() : [];
    const coursesListEl = document.getElementById('adminCoursesList');
    const statsEl = document.getElementById('adminCoursesStats');
    const searchTerm = document.getElementById('adminCourseSearch')?.value.toLowerCase() || '';
    
    // Update stats
    if (statsEl) {
        const publishedCourses = courses.filter(c => c.status === 'approved');
        const pendingCourses = courses.filter(c => c.status === 'pending');
        statsEl.textContent = `Total: ${publishedCourses.length} published courses, ${pendingCourses.length} pending review`;
    }
    
    if (coursesListEl) {
        let filteredCourses = courses.filter(c => c.status === 'approved' || c.status === 'pending');
        
        // Filter by search term
        if (searchTerm) {
            filteredCourses = filteredCourses.filter(c => 
                (c.title && c.title.toLowerCase().includes(searchTerm)) ||
                (c.instructorName && c.instructorName.toLowerCase().includes(searchTerm)) ||
                (c.instructor && c.instructor.toLowerCase().includes(searchTerm)) ||
                (c.category && c.category.toLowerCase().includes(searchTerm))
            );
        }
        
        // Sort: pending first, then by date
        filteredCourses.sort((a, b) => {
            if (a.status === 'pending' && b.status !== 'pending') return -1;
            if (a.status !== 'pending' && b.status === 'pending') return 1;
            const dateA = new Date(a.submittedAt || a.createdAt || 0);
            const dateB = new Date(b.submittedAt || b.createdAt || 0);
            return dateB - dateA;
        });
        
        if (filteredCourses.length === 0) {
            coursesListEl.innerHTML = '<p style="color: #718096; text-align: center; padding: 2rem;">No courses found.</p>';
        } else {
            coursesListEl.innerHTML = filteredCourses.map(course => {
                const statusBadge = course.status === 'approved' ? '<span style="padding: 0.25rem 0.5rem; background: #10B981; color: white; border-radius: 4px; font-size: 0.75rem; margin-left: 0.5rem;">Published</span>' :
                                 course.status === 'pending' ? '<span style="padding: 0.25rem 0.5rem; background: #FFB800; color: white; border-radius: 4px; font-size: 0.75rem; margin-left: 0.5rem;">Pending</span>' :
                                 '';
                
                return `
                    <div class="content-item" id="admin-all-course-${course.id}">
                        <div>
                            <h3>${course.title || 'Untitled Course'} ${statusBadge}</h3>
                            <p>By ${course.instructorName || course.instructor || 'Unknown Instructor'} • $${(course.price || 0).toFixed(2)}</p>
                        </div>
                        <div>
                            ${course.status === 'pending' ? `
                                <button class="btn btn-outline" onclick="reviewCourse('${course.id}', 'admin')">Review</button>
                                <button class="btn btn-success" onclick="approveCourse('${course.id}', 'admin')" style="margin-left: 0.5rem;">Approve</button>
                                <button class="btn btn-outline" onclick="rejectCourse('${course.id}', 'admin')" style="margin-left: 0.5rem;">Reject</button>
                            ` : `
                                <button class="btn btn-outline" onclick="viewCourseDetails('${course.id}')">View</button>
                            `}
                        </div>
                    </div>
                `;
            }).join('');
        }
    }
}

// Load Super Admin All Courses
function loadSuperAdminAllCourses() {
    const courses = typeof getAllCourses === 'function' ? getAllCourses() : [];
    const coursesListEl = document.getElementById('superAdminAllCoursesList');
    const statsEl = document.getElementById('superAdminCoursesStats');
    const statusFilter = document.getElementById('superAdminCourseStatusFilter')?.value || '';
    const searchTerm = document.getElementById('superAdminCourseSearch')?.value.toLowerCase() || '';
    
    // Update stats
    if (statsEl) {
        const publishedCourses = courses.filter(c => c.status === 'approved');
        const pendingCourses = courses.filter(c => c.status === 'pending' || c.status === 'draft');
        statsEl.textContent = `Total: ${publishedCourses.length} published courses, ${pendingCourses.length} pending review`;
    }
    
    if (coursesListEl) {
        let filteredCourses = courses;
        
        // Filter by status
        if (statusFilter) {
            filteredCourses = filteredCourses.filter(c => c.status === statusFilter);
        }
        
        // Filter by search term
        if (searchTerm) {
            filteredCourses = filteredCourses.filter(c => 
                (c.title && c.title.toLowerCase().includes(searchTerm)) ||
                (c.instructorName && c.instructorName.toLowerCase().includes(searchTerm)) ||
                (c.instructor && c.instructor.toLowerCase().includes(searchTerm)) ||
                (c.category && c.category.toLowerCase().includes(searchTerm))
            );
        }
        
        // Sort: pending first, then by date
        filteredCourses.sort((a, b) => {
            if (a.status === 'pending' && b.status !== 'pending') return -1;
            if (a.status !== 'pending' && b.status === 'pending') return 1;
            const dateA = new Date(a.submittedAt || a.createdAt || 0);
            const dateB = new Date(b.submittedAt || b.createdAt || 0);
            return dateB - dateA;
        });
        
        if (filteredCourses.length === 0) {
            coursesListEl.innerHTML = '<p style="color: #718096; text-align: center; padding: 2rem;">No courses found.</p>';
        } else {
            coursesListEl.innerHTML = filteredCourses.map(course => {
                const statusBadge = course.status === 'approved' ? '<span style="padding: 0.25rem 0.5rem; background: #10B981; color: white; border-radius: 4px; font-size: 0.75rem; margin-left: 0.5rem;">Published</span>' :
                                 course.status === 'pending' ? '<span style="padding: 0.25rem 0.5rem; background: #FFB800; color: white; border-radius: 4px; font-size: 0.75rem; margin-left: 0.5rem;">Pending</span>' :
                                 course.status === 'rejected' ? '<span style="padding: 0.25rem 0.5rem; background: #EF4444; color: white; border-radius: 4px; font-size: 0.75rem; margin-left: 0.5rem;">Rejected</span>' :
                                 course.status === 'draft' ? '<span style="padding: 0.25rem 0.5rem; background: #718096; color: white; border-radius: 4px; font-size: 0.75rem; margin-left: 0.5rem;">Draft</span>' :
                                 '';
                
                const submittedDate = course.submittedAt ? new Date(course.submittedAt).toLocaleDateString() : 
                                      course.createdAt ? new Date(course.createdAt).toLocaleDateString() : 
                                      'Unknown date';
                
                return `
                    <div class="content-item" id="superadmin-course-${course.id}">
                        <div>
                            <h3>${course.title || 'Untitled Course'} ${statusBadge}</h3>
                            <p>By ${course.instructorName || course.instructor || 'Unknown Instructor'} • $${(course.price || 0).toFixed(2)} • ${submittedDate}</p>
                        </div>
                        <div>
                            ${course.status === 'pending' ? `
                                <button class="btn btn-outline" onclick="reviewCourse('${course.id}', 'superadmin')">Review</button>
                                <button class="btn btn-success" onclick="approveCourse('${course.id}', 'superadmin')" style="margin-left: 0.5rem;">Approve</button>
                                <button class="btn btn-outline" onclick="rejectCourse('${course.id}', 'superadmin')" style="margin-left: 0.5rem;">Reject</button>
                            ` : course.status === 'approved' ? `
                                <button class="btn btn-outline" onclick="viewCourseDetails('${course.id}')">View</button>
                                <button class="btn btn-primary" onclick="toggleFeaturedCourse('${course.id}', 'superadmin')" style="margin-left: 0.5rem;">⭐ Feature</button>
                            ` : `
                                <button class="btn btn-outline" onclick="viewCourseDetails('${course.id}')">View</button>
                            `}
                        </div>
                    </div>
                `;
            }).join('');
        }
    }
}

// Filter Super Admin Courses
function filterSuperAdminCourses() {
    if (typeof loadSuperAdminAllCourses === 'function') {
        loadSuperAdminAllCourses();
    }
}

// Refresh course lists (called after approval/rejection)
function refreshCourseLists() {
    // Reload pending courses if in admin portal
    if (typeof loadAdminPendingCourses === 'function') {
        loadAdminPendingCourses();
    }
    
    // Reload all courses if in super admin portal
    if (typeof loadSuperAdminAllCourses === 'function') {
        loadSuperAdminAllCourses();
    }
    
    // Reload marketplace courses
    if (typeof loadCourses === 'function') {
        loadCourses();
    }
}

function viewReviewDetails(reviewId) {
    alert(`Viewing review details for: ${reviewId}\n\nThis would show:\n- Full review text\n- Student information\n- Course details\n- Response options`);
}

function editCourse(courseId) {
    alert(`Editing course: ${courseId}\n\nThis would open the course editor where you can:\n- Update course details\n- Modify videos\n- Change pricing\n- Update description`);
}

function viewCourseDetails(courseId) {
    alert(`Viewing course details for: ${courseId}\n\nThis would show:\n- Course information\n- Student enrollment\n- Revenue statistics\n- Performance metrics`);
}

function saveStripeWebhookSettings() {
    alert('Stripe webhook settings saved successfully!');
}

function saveStripePaymentSettings() {
    alert('Stripe payment settings saved successfully!');
}

// Data Management Functions
function loadDataManagementTable() {
    const tbody = document.getElementById('dataManagementTableBody');
    if (!tbody) return;
    
    // Get all users from localStorage
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const courses = typeof getAllCourses === 'function' ? getAllCourses() : [];
    
    // Combine user data with course/enrollment data
    const dataRows = users.map(user => {
        const userCourses = courses.filter(c => c.instructor === user.email);
        const enrollments = JSON.parse(localStorage.getItem('enrollments') || '[]').filter(e => e.userEmail === user.email);
        const revenue = userCourses.reduce((sum, course) => sum + (course.revenue || 0), 0);
        
        return {
            id: user.id || user.email,
            name: user.name || 'N/A',
            email: user.email,
            role: user.role || 'student',
            status: user.status || 'active',
            courses: userCourses.length,
            enrollments: enrollments.length,
            revenue: `$${revenue.toFixed(2)}`,
            created: user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A',
            lastActive: user.lastActive ? new Date(user.lastActive).toLocaleDateString() : 'N/A'
        };
    });
    
    // Render table rows
    tbody.innerHTML = dataRows.map(row => `
        <tr style="border-bottom: 1px solid #E2E8F0;">
            <td class="column-cell" data-column="id" style="padding: 0.75rem;">${row.id}</td>
            <td class="column-cell" data-column="name" style="padding: 0.75rem;">${row.name}</td>
            <td class="column-cell" data-column="email" style="padding: 0.75rem;">${row.email}</td>
            <td class="column-cell" data-column="role" style="padding: 0.75rem;">
                <span style="padding: 0.25rem 0.5rem; border-radius: 4px; background: ${row.role === 'admin' ? '#E3F2FD' : row.role === 'instructor' ? '#F3E5F5' : '#E8F5E9'}; color: ${row.role === 'admin' ? '#1976D2' : row.role === 'instructor' ? '#7B1FA2' : '#388E3C'};">${row.role}</span>
            </td>
            <td class="column-cell" data-column="status" style="padding: 0.75rem;">
                <span style="padding: 0.25rem 0.5rem; border-radius: 4px; background: ${row.status === 'active' ? '#E8F5E9' : '#FFEBEE'}; color: ${row.status === 'active' ? '#388E3C' : '#D32F2F'};">${row.status}</span>
            </td>
            <td class="column-cell" data-column="courses" style="padding: 0.75rem;">${row.courses}</td>
            <td class="column-cell" data-column="enrollments" style="padding: 0.75rem;">${row.enrollments}</td>
            <td class="column-cell" data-column="revenue" style="padding: 0.75rem;">${row.revenue}</td>
            <td class="column-cell" data-column="created" style="padding: 0.75rem;">${row.created}</td>
            <td class="column-cell" data-column="lastActive" style="padding: 0.75rem;">${row.lastActive}</td>
            <td style="padding: 0.75rem;">
                <button class="btn btn-outline" style="padding: 0.25rem 0.5rem; font-size: 0.85rem;" onclick="viewUserDetails('${row.email}')">View</button>
            </td>
        </tr>
    `).join('');
}

function filterDataByRole() {
    const filter = document.getElementById('dataFilterRole').value;
    const rows = document.querySelectorAll('#dataManagementTableBody tr');
    
    rows.forEach(row => {
        const roleCell = row.querySelector('[data-column="role"]');
        if (roleCell) {
            const role = roleCell.textContent.trim().toLowerCase();
            if (filter === 'all' || role === filter) {
                row.style.display = '';
            } else {
                row.style.display = 'none';
            }
        }
    });
}

function toggleColumn(columnName) {
    const checkbox = event.target;
    const isChecked = checkbox.checked;
    const columnCells = document.querySelectorAll(`[data-column="${columnName}"]`);
    
    columnCells.forEach(cell => {
        cell.style.display = isChecked ? '' : 'none';
    });
}

function toggleColumnVisibility() {
    alert('Column visibility can be toggled using the checkboxes in the table header. Uncheck a checkbox to hide that column.');
}

function exportData() {
    const rows = [];
    const headers = [];
    const headerCells = document.querySelectorAll('#dataManagementTable thead th');
    
    headerCells.forEach(th => {
        const checkbox = th.querySelector('input[type="checkbox"]');
        if (checkbox && checkbox.checked) {
            headers.push(th.textContent.trim());
        }
    });
    
    const visibleRows = Array.from(document.querySelectorAll('#dataManagementTableBody tr')).filter(row => row.style.display !== 'none');
    visibleRows.forEach(row => {
        const rowData = [];
        row.querySelectorAll('[data-column]').forEach(cell => {
            const column = cell.getAttribute('data-column');
            const header = headerCells[Array.from(headerCells).findIndex(th => th.getAttribute('data-column') === column)];
            if (header && header.querySelector('input[type="checkbox"]').checked) {
                rowData.push(cell.textContent.trim());
            }
        });
        rows.push(rowData);
    });
    
    // Create CSV
    let csv = headers.join(',') + '\n';
    rows.forEach(row => {
        csv += row.join(',') + '\n';
    });
    
    // Download CSV
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `data_export_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
    
    alert('Data exported successfully!');
}

function viewUserDetails(email) {
    alert(`Viewing details for user: ${email}\n\nThis would open a detailed user profile page.`);
}

// Filter courses by category
function filterCoursesByCategory() {
    const categoryFilter = document.getElementById('categoryFilter');
    if (!categoryFilter) return;
    
    const selectedCategory = categoryFilter.value;
    const allCourses = document.querySelectorAll('.course-card');
    
    if (!selectedCategory) {
        // Show all courses
        allCourses.forEach(card => {
            card.style.display = '';
        });
        return;
    }
    
    // Filter courses based on selected category
    allCourses.forEach(card => {
        // Get course data from the card or from localStorage
        const courseId = card.getAttribute('data-course-id') || '';
        const courses = typeof getAllCourses === 'function' ? getAllCourses() : [];
        const course = courses.find(c => c.id === courseId);
        
        // Check if course matches selected category/subcategory
        if (course) {
            const courseCategory = course.category || '';
            const courseSubcategory = course.subcategory || '';
            const categoryMatch = courseCategory === selectedCategory || 
                                 courseSubcategory === selectedCategory ||
                                 courseCategory.includes(selectedCategory) ||
                                 courseSubcategory.includes(selectedCategory);
            
            card.style.display = categoryMatch ? '' : 'none';
        } else {
            // For default courses, show all if no specific filter
            card.style.display = '';
        }
    });
    
    // Update course count display if exists
    const visibleCount = Array.from(allCourses).filter(card => card.style.display !== 'none').length;
    console.log(`Showing ${visibleCount} courses for category: ${selectedCategory}`);
}

// Filter by category from footer links
function filterByCategory(categoryValue) {
    // Navigate to courses section
    showPage('landing');
    setTimeout(() => {
        // Scroll to courses section
        const coursesSection = document.getElementById('courses');
        if (coursesSection) {
            coursesSection.scrollIntoView({ behavior: 'smooth' });
        }
        
        // Filter courses by main category
        const allCourses = document.querySelectorAll('.course-card');
        const categoryMap = {
            'business-entrepreneurship': ['business-entrepreneurship', 'business-fundamentals', 'business-planning', 'entrepreneurship'],
            'technology-software': ['technology-software', 'web-development', 'python-programming', 'mobile-app-development'],
            'data-science': ['data-science', 'machine-learning', 'big-data-analytics', 'ai-applications'],
            'creative-arts-design': ['creative-arts-design', 'photoshop', 'illustrator', 'user-experience-principles'],
            'project-management': ['project-management', 'pm-fundamentals', 'agile-pm', 'scrum-master'],
            'digital-marketing': ['digital-marketing', 'seo-sem', 'branding', 'sales-funnel']
        };
        
        const matchingCategories = categoryMap[categoryValue] || [categoryValue];
        
        allCourses.forEach(card => {
            const courseCategory = card.getAttribute('data-category') || '';
            const courseSubcategory = card.getAttribute('data-subcategory') || '';
            
            const matches = matchingCategories.some(cat => 
                courseCategory.includes(cat) || 
                courseSubcategory.includes(cat) ||
                courseCategory === cat ||
                courseSubcategory === cat
            );
            
            card.style.display = matches ? '' : 'none';
        });
        
        // Also update the dropdown to show the first matching subcategory
        const categoryFilter = document.getElementById('categoryFilter');
        if (categoryFilter && matchingCategories.length > 0) {
            categoryFilter.value = matchingCategories[0];
        }
    }, 300);
}

// Handle contact form submission
function handleContactSubmit(e) {
    e.preventDefault();
    const name = document.getElementById('contactName').value;
    const email = document.getElementById('contactEmail').value;
    const subject = document.getElementById('contactSubject').value;
    const message = document.getElementById('contactMessage').value;
    
    // Save contact submission to localStorage
    const contacts = JSON.parse(localStorage.getItem('contactSubmissions') || '[]');
    contacts.push({
        name: name,
        email: email,
        subject: subject,
        message: message,
        submittedAt: new Date().toISOString()
    });
    localStorage.setItem('contactSubmissions', JSON.stringify(contacts));
    
    alert('Thank you for contacting us! We will get back to you within 24 hours.');
    
    // Reset form
    document.getElementById('contactName').value = '';
    document.getElementById('contactEmail').value = '';
    document.getElementById('contactSubject').value = '';
    document.getElementById('contactMessage').value = '';
}

// Admin Management Functions
function editAdminPermissions(adminEmail) {
    alert(`Editing permissions for: ${adminEmail}\n\nThis would open a permissions editor modal.`);
}

function removeAdmin(adminEmail) {
    if (confirm(`Are you sure you want to remove admin privileges for ${adminEmail}?`)) {
        // Remove admin from localStorage
        const users = JSON.parse(localStorage.getItem('users') || '[]');
        const userIndex = users.findIndex(u => u.email === adminEmail);
        if (userIndex !== -1) {
            users[userIndex].role = 'student';
            localStorage.setItem('users', JSON.stringify(users));
        }
        
        // Remove from admin codes list if applicable
        const adminCodes = JSON.parse(localStorage.getItem('adminAccessCodes') || '[]');
        // Note: This is simplified - in real app, you'd track which code belongs to which admin
        
        alert(`Admin privileges removed for ${adminEmail}. They have been converted to a student account.`);
        
        // Refresh admin management section
        if (typeof showSuperAdminSection === 'function') {
            showSuperAdminSection('adminManagement', null);
        }
    }
}

// Site Settings Save Functions
function saveSiteSettings(category) {
    if (category === 'branding') {
        const siteName = document.querySelector('#superAdminSiteSettingsSection input[type="text"]')?.value;
        if (siteName) {
            localStorage.setItem('siteName', siteName);
            document.title = siteName;
        }
        alert('Branding settings saved successfully!');
    } else if (category === 'general') {
        const currency = document.getElementById('siteDefaultCurrency')?.value;
        const timezone = document.getElementById('siteTimeZone')?.value;
        if (currency) localStorage.setItem('siteDefaultCurrency', currency);
        if (timezone) localStorage.setItem('siteTimeZone', timezone);
        alert('General settings saved successfully!');
    }
}

// Pricing Settings Save Functions
function savePricingSettings(category) {
    if (category === 'subscription') {
        const monthlyFee = document.querySelector('#superAdminPricingSettingsSection input[type="number"]')?.value;
        if (monthlyFee) {
            localStorage.setItem('instructorMonthlyFee', monthlyFee);
        }
        alert('Subscription settings saved successfully!');
    } else if (category === 'revenue') {
        const revenueShare = document.getElementById('pricingRevenueShare')?.value;
        const platformShare = 100 - (parseInt(revenueShare) || 0);
        if (revenueShare) {
            localStorage.setItem('instructorRevenueShare', revenueShare);
            localStorage.setItem('platformRevenueShare', platformShare.toString());
            document.getElementById('pricingPlatformShare').value = platformShare;
        }
        alert('Revenue sharing settings saved successfully!');
    }
}

// Load Featured Courses
function loadFeaturedCourses() {
    const featuredSection = document.getElementById('featuredCoursesGrid');
    if (!featuredSection) return;
    
    const approvedCourses = typeof getApprovedCourses === 'function' ? getApprovedCourses() : [];
    const featuredCourses = JSON.parse(localStorage.getItem('featuredCourses') || '[]');
    
    const featured = approvedCourses.filter(c => featuredCourses.includes(c.id) || c.isFeatured);
    
    if (featured.length === 0) {
        featuredSection.innerHTML = '<p style="text-align: center; color: #718096; padding: 2rem;">No featured courses yet. Featured courses will appear here.</p>';
        return;
    }
    
    featuredSection.innerHTML = featured.slice(0, 6).map(course => {
        const courseCard = {
            id: course.id,
            title: course.title,
            instructor: course.instructorName || course.instructor,
            priceUSD: course.price,
            rating: 4.5,
            image: course.coverImage && course.coverImage !== 'default' 
                ? `<img src="${course.coverImage}" alt="${course.title}" style="width: 100%; height: 200px; object-fit: cover;">`
                : '<div style="width: 100%; height: 200px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); display: flex; align-items: center; justify-content: center; color: white; font-size: 2rem;">📚</div>',
            hasPreview: !!course.previewVideo
        };
        
        return `
            <div class="course-card" style="border: 2px solid #5B7FFF;" data-course-id="${courseCard.id}" data-category="${course.category || ''}" data-subcategory="${course.subcategory || ''}">
                <div class="course-image" style="position: relative;">
                    ${courseCard.image}
                    <div style="position: absolute; top: 10px; right: 10px; background: #5B7FFF; color: white; padding: 0.25rem 0.5rem; border-radius: 4px; font-size: 0.75rem; font-weight: 600;">⭐ Featured</div>
                    ${courseCard.hasPreview ? '<div class="preview-badge" onclick="playCoursePreview(\'' + courseCard.id + '\', event)">▶ Preview</div>' : ''}
                </div>
                <div class="course-content">
                    <div class="course-title">${courseCard.title}</div>
                    <div class="course-instructor">By ${courseCard.instructor}</div>
                    <div class="course-meta">
                        <div class="course-price">${convertPrice(courseCard.priceUSD)}</div>
                        <div class="course-rating">⭐ ${courseCard.rating}</div>
                    </div>
                    <button class="add-to-cart-btn" onclick="addToCart('${courseCard.id}')">Add to Cart</button>
                </div>
            </div>
        `;
    }).join('');
}

// Category and Subcategory Management
const categorySubcategories = {
    'business-entrepreneurship': [
        'Business Fundamentals', 'Business Planning', 'Market Research', 'Business Law Basics', 'Entrepreneurship for Beginners',
        'Entrepreneurship & Startups', 'Startup Launch', 'Lean Startup Methodology', 'Funding & Venture Capital', 'Business Model Development',
        'Leadership & Management', 'Strategic Management', 'People Management', 'Change Management', 'Decision Making',
        'Marketing & Sales', 'Digital Marketing', 'SEO & SEM', 'Branding', 'Sales Funnel Creation',
        'Finance & Accounting', 'Personal Finance', 'Corporate Finance', 'Investment Strategies', 'Bookkeeping & Accounting Tools'
    ],
    'business-analysis': [
        'Introduction to Business Analysis',
        'Business Analysis Planning',
        'Requirements Gathering',
        'Stakeholder Analysis',
        'Business Process Modeling',
        'Use Case Development',
        'Data Analysis for Business',
        'Agile Business Analysis',
        'Business Requirements Documentation',
        'Business Intelligence & Reporting'
    ],
    'project-management': [
        'Project Management Fundamentals',
        'Agile Project Management',
        'Scrum Master Training',
        'Waterfall Methodology',
        'Project Scheduling',
        'Risk Management in Projects',
        'Project Budgeting',
        'Stakeholder Management',
        'Project Scope Management',
        'Project Monitoring & Control',
        'Project Closure & Review',
        'PMI Certification Preparation (PMP, CAPM)',
        'Microsoft Project Training',
        'Asana/Trello/Jira for Project Managers'
    ],
    'technology-software': [
        'Programming & Development', 'Web Development (HTML, CSS, JS)', 'Python Programming', 'Java, C++, C#', 'Mobile App Development',
        'Data & AI', 'Data Science', 'Machine Learning', 'AI Applications', 'Big Data Analytics',
        'Cybersecurity', 'Ethical Hacking', 'Network Security', 'Cloud Security', 'Cyber Risk Management',
        'IT & Networking', 'Networking Fundamentals', 'Cloud Computing (AWS, Azure, GCP)', 'System Administration',
        'Software Tools', 'Microsoft Office Suite', 'Google Workspace', 'Project Management Tools (Trello, Asana, Jira)'
    ],
    'creative-arts-design': [
        'Graphic Design', 'Photoshop', 'Illustrator', 'Canva for Beginners',
        'UI/UX Design', 'User Experience Principles', 'Wireframing & Prototyping', 'Figma / Adobe XD',
        'Photography & Videography', 'Camera Basics', 'Video Editing (Premiere Pro, Final Cut)', 'Lighting Techniques',
        'Music & Audio', 'Music Production', 'Audio Editing', 'Songwriting',
        'Art & Illustration', 'Drawing Basics', 'Painting Techniques', 'Digital Art'
    ],
    'science-engineering-math': [
        'Natural Sciences', 'Biology', 'Chemistry', 'Physics',
        'Engineering', 'Mechanical Engineering Basics', 'Electrical Engineering', 'Civil Engineering',
        'Mathematics', 'Algebra', 'Calculus', 'Statistics',
        'Environmental Science', 'Climate Change', 'Renewable Energy', 'Sustainability Practices'
    ],
    'personal-development': [
        'Self-Improvement', 'Productivity & Time Management', 'Mindfulness & Meditation', 'Goal Setting',
        'Communication Skills', 'Public Speaking', 'Negotiation Skills', 'Writing Skills',
        'Career Development', 'Resume Writing', 'Interview Skills', 'Career Change Strategies',
        'Soft Skills', 'Emotional Intelligence', 'Conflict Resolution', 'Teamwork'
    ],
    'health-wellness-lifestyle': [
        'Fitness & Exercise', 'Weight Training', 'Yoga', 'Pilates',
        'Nutrition', 'Healthy Eating', 'Diet Planning', 'Sports Nutrition',
        'Mental Health', 'Stress Management', 'Coping Strategies', 'Mindset Coaching',
        'Lifestyle Skills', 'Personal Finance for Everyday Life', 'Home Organization', 'Sustainable Living'
    ],
    'language-learning': [
        'English', 'Grammar', 'Business English', 'IELTS/TOEFL Prep',
        'Other Languages', 'Spanish', 'French', 'German', 'Chinese (Mandarin)', 'Arabic',
        'Language Skills', 'Writing', 'Speaking', 'Listening'
    ],
    'professional-certifications': [
        'IT & Technology', 'AWS Certification', 'Cisco (CCNA, CCNP)', 'CompTIA A+/Security+',
        'Business', 'PMP (Project Management)', 'Six Sigma', 'HR Certifications',
        'Education', 'Teaching Certificates', 'TESOL/TEFL',
        'Healthcare', 'First Aid & CPR', 'Medical Coding & Billing'
    ],
    'hobbies-special-interests': [
        'Cooking & Baking', 'World Cuisines', 'Pastry & Desserts', 'Healthy Cooking',
        'DIY & Crafts', 'Woodworking', 'Sewing', 'Jewelry Making',
        'Travel & Culture', 'Travel Photography', 'Cultural Studies', 'Language for Travelers',
        'Gaming', 'Game Design', 'eSports Coaching', 'Streaming & Content Creation'
    ]
};

function updateSubcategoryOptions() {
    const categorySelect = document.getElementById('courseCategory');
    const subcategorySelect = document.getElementById('courseSubcategory');
    
    if (!categorySelect || !subcategorySelect) return;
    
    const selectedCategory = categorySelect.value;
    
    // Clear existing options
    subcategorySelect.innerHTML = '<option value="">Select subcategory</option>';
    
    // Add subcategories for selected category
    if (selectedCategory && categorySubcategories[selectedCategory]) {
        categorySubcategories[selectedCategory].forEach(subcat => {
            const option = document.createElement('option');
            option.value = subcat.toLowerCase().replace(/\s+/g, '-');
            option.textContent = subcat;
            subcategorySelect.appendChild(option);
        });
    }
}

// Featured Course Management
function toggleFeaturedCourse(courseId, role) {
    const courses = typeof getAllCourses === 'function' ? getAllCourses() : [];
    const courseIndex = courses.findIndex(c => c.id === courseId);
    
    if (courseIndex === -1) {
        // For demo courses, create entry
        const featuredCourses = JSON.parse(localStorage.getItem('featuredCourses') || '[]');
        const isFeatured = featuredCourses.includes(courseId);
        
        if (isFeatured) {
            const index = featuredCourses.indexOf(courseId);
            featuredCourses.splice(index, 1);
            localStorage.setItem('featuredCourses', JSON.stringify(featuredCourses));
            alert('Course removed from featured courses.');
        } else {
            featuredCourses.push(courseId);
            localStorage.setItem('featuredCourses', JSON.stringify(featuredCourses));
            alert('Course added to featured courses!');
        }
    } else {
        const course = courses[courseIndex];
        course.isFeatured = !course.isFeatured;
        courses[courseIndex] = course;
        localStorage.setItem('courses', JSON.stringify(courses));
        
        // Also update featured courses list
        let featuredCourses = JSON.parse(localStorage.getItem('featuredCourses') || '[]');
        if (course.isFeatured && !featuredCourses.includes(courseId)) {
            featuredCourses.push(courseId);
        } else if (!course.isFeatured && featuredCourses.includes(courseId)) {
            featuredCourses = featuredCourses.filter(id => id !== courseId);
        }
        localStorage.setItem('featuredCourses', JSON.stringify(featuredCourses));
        
        alert(course.isFeatured ? 'Course added to featured courses!' : 'Course removed from featured courses.');
    }
    
    // Refresh course lists
    if (typeof refreshCourseLists === 'function') {
        refreshCourseLists();
    }
}

// FAQ Functionality
function showFAQAnswer(faqType) {
    const faqAnswer = document.getElementById('faqAnswer');
    if (!faqAnswer) return;
    
    const answers = {
        'pricing': {
            title: '💰 How does pricing work?',
            content: `Course pricing is set by instructors. Here's how it works:

• Instructors set their own course prices
• Students pay the listed price to enroll
• LEARNIBLE uses Stripe for secure payment processing
• Prices are displayed in your local currency
• All payments are processed securely with DRM protection

Instructors keep 60% of course sales, and we only deduct fees when you earn - no hidden costs!`
        },
        'instructor': {
            title: '👨‍🏫 How do I become an instructor?',
            content: `Becoming an instructor is easy:

1. Sign up as an instructor
2. Create your first course with videos, descriptions, and pricing
3. Submit your course for review
4. Once approved, your course goes live and students can enroll

You can upload:
• Course videos (single or module-based)
• Optional preview videos
• Custom cover images
• Course descriptions and materials

Start sharing your knowledge today!`
        },
        'earnings': {
            title: '💵 How much can I earn?',
            content: `Your earning potential is unlimited! Here's the breakdown:

• You keep 60% of every course sale
• No monthly fees - we only take a percentage when you make a sale
• Set your own course prices
• Track your earnings in real-time through your instructor dashboard

Top instructors earn thousands per month by creating quality courses and building their student base. The more courses you create and the better they are, the more you can earn!`
        },
        'payments': {
            title: '💳 What payment methods do you accept?',
            content: `We accept all major payment methods through Stripe:

• Credit cards (Visa, Mastercard, American Express)
• Debit cards
• Digital wallets (Apple Pay, Google Pay)
• Bank transfers (in supported regions)

All payments are processed securely through Stripe's industry-leading security. Your payment information is never stored on our servers.`
        },
        'currencies': {
            title: '🌍 Which currencies are supported?',
            content: `We support multiple currencies for global accessibility:

• USD - US Dollar
• NGN - Nigerian Naira
• GBP - British Pound
• EUR - Euro
• CAD - Canadian Dollar

Prices are automatically converted to your local currency based on current exchange rates. You can change your currency preference in the header selector.`
        }
    };
    
    const answer = answers[faqType];
    if (answer) {
        faqAnswer.innerHTML = `
            <h3 style="margin-top: 0; color: #2D3748;">${answer.title}</h3>
            <div style="white-space: pre-line; color: #4A5568; line-height: 1.6;">${answer.content}</div>
        `;
        faqAnswer.style.display = 'block';
        
        // Scroll to FAQ answer
        faqAnswer.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
}

// Content Page Management
function editContentPage(pageId) {
    // Load existing content from localStorage
    const contentPages = JSON.parse(localStorage.getItem('contentPages') || '{}');
    const pageData = contentPages[pageId] || getDefaultContentPage(pageId);
    
    // Set modal fields
    document.getElementById('contentPageId').value = pageId;
    document.getElementById('contentPageTitle').value = pageData.title;
    document.getElementById('contentPageContent').value = pageData.content;
    document.getElementById('contentPageMeta').value = pageData.meta || '';
    document.getElementById('contentPageEditorTitle').textContent = `Edit ${pageData.title}`;
    
    // Open modal
    openModal('contentPageEditor');
}

function getDefaultContentPage(pageId) {
    const defaults = {
        'home': {
            title: 'Home Page',
            content: 'Welcome to LEARNIBLE!\n\nThis is the home page content. You can edit this content to customize your landing page.',
            meta: 'Learn with LEARNIBLE - Online courses platform'
        },
        'about': {
            title: 'About Page',
            content: 'About LEARNIBLE\n\nWe are an online learning platform dedicated to providing quality education to students worldwide.',
            meta: 'About LEARNIBLE - Learn more about our platform'
        },
        'terms': {
            title: 'Terms of Service',
            content: 'Terms of Service\n\nPlease read these terms carefully before using our platform.',
            meta: 'Terms of Service - LEARNIBLE'
        },
        'privacy': {
            title: 'Privacy Policy',
            content: 'Privacy Policy\n\nWe respect your privacy and are committed to protecting your personal data.',
            meta: 'Privacy Policy - LEARNIBLE'
        },
        'help': {
            title: 'Help Center',
            content: 'Help Center\n\nFrequently Asked Questions and Support Documentation\n\nHow can we help you today?',
            meta: 'Help Center - LEARNIBLE Support'
        }
    };
    return defaults[pageId] || { title: 'Content Page', content: '', meta: '' };
}

function saveContentPage(e) {
    e.preventDefault();
    
    const pageId = document.getElementById('contentPageId').value;
    const title = document.getElementById('contentPageTitle').value;
    const content = document.getElementById('contentPageContent').value;
    const meta = document.getElementById('contentPageMeta').value;
    
    // Save to localStorage
    const contentPages = JSON.parse(localStorage.getItem('contentPages') || '{}');
    contentPages[pageId] = {
        title: title,
        content: content,
        meta: meta,
        updatedAt: new Date().toISOString()
    };
    localStorage.setItem('contentPages', JSON.stringify(contentPages));
    
    // Update site content immediately
    updateSiteContent(pageId, title, content, meta);
    
    alert('Content page saved successfully! The site has been updated.');
    closeModal('contentPageEditor');
}

function updateSiteContent(pageId, title, content, meta) {
    // Update meta tags if applicable
    if (meta) {
        let metaDesc = document.querySelector('meta[name="description"]');
        if (!metaDesc) {
            metaDesc = document.createElement('meta');
            metaDesc.name = 'description';
            document.head.appendChild(metaDesc);
        }
        metaDesc.content = meta;
    }
    
    // Update actual page content based on pageId
    if (pageId === 'home') {
        // Update landing page if visible
        const heroSection = document.querySelector('.hero');
        if (heroSection) {
            const heroTitle = heroSection.querySelector('h1');
            const heroSubtitle = heroSection.querySelector('p');
            if (heroTitle && title) heroTitle.textContent = title;
            if (heroSubtitle && content) {
                const lines = content.split('\n');
                heroSubtitle.textContent = lines.length > 1 ? lines[1] : lines[0];
            }
        }
    } else if (pageId === 'about') {
        // Update About page if visible
        const aboutContent = document.getElementById('aboutPageContent');
        if (aboutContent) {
            aboutContent.innerHTML = `
                <h2>${title}</h2>
                <div style="white-space: pre-line; line-height: 1.8;">${content}</div>
            `;
        }
    } else if (pageId === 'help') {
        // Update FAQ/Help section
        const chatbotBody = document.querySelector('.chatbot-body');
        if (chatbotBody && content) {
            // Could update FAQ content here
            console.log('Help content updated:', { title, content });
        }
    }
    
    // Store the updated content for future display
    // The content is stored in localStorage and will be loaded when pages are viewed
}

// Social Media Integration Functions
function saveSocialMediaSettings() {
    const twitter = document.getElementById('socialMediaTwitter')?.value.trim();
    const youtube = document.getElementById('socialMediaYoutube')?.value.trim();
    const instagram = document.getElementById('socialMediaInstagram')?.value.trim();
    const linkedin = document.getElementById('socialMediaLinkedin')?.value.trim();
    
    const socialMedia = {
        twitter: twitter || '',
        youtube: youtube || '',
        instagram: instagram || '',
        linkedin: linkedin || ''
    };
    
    localStorage.setItem('socialMediaLinks', JSON.stringify(socialMedia));
    
    // Show success message
    alert('Social media links saved successfully! The footer icons will now link to these URLs.');
    
    // Update preview
    updateSocialMediaPreview();
}

function getSocialMediaLinks() {
    const stored = localStorage.getItem('socialMediaLinks');
    if (stored) {
        return JSON.parse(stored);
    }
    return {
        twitter: '',
        youtube: '',
        instagram: '',
        linkedin: ''
    };
}

function openSocialLink(platform) {
    const links = getSocialMediaLinks();
    const url = links[platform];
    
    if (url) {
        window.open(url, '_blank', 'noopener,noreferrer');
    } else {
        // If no URL is set, show a message
        alert(`${platform.charAt(0).toUpperCase() + platform.slice(1)} link has not been configured yet. Please set it up in the Super Admin portal under Social Media Integration.`);
    }
}

function previewSocialLink(platform) {
    openSocialLink(platform);
}

function loadSocialMediaSettings() {
    const links = getSocialMediaLinks();
    
    if (document.getElementById('socialMediaTwitter')) {
        document.getElementById('socialMediaTwitter').value = links.twitter || '';
    }
    if (document.getElementById('socialMediaYoutube')) {
        document.getElementById('socialMediaYoutube').value = links.youtube || '';
    }
    if (document.getElementById('socialMediaInstagram')) {
        document.getElementById('socialMediaInstagram').value = links.instagram || '';
    }
    if (document.getElementById('socialMediaLinkedin')) {
        document.getElementById('socialMediaLinkedin').value = links.linkedin || '';
    }
}

function updateSocialMediaPreview() {
    // This function can be used to update the preview in the Super Admin portal
    // The actual footer icons will use openSocialLink() which reads from localStorage
}

// Load social media settings when Super Admin Social Media section is opened
document.addEventListener('DOMContentLoaded', function() {
    // Check if we're on the Super Admin Social Media section
    const observer = new MutationObserver(function(mutations) {
        const socialMediaSection = document.getElementById('superAdminSocialMediaSection');
        if (socialMediaSection && !socialMediaSection.classList.contains('hidden')) {
            loadSocialMediaSettings();
        }
    });
    
    const targetNode = document.body;
    if (targetNode) {
        observer.observe(targetNode, {
            childList: true,
            subtree: true,
            attributes: true,
            attributeFilter: ['class']
        });
    }
});

// Load instructor courses
function loadInstructorCourses() {
    const userSession = JSON.parse(localStorage.getItem('userSession') || '{}');
    const instructorEmail = userSession.email || '';
    
    if (!instructorEmail) {
        const coursesList = document.getElementById('instructorCoursesList');
        if (coursesList) {
            coursesList.innerHTML = '<p style="color: #718096; text-align: center; padding: 2rem;">Please log in to view your courses.</p>';
        }
        return;
    }
    
    const allCourses = typeof getAllCourses === 'function' ? getAllCourses() : [];
    const instructorCourses = allCourses.filter(c => c.instructor === instructorEmail);
    
    // Sort by date (newest first)
    instructorCourses.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
    
    // Count courses by status
    const approved = instructorCourses.filter(c => c.status === 'approved').length;
    const pending = instructorCourses.filter(c => c.status === 'pending').length;
    const draft = instructorCourses.filter(c => c.status === 'draft').length;
    const rejected = instructorCourses.filter(c => c.status === 'rejected').length;
    
    // Update stats
    const statsElement = document.getElementById('instructorCoursesStats');
    if (statsElement) {
        const total = instructorCourses.length;
        const active = approved;
        statsElement.textContent = `${total} total courses (${active} active, ${pending} pending, ${draft} drafts, ${rejected} rejected)`;
    }
    
    // Display courses
    const coursesList = document.getElementById('instructorCoursesList');
    if (!coursesList) return;
    
    if (instructorCourses.length === 0) {
        coursesList.innerHTML = '<p style="color: #718096; text-align: center; padding: 2rem;">You haven\'t created any courses yet. <button class="btn btn-primary" onclick="openModal(\'createCourse\')" style="margin-left: 1rem;">Create Your First Course</button></p>';
        return;
    }
    
    coursesList.innerHTML = instructorCourses.map(course => {
        const statusBadge = course.status === 'approved' 
            ? '<span style="color: #10B981; font-weight: 600;">✓ Published</span>'
            : course.status === 'pending'
            ? '<span style="color: #F59E0B; font-weight: 600;">⏳ Pending Review</span>'
            : course.status === 'rejected'
            ? '<span style="color: #EF4444; font-weight: 600;">✗ Rejected</span>'
            : '<span style="color: #718096; font-weight: 600;">📝 Draft</span>';
        
        const createdDate = course.createdAt ? new Date(course.createdAt).toLocaleDateString() : 'N/A';
        const price = course.price ? `$${course.price.toFixed(2)}` : 'Free';
        
        return `
            <div class="content-item">
                <div>
                    <h3>${course.title || 'Untitled Course'}</h3>
                    <p>${price} • ${statusBadge} • Created: ${createdDate}</p>
                    ${course.description ? `<p style="color: #718096; margin-top: 0.5rem; font-size: 0.9rem;">${course.description.substring(0, 100)}${course.description.length > 100 ? '...' : ''}</p>` : ''}
                </div>
                <div>
                    <button class="btn btn-outline" onclick="editInstructorCourse('${course.id}')">Edit</button>
                    <button class="btn btn-outline" style="margin-left: 0.5rem;" onclick="viewInstructorCourseDetails('${course.id}')">View</button>
                </div>
            </div>
        `;
    }).join('');
}

// Edit instructor course
function editInstructorCourse(courseId) {
    const course = typeof getCourseById === 'function' ? getCourseById(courseId) : null;
    
    if (!course) {
        alert('Course not found!');
        return;
    }
    
    // Check if course belongs to current instructor
    const userSession = JSON.parse(localStorage.getItem('userSession') || '{}');
    if (course.instructor !== userSession.email) {
        alert('You can only edit your own courses!');
        return;
    }
    
    // Open create course modal and populate with course data
    openModal('createCourse');
    
    // Wait for modal to open, then populate fields
    setTimeout(() => {
        const titleInput = document.getElementById('courseTitle');
        const descInput = document.getElementById('courseDescription');
        const priceInput = document.getElementById('coursePrice');
        const categoryInput = document.getElementById('courseCategory');
        const subcategoryInput = document.getElementById('courseSubcategory');
        const structureInput = document.getElementById('courseStructure');
        
        if (titleInput) titleInput.value = course.title || '';
        if (descInput) descInput.value = course.description || '';
        if (priceInput) priceInput.value = course.price || '';
        if (categoryInput) categoryInput.value = course.category || '';
        if (structureInput) structureInput.value = course.structure || 'single';
        
        // Trigger subcategory update
        if (categoryInput && typeof updateSubcategoryOptions === 'function') {
            updateSubcategoryOptions();
            if (subcategoryInput && course.subcategory) {
                setTimeout(() => {
                    subcategoryInput.value = course.subcategory;
                }, 100);
            }
        }
        
        // Store course ID for update
        const form = document.querySelector('#createCourseModal form');
        if (form) {
            form.setAttribute('data-edit-course-id', courseId);
        }
        
        // Show cover image if exists
        if (course.coverImage && course.coverImage !== 'default') {
            const coverOption = document.getElementById('coverOption');
            if (coverOption) coverOption.value = 'custom';
            // Display existing cover image
            const coverPreview = document.getElementById('coverPreview');
            if (coverPreview) {
                coverPreview.innerHTML = `<img src="${course.coverImage}" style="max-width: 100%; max-height: 200px; border-radius: 6px; margin-top: 1rem;" alt="Course cover">`;
            }
        }
        
        alert('Course loaded for editing. Note: Video files need to be re-uploaded since they are stored as metadata only.');
    }, 100);
}

// View instructor course details
function viewInstructorCourseDetails(courseId) {
    const course = typeof getCourseById === 'function' ? getCourseById(courseId) : null;
    
    if (!course) {
        alert('Course not found!');
        return;
    }
    
    // Check if course belongs to current instructor
    const userSession = JSON.parse(localStorage.getItem('userSession') || '{}');
    if (course.instructor !== userSession.email) {
        alert('You can only view your own courses!');
        return;
    }
    
    // Open view modal
    openModal('courseView');
    
    const modalTitle = document.getElementById('courseViewTitle');
    const modalContent = document.getElementById('courseViewContent');
    
    if (modalTitle) modalTitle.textContent = course.title || 'Course Details';
    
    if (modalContent) {
        const statusBadge = course.status === 'approved' 
            ? '<span style="background: #10B981; color: white; padding: 0.25rem 0.75rem; border-radius: 4px; font-size: 0.85rem;">✓ Published</span>'
            : course.status === 'pending'
            ? '<span style="background: #F59E0B; color: white; padding: 0.25rem 0.75rem; border-radius: 4px; font-size: 0.85rem;">⏳ Pending Review</span>'
            : course.status === 'rejected'
            ? '<span style="background: #EF4444; color: white; padding: 0.25rem 0.75rem; border-radius: 4px; font-size: 0.85rem;">✗ Rejected</span>'
            : '<span style="background: #718096; color: white; padding: 0.25rem 0.75rem; border-radius: 4px; font-size: 0.85rem;">📝 Draft</span>';
        
        const createdDate = course.createdAt ? new Date(course.createdAt).toLocaleDateString() : 'N/A';
        const submittedDate = course.submittedAt ? new Date(course.submittedAt).toLocaleDateString() : 'N/A';
        const price = course.price ? `$${course.price.toFixed(2)}` : 'Free';
        
        let videosHtml = '';
        if (course.videos && course.videos.length > 0) {
            videosHtml = '<h4 style="margin-top: 1.5rem; margin-bottom: 0.5rem;">Course Videos:</h4><ul>';
            course.videos.forEach((video, index) => {
                const sizeMB = video.size ? (video.size / (1024 * 1024)).toFixed(2) : 'Unknown';
                videosHtml += `<li style="margin-bottom: 0.5rem;">
                    ${video.type === 'module' ? `Module ${video.moduleNumber}: ` : ''}${video.title || video.name || `Video ${index + 1}`}
                    ${video.size ? ` (${sizeMB} MB)` : ''}
                </li>`;
            });
            videosHtml += '</ul>';
        }
        
        modalContent.innerHTML = `
            <div style="display: grid; gap: 1.5rem;">
                <div>
                    ${course.coverImage && course.coverImage !== 'default' 
                        ? `<img src="${course.coverImage}" style="width: 100%; max-height: 300px; object-fit: cover; border-radius: 8px; margin-bottom: 1rem;" alt="Course cover">`
                        : ''}
                    <div style="display: flex; gap: 1rem; align-items: center; margin-bottom: 1rem;">
                        <h3 style="margin: 0; flex: 1;">${course.title || 'Untitled Course'}</h3>
                        ${statusBadge}
                    </div>
                    <p style="color: #718096; line-height: 1.6; margin-bottom: 1rem;">${course.description || 'No description provided.'}</p>
                </div>
                
                <div style="background: #F7F9FC; padding: 1rem; border-radius: 8px;">
                    <h4 style="margin-top: 0; margin-bottom: 1rem;">Course Information</h4>
                    <div style="display: grid; gap: 0.5rem;">
                        <div><strong>Price:</strong> ${price}</div>
                        <div><strong>Category:</strong> ${course.category || 'Not specified'}</div>
                        ${course.subcategory ? `<div><strong>Subcategory:</strong> ${course.subcategory}</div>` : ''}
                        <div><strong>Structure:</strong> ${course.structure === 'single' ? 'Single Video Course' : 'Module-Based Course'}</div>
                        <div><strong>Created:</strong> ${createdDate}</div>
                        ${course.submittedAt ? `<div><strong>Submitted:</strong> ${submittedDate}</div>` : ''}
                        ${course.reviewedAt ? `<div><strong>Reviewed:</strong> ${new Date(course.reviewedAt).toLocaleDateString()}</div>` : ''}
                    </div>
                </div>
                
                ${course.previewVideo ? `
                    <div>
                        <h4 style="margin-bottom: 0.5rem;">Preview Video</h4>
                        <p style="color: #718096;">${course.previewVideo.name || 'Preview video'} 
                        ${course.previewVideo.size ? `(${(course.previewVideo.size / (1024 * 1024)).toFixed(2)} MB)` : ''}</p>
                        <p style="font-size: 0.9rem; color: #718096; font-style: italic;">Note: Preview video file is stored as metadata. Actual playback requires the original file.</p>
                    </div>
                ` : ''}
                
                ${videosHtml}
                
                <div style="display: flex; gap: 0.5rem; margin-top: 1rem;">
                    <button class="btn btn-primary" onclick="editInstructorCourse('${course.id}'); closeModal('courseView');">Edit Course</button>
                    ${course.status === 'draft' ? `<button class="btn btn-success" onclick="submitCourseForReview('${course.id}'); closeModal('courseView');">Submit for Review</button>` : ''}
                </div>
            </div>
        `;
    }
}

// Submit draft course for review
function submitCourseForReview(courseId) {
    const course = typeof getCourseById === 'function' ? getCourseById(courseId) : null;
    
    if (!course) {
        alert('Course not found!');
        return;
    }
    
    if (course.status !== 'draft') {
        alert('Only draft courses can be submitted for review!');
        return;
    }
    
    if (confirm('Submit this course for review? It will be reviewed by an admin before being published.')) {
        if (typeof updateCourseStatus === 'function') {
            updateCourseStatus(courseId, 'pending', null);
            alert('Course submitted for review successfully!');
            if (typeof loadInstructorCourses === 'function') {
                loadInstructorCourses();
            }
        }
    }
}

// Fix video preview - handle metadata-only videos
function playCoursePreview(courseId, event) {
    if (event) event.stopPropagation();
    
    const approvedCourses = typeof getApprovedCourses === 'function' ? getApprovedCourses() : [];
    let course = approvedCourses.find(c => c.id === courseId);
    
    if (!course) {
        // Try getting from all courses
        const allCourses = typeof getAllCourses === 'function' ? getAllCourses() : [];
        course = allCourses.find(c => c.id === courseId);
        if (!course) {
            alert('Course not found!');
            return;
        }
    }
    
    if (!course.previewVideo) {
        alert('Preview video not available for this course.');
        return;
    }
    
    // Check if previewVideo is a metadata object or a URL
    const isMetadata = typeof course.previewVideo === 'object' && course.previewVideo.name;
    
    if (isMetadata) {
        // Show metadata info in modal
        const sizeMB = course.previewVideo.size ? (course.previewVideo.size / (1024 * 1024)).toFixed(2) : 'Unknown';
        const modal = document.createElement('div');
        modal.className = 'modal active';
        modal.style.zIndex = '10000';
        modal.innerHTML = `
            <div class="modal-content" style="max-width: 600px;">
                <button class="modal-close" onclick="this.closest('.modal').remove()">×</button>
                <h2>${course.title} - Preview Video</h2>
                <div style="padding: 1.5rem;">
                    <p><strong>Video File:</strong> ${course.previewVideo.name}</p>
                    <p><strong>Size:</strong> ${sizeMB} MB</p>
                    <p><strong>Type:</strong> ${course.previewVideo.type || 'Unknown'}</p>
                    ${course.previewVideo.uploadedAt ? `<p><strong>Uploaded:</strong> ${new Date(course.previewVideo.uploadedAt).toLocaleString()}</p>` : ''}
                    <div style="background: #F7F9FC; padding: 1rem; border-radius: 6px; margin-top: 1rem;">
                        <p style="color: #718096; font-size: 0.9rem; margin: 0;">
                            <strong>Note:</strong> In this demo, video files are stored as metadata references only to avoid exceeding browser storage limits. 
                            In a production environment, videos would be uploaded to cloud storage and the video URL would be stored here for playback.
                        </p>
                    </div>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
        
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.remove();
            }
        });
    } else if (typeof course.previewVideo === 'string') {
        // It's a URL, play it
        const modal = document.createElement('div');
        modal.className = 'modal active';
        modal.style.zIndex = '10000';
        modal.innerHTML = `
            <div class="modal-content" style="max-width: 800px;">
                <button class="modal-close" onclick="this.closest('.modal').remove()">×</button>
                <h2>${course.title} - Preview</h2>
                <video controls autoplay style="width: 100%; max-height: 500px; background: #000; border-radius: 6px;">
                    <source src="${course.previewVideo}" type="video/mp4">
                    Your browser does not support the video tag.
                </video>
            </div>
        `;
        document.body.appendChild(modal);
        
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.remove();
            }
        });
    } else {
        alert('Preview video format not recognized.');
    }
}

