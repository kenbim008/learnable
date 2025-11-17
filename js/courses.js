// Load courses
function loadCourses() {
    const grid = document.getElementById('coursesGrid');
    if (!grid) return;
    
    grid.innerHTML = courses.map(course => `
        <div class="course-card">
            <div class="course-image" style="position: relative;">
                ${course.image}
                ${course.hasPreview ? '<div class="preview-badge">▶ Preview</div>' : ''}
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

// Add to cart
function addToCart(courseId) {
    const course = courses.find(c => c.id === courseId);
    if (!cart.find(c => c.id === courseId)) {
        cart.push(course);
        updateCart();
        alert(`${course.title} added to cart!`);
    } else {
        alert('Course already in cart!');
    }
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

