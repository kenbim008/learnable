// Load courses
function loadCourses() {
    const grid = document.getElementById('coursesGrid');
    if (!grid) return;
    
    // Get approved courses from localStorage
    const approvedCourses = typeof getApprovedCourses === 'function' ? getApprovedCourses() : [];
    
    // Combine with default courses
    let allCourses = [...courses];
    
    // Add approved courses to the list
    approvedCourses.forEach(approvedCourse => {
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
            approvedCourse: approvedCourse // Store reference
        };
        allCourses.push(courseCard);
    });
    
    grid.innerHTML = allCourses.map(course => `
        <div class="course-card">
            <div class="course-image" style="position: relative;">
                ${course.image}
                ${course.hasPreview ? '<div class="preview-badge" onclick="playCoursePreview(\'' + course.id + '\', event)">▶ Preview</div>' : ''}
            </div>
            <div class="course-content">
                <div class="course-title">${course.title}</div>
                <div class="course-instructor">By ${course.instructor}</div>
                <div class="course-meta">
                    <div class="course-price">${convertPrice(course.priceUSD)}</div>
                    <div class="course-rating">⭐ ${course.rating}</div>
                </div>
                <button class="add-to-cart-btn" onclick="addToCart(${course.id})">Add to Cart</button>
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
    const input = document.querySelector('#studentSettingsSection input[type="text"]');
    if (input) {
        const displayName = input.value;
        localStorage.setItem('studentDisplayName', displayName);
        alert('Settings saved successfully!');
    }
}

function saveInstructorSettings() {
    alert('Instructor settings saved successfully!');
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

