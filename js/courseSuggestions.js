// Course Suggestions Based on Browsing History

// Load course suggestions for student dashboard
function loadCourseSuggestions() {
    const userSession = JSON.parse(localStorage.getItem('userSession') || '{}');
    if (!userSession.email || userSession.role !== 'student') {
        return;
    }
    
    // Get browsing history
    const browsingHistory = JSON.parse(localStorage.getItem('browsingHistory') || '[]');
    const studentBrowsing = browsingHistory.filter(item => item.userEmail === userSession.email);
    
    // Get enrolled courses
    const enrolledCourses = JSON.parse(localStorage.getItem('enrolledCourses') || '[]');
    const studentEnrolled = enrolledCourses.filter(c => c.studentEmail === userSession.email).map(c => c.courseId);
    
    // Get all courses
    const allCourses = typeof getAllCourses === 'function' ? getAllCourses() : [];
    
    // Analyze browsing history to get categories
    const categoryCounts = {};
    const subcategoryCounts = {};
    const instructorCounts = {};
    
    studentBrowsing.forEach(item => {
        const course = allCourses.find(c => c.id === item.courseId);
        if (course) {
            if (course.category) {
                categoryCounts[course.category] = (categoryCounts[course.category] || 0) + 1;
            }
            if (course.subcategory) {
                subcategoryCounts[course.subcategory] = (subcategoryCounts[course.subcategory] || 0) + 1;
            }
            if (course.instructor || course.instructorName) {
                const instructor = course.instructor || course.instructorName;
                instructorCounts[instructor] = (instructorCounts[instructor] || 0) + 1;
            }
        }
    });
    
    // Find top categories
    const topCategories = Object.entries(categoryCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 3)
        .map(entry => entry[0]);
    
    const topSubcategories = Object.entries(subcategoryCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 3)
        .map(entry => entry[0]);
    
    const topInstructors = Object.entries(instructorCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 2)
        .map(entry => entry[0]);
    
    // Get suggested courses
    let suggestedCourses = allCourses.filter(course => {
        // Don't suggest enrolled courses
        if (studentEnrolled.includes(course.id)) {
            return false;
        }
        
        // Check if course matches browsing interests
        const matchesCategory = topCategories.includes(course.category);
        const matchesSubcategory = topSubcategories.includes(course.subcategory);
        const matchesInstructor = topInstructors.includes(course.instructor || course.instructorName);
        
        return matchesCategory || matchesSubcategory || matchesInstructor;
    });
    
    // Remove duplicates and limit to 6 courses
    const uniqueCourses = [];
    const seenIds = new Set();
    for (const course of suggestedCourses) {
        if (!seenIds.has(course.id)) {
            seenIds.add(course.id);
            uniqueCourses.push(course);
            if (uniqueCourses.length >= 6) break;
        }
    }
    
    // If not enough suggestions, add popular courses
    if (uniqueCourses.length < 6) {
        const popularCourses = allCourses
            .filter(c => !studentEnrolled.includes(c.id) && !seenIds.has(c.id))
            .slice(0, 6 - uniqueCourses.length);
        uniqueCourses.push(...popularCourses);
    }
    
    // Display suggestions in dashboard
    displayCourseSuggestions(uniqueCourses);
}

// Display course suggestions
function displayCourseSuggestions(suggestedCourses) {
    // Check if suggestions section exists in dashboard
    let suggestionsContainer = document.getElementById('courseSuggestionsContainer');
    
    if (!suggestionsContainer) {
        // Create suggestions section in dashboard
        const dashboardSection = document.getElementById('studentDashboardSection');
        if (dashboardSection) {
            const existingContent = dashboardSection.querySelector('.content-card:last-child');
            
            const newCard = document.createElement('div');
            newCard.className = 'content-card';
            newCard.style.marginTop = '2rem';
            newCard.innerHTML = `
                <h2>📚 Suggested for You</h2>
                <p style="color: #718096; margin-bottom: 1rem;">Based on your browsing history</p>
                <div id="courseSuggestionsContainer" style="display: grid; grid-template-columns: repeat(auto-fill, minmax(250px, 1fr)); gap: 1.5rem;">
                    <!-- Suggestions will be loaded here -->
                </div>
            `;
            
            if (existingContent) {
                dashboardSection.insertBefore(newCard, existingContent.nextSibling);
            } else {
                dashboardSection.appendChild(newCard);
            }
            
            suggestionsContainer = document.getElementById('courseSuggestionsContainer');
        }
    }
    
    if (!suggestionsContainer || suggestedCourses.length === 0) {
        return;
    }
    
    suggestionsContainer.innerHTML = suggestedCourses.map(course => {
        const price = course.price || course.priceUSD || 0;
        const rating = course.rating || 0;
        const image = course.image || '<div style="width: 100%; height: 150px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); display: flex; align-items: center; justify-content: center; color: white; font-size: 3rem; border-radius: 8px;">📚</div>';
        
        return `
            <div class="course-card" style="border: 1px solid #E2E8F0; border-radius: 8px; overflow: hidden; transition: transform 0.2s, box-shadow 0.2s; cursor: pointer;" onmouseover="this.style.transform='translateY(-4px)'; this.style.boxShadow='0 8px 16px rgba(0,0,0,0.1)';" onmouseout="this.style.transform=''; this.style.boxShadow='';" onclick="viewCourse('${course.id}')">
                <div class="course-image" style="position: relative; width: 100%; height: 150px; overflow: hidden;">
                    ${image}
                </div>
                <div style="padding: 1rem;">
                    <h3 style="margin: 0 0 0.5rem 0; font-size: 1rem; color: #2D3748;">${course.title || 'Untitled Course'}</h3>
                    <p style="margin: 0 0 0.5rem 0; font-size: 0.85rem; color: #718096;">${course.instructorName || course.instructor || 'Unknown Instructor'}</p>
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 0.75rem;">
                        <span style="font-weight: 600; color: #4F7CFF;">$${price.toFixed(2)}</span>
                        <span style="font-size: 0.85rem; color: #718096;">⭐ ${rating.toFixed(1)}</span>
                    </div>
                    <button class="btn btn-primary" style="width: 100%; margin-top: 0.75rem;" onclick="event.stopPropagation(); addToCart('${course.id}')">Add to Cart</button>
                </div>
            </div>
        `;
    }).join('');
}

// Track course viewing for suggestions
function trackCourseView(courseId) {
    const userSession = JSON.parse(localStorage.getItem('userSession') || '{}');
    if (!userSession.email) return;
    
    let browsingHistory = JSON.parse(localStorage.getItem('browsingHistory') || '[]');
    
    // Remove existing entry for this course from this user
    browsingHistory = browsingHistory.filter(item => 
        !(item.courseId === courseId && item.userEmail === userSession.email)
    );
    
    // Add new entry
    browsingHistory.push({
        courseId: courseId,
        userEmail: userSession.email,
        viewedAt: new Date().toISOString()
    });
    
    // Keep only last 50 browsing entries per user
    const userHistory = browsingHistory.filter(item => item.userEmail === userSession.email)
        .sort((a, b) => new Date(b.viewedAt) - new Date(a.viewedAt))
        .slice(0, 50);
    
    browsingHistory = browsingHistory.filter(item => item.userEmail !== userSession.email);
    browsingHistory.push(...userHistory);
    
    localStorage.setItem('browsingHistory', JSON.stringify(browsingHistory));
}

// View course (wrapper to track viewing)
function viewCourse(courseId) {
    trackCourseView(courseId);
    
    // Scroll to course details or open course page
    const courseCard = document.querySelector(`[data-course-id="${courseId}"]`);
    if (courseCard) {
        courseCard.scrollIntoView({ behavior: 'smooth', block: 'center' });
        courseCard.style.outline = '2px solid #4F7CFF';
        courseCard.style.outlineOffset = '4px';
        setTimeout(() => {
            courseCard.style.outline = '';
            courseCard.style.outlineOffset = '';
        }, 2000);
    }
}

