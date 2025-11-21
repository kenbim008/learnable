// Student Course Management Functions

// Load enrolled courses with progress
function loadStudentEnrolledCourses() {
    const enrolledCoursesList = document.getElementById('enrolledCoursesList');
    if (!enrolledCoursesList) return;
    
    const userSession = JSON.parse(localStorage.getItem('userSession') || '{}');
    if (!userSession.email || userSession.role !== 'student') {
        enrolledCoursesList.innerHTML = '<p style="color: #718096; text-align: center; padding: 2rem;">Please log in as a student to view your enrolled courses.</p>';
        return;
    }
    
    // Get enrolled courses
    let enrolledCourses = JSON.parse(localStorage.getItem('enrolledCourses') || '[]');
    
    // Filter courses for this student
    enrolledCourses = enrolledCourses.filter(c => c.studentEmail === userSession.email);
    
    if (enrolledCourses.length === 0) {
        enrolledCoursesList.innerHTML = '<p style="color: #718096; text-align: center; padding: 2rem;">No enrolled courses yet. Browse courses to get started!</p>';
        return;
    }
    
    // Get all courses to get full details
    const allCourses = typeof getAllCourses === 'function' ? getAllCourses() : [];
    
    enrolledCoursesList.innerHTML = enrolledCourses.map(enrolled => {
        const course = allCourses.find(c => c.id === enrolled.courseId) || enrolled;
        const progress = enrolled.progress || 0;
        const isPlaying = enrolled.isPlaying || false;
        const lastWatched = enrolled.lastWatched || null;
        
        return `
            <div class="content-item" style="margin-bottom: 1.5rem; padding: 1.5rem; border: 1px solid #E2E8F0; border-radius: 8px;">
                <div style="display: flex; gap: 1.5rem; margin-bottom: 1rem;">
                    <div style="width: 200px; height: 150px; flex-shrink: 0; border-radius: 8px; overflow: hidden; background: #F7F9FC;">
                        ${course.coverImage && course.coverImage !== 'default' 
                            ? `<img src="${course.coverImage}" alt="${course.title}" style="width: 100%; height: 100%; object-fit: cover;">`
                            : '<div style="width: 100%; height: 100%; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); display: flex; align-items: center; justify-content: center; color: white; font-size: 3rem;">📚</div>'
                        }
                    </div>
                    <div style="flex: 1;">
                        <h3 style="margin-top: 0; margin-bottom: 0.5rem;">${course.title || 'Untitled Course'}</h3>
                        <p style="color: #718096; margin-bottom: 1rem;">Instructor: ${course.instructorName || course.instructor || 'Unknown'}</p>
                        
                        <!-- Progress Meter -->
                        <div style="margin-bottom: 1rem;">
                            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.5rem;">
                                <span style="font-weight: 600; color: #2D3748;">Progress</span>
                                <span style="color: #4F7CFF; font-weight: 600;">${progress}%</span>
                            </div>
                            <div style="width: 100%; height: 8px; background: #E2E8F0; border-radius: 4px; overflow: hidden;">
                                <div style="width: ${progress}%; height: 100%; background: linear-gradient(90deg, #4F7CFF 0%, #00D4A1 100%); transition: width 0.3s ease;"></div>
                            </div>
                        </div>
                        
                        ${lastWatched ? `<p style="font-size: 0.85rem; color: #718096; margin-bottom: 1rem;">Last watched: ${new Date(lastWatched).toLocaleDateString()}</p>` : ''}
                        
                        <!-- Control Buttons -->
                        <div style="display: flex; gap: 0.75rem; flex-wrap: wrap;">
                            <button class="btn btn-success" onclick="startCourse('${enrolled.courseId}')" style="${isPlaying ? 'display: none;' : ''}" id="startBtn-${enrolled.courseId}">
                                ▶ Start
                            </button>
                            <button class="btn btn-primary" onclick="pauseCourse('${enrolled.courseId}')" style="${isPlaying ? '' : 'display: none;'}" id="pauseBtn-${enrolled.courseId}">
                                ⏸ Pause
                            </button>
                            <button class="btn btn-outline" onclick="resumeCourse('${enrolled.courseId}')" style="${isPlaying && !enrolled.isPaused ? 'display: none;' : ''}" id="resumeBtn-${enrolled.courseId}">
                                ▶ Resume
                            </button>
                            <button class="btn btn-outline" onclick="stopCourse('${enrolled.courseId}')" style="${isPlaying ? '' : 'display: none;'}" id="stopBtn-${enrolled.courseId}">
                                ⏹ Stop
                            </button>
                            <button class="btn btn-outline" onclick="openCoursePlayer('${enrolled.courseId}')">
                                📖 Continue Learning
                            </button>
                            <button class="btn btn-outline" onclick="messageInstructorForCourse('${enrolled.courseId}')">
                                ✉️ Message Instructor
                            </button>
                            <button class="btn btn-outline" onclick="showCourseDiscussion('${enrolled.courseId}')">
                                💬 Discussions
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }).join('');
}

// Start course
function startCourse(courseId) {
    updateCoursePlayState(courseId, { isPlaying: true, isPaused: false });
    alert('Course started! Opening course player...');
    openCoursePlayer(courseId);
}

// Pause course
function pauseCourse(courseId) {
    updateCoursePlayState(courseId, { isPlaying: true, isPaused: true });
    document.getElementById(`startBtn-${courseId}`).style.display = 'none';
    document.getElementById(`pauseBtn-${courseId}`).style.display = 'none';
    document.getElementById(`resumeBtn-${courseId}`).style.display = 'inline-block';
    document.getElementById(`stopBtn-${courseId}`).style.display = 'inline-block';
}

// Resume course
function resumeCourse(courseId) {
    updateCoursePlayState(courseId, { isPlaying: true, isPaused: false });
    document.getElementById(`startBtn-${courseId}`).style.display = 'none';
    document.getElementById(`pauseBtn-${courseId}`).style.display = 'inline-block';
    document.getElementById(`resumeBtn-${courseId}`).style.display = 'none';
    document.getElementById(`stopBtn-${courseId}`).style.display = 'inline-block';
}

// Stop course
function stopCourse(courseId) {
    if (!confirm('Are you sure you want to stop? Your progress will be saved.')) {
        return;
    }
    updateCoursePlayState(courseId, { isPlaying: false, isPaused: false });
    document.getElementById(`startBtn-${courseId}`).style.display = 'inline-block';
    document.getElementById(`pauseBtn-${courseId}`).style.display = 'none';
    document.getElementById(`resumeBtn-${courseId}`).style.display = 'none';
    document.getElementById(`stopBtn-${courseId}`).style.display = 'none';
}

// Update course play state
function updateCoursePlayState(courseId, updates) {
    const userSession = JSON.parse(localStorage.getItem('userSession') || '{}');
    let enrolledCourses = JSON.parse(localStorage.getItem('enrolledCourses') || '[]');
    
    const enrolledIndex = enrolledCourses.findIndex(c => c.courseId === courseId && c.studentEmail === userSession.email);
    
    if (enrolledIndex !== -1) {
        enrolledCourses[enrolledIndex] = {
            ...enrolledCourses[enrolledIndex],
            ...updates,
            lastWatched: new Date().toISOString()
        };
        localStorage.setItem('enrolledCourses', JSON.stringify(enrolledCourses));
        loadStudentEnrolledCourses(); // Refresh display
    }
}

// Open course player
function openCoursePlayer(courseId) {
    const allCourses = typeof getAllCourses === 'function' ? getAllCourses() : [];
    const course = allCourses.find(c => c.id === courseId);
    
    if (!course) {
        alert('Course not found!');
        return;
    }
    
    // In a real implementation, this would open a full course player modal/page
    alert(`Opening course player for: ${course.title}\n\nThis would open the course player where you can watch videos, track progress, and access course materials.`);
    
    // Update last watched
    const userSession = JSON.parse(localStorage.getItem('userSession') || '{}');
    let enrolledCourses = JSON.parse(localStorage.getItem('enrolledCourses') || '[]');
    const enrolledIndex = enrolledCourses.findIndex(c => c.courseId === courseId && c.studentEmail === userSession.email);
    
    if (enrolledIndex !== -1) {
        enrolledCourses[enrolledIndex].lastWatched = new Date().toISOString();
        localStorage.setItem('enrolledCourses', JSON.stringify(enrolledCourses));
    }
}

// Message instructor for specific course
function messageInstructorForCourse(courseId) {
    const userSession = JSON.parse(localStorage.getItem('userSession') || '{}');
    const enrolledCourses = JSON.parse(localStorage.getItem('enrolledCourses') || '[]');
    
    // Check if student is enrolled
    const enrolled = enrolledCourses.find(c => c.courseId === courseId && c.studentEmail === userSession.email);
    if (!enrolled) {
        alert('You must be enrolled in this course to message the instructor.');
        return;
    }
    
    // Get course details
    const allCourses = typeof getAllCourses === 'function' ? getAllCourses() : [];
    const course = allCourses.find(c => c.id === courseId);
    
    if (!course) {
        alert('Course not found!');
        return;
    }
    
    // Open messages section and create new message for this course
    if (typeof showStudentSection === 'function') {
        showStudentSection('messages', null);
    }
    
    // Store the course context for messaging
    sessionStorage.setItem('messageCourseId', courseId);
    sessionStorage.setItem('messageInstructor', course.instructorName || course.instructor);
    
    // Trigger message creation modal
    setTimeout(() => {
        createMessageToInstructor(courseId, course.instructorName || course.instructor);
    }, 300);
}

// Create message to instructor
function createMessageToInstructor(courseId, instructorName) {
    const userSession = JSON.parse(localStorage.getItem('userSession') || '{}');
    
    // Create message modal
    const modal = document.createElement('div');
    modal.className = 'modal active';
    modal.style.zIndex = '10000';
    modal.innerHTML = `
        <div class="modal-content" style="max-width: 600px;">
            <button class="modal-close" onclick="this.closest('.modal').remove()">×</button>
            <h2>Message Instructor</h2>
            <p style="color: #718096; margin-bottom: 1.5rem;">Sending message to ${instructorName} about this course</p>
            <form onsubmit="sendMessageToInstructor(event, '${courseId}', '${instructorName}')">
                <div class="form-group">
                    <label>Subject</label>
                    <input type="text" id="messageSubject" placeholder="Course question..." required style="width: 100%; padding: 0.75rem; border: 1px solid #E2E8F0; border-radius: 6px;">
                </div>
                <div class="form-group">
                    <label>Message</label>
                    <textarea id="messageContent" rows="6" placeholder="Type your message here..." required style="width: 100%; padding: 0.75rem; border: 1px solid #E2E8F0; border-radius: 6px;"></textarea>
                </div>
                <button type="submit" class="btn btn-success" style="width: 100%;">Send Message</button>
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

// Send message to instructor
function sendMessageToInstructor(event, courseId, instructorName) {
    event.preventDefault();
    
    const userSession = JSON.parse(localStorage.getItem('userSession') || '{}');
    const subject = document.getElementById('messageSubject').value;
    const content = document.getElementById('messageContent').value;
    
    // Get course details
    const allCourses = typeof getAllCourses === 'function' ? getAllCourses() : [];
    const course = allCourses.find(c => c.id === courseId);
    const instructorEmail = course?.instructorEmail || course?.instructor || '';
    
    // Save message
    let messages = JSON.parse(localStorage.getItem('studentMessages') || '[]');
    const newMessage = {
        id: 'msg-' + Date.now(),
        studentEmail: userSession.email,
        studentName: userSession.name || userSession.email,
        instructorEmail: instructorEmail,
        instructorName: instructorName,
        courseId: courseId,
        courseTitle: course?.title || 'Unknown Course',
        subject: subject,
        content: content,
        timestamp: new Date().toISOString(),
        read: false,
        type: 'student-to-instructor'
    };
    
    messages.push(newMessage);
    localStorage.setItem('studentMessages', JSON.stringify(messages));
    
    // Also save to instructor's messages
    let instructorMessages = JSON.parse(localStorage.getItem('instructorMessages') || '[]');
    instructorMessages.push({
        ...newMessage,
        type: 'student-to-instructor'
    });
    localStorage.setItem('instructorMessages', JSON.stringify(instructorMessages));
    
    alert('Message sent successfully!');
    
    // Close modal
    const modal = document.querySelector('.modal.active');
    if (modal) modal.remove();
    
    // Refresh messages if on messages page
    if (typeof loadStudentMessages === 'function') {
        loadStudentMessages();
    }
}

// Show course discussion/study groups
function showCourseDiscussion(courseId) {
    const userSession = JSON.parse(localStorage.getItem('userSession') || '{}');
    const enrolledCourses = JSON.parse(localStorage.getItem('enrolledCourses') || '[]');
    
    // Check if student is enrolled
    const enrolled = enrolledCourses.find(c => c.courseId === courseId && c.studentEmail === userSession.email);
    if (!enrolled) {
        alert('You must be enrolled in this course to access discussions.');
        return;
    }
    
    // Get course details
    const allCourses = typeof getAllCourses === 'function' ? getAllCourses() : [];
    const course = allCourses.find(c => c.id === courseId);
    
    // Open discussion modal
    const modal = document.createElement('div');
    modal.className = 'modal active';
    modal.style.zIndex = '10000';
    modal.innerHTML = `
        <div class="modal-content" style="max-width: 800px; max-height: 90vh; overflow-y: auto;">
            <button class="modal-close" onclick="this.closest('.modal').remove()">×</button>
            <h2>${course?.title || 'Course'} - Discussions & Study Groups</h2>
            
            <div style="display: flex; gap: 1rem; margin-bottom: 1.5rem;">
                <button class="btn btn-success" onclick="createStudyGroup('${courseId}')">+ Create Study Group</button>
                <button class="btn btn-primary" onclick="createDiscussionTopic('${courseId}')">+ New Discussion Topic</button>
            </div>
            
            <div id="courseDiscussionsList-${courseId}" style="display: flex; flex-direction: column; gap: 1rem;">
                <!-- Discussions will be loaded here -->
            </div>
        </div>
    `;
    document.body.appendChild(modal);
    
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.remove();
        }
    });
    
    // Load discussions
    loadCourseDiscussions(courseId);
}

// Load course discussions
function loadCourseDiscussions(courseId) {
    const discussionsList = document.getElementById(`courseDiscussionsList-${courseId}`);
    if (!discussionsList) return;
    
    let discussions = JSON.parse(localStorage.getItem('courseDiscussions') || '[]');
    const courseDiscussions = discussions.filter(d => d.courseId === courseId);
    
    if (courseDiscussions.length === 0) {
        discussionsList.innerHTML = '<p style="color: #718096; text-align: center; padding: 2rem;">No discussions yet. Start the conversation!</p>';
        return;
    }
    
    // Sort by date (newest first)
    courseDiscussions.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    
    discussionsList.innerHTML = courseDiscussions.map(discussion => {
        const isStudyGroup = discussion.type === 'study-group';
        return `
            <div class="content-item" style="padding: 1rem; border: 1px solid #E2E8F0; border-radius: 8px;">
                <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 0.5rem;">
                    <div style="flex: 1;">
                        <h3 style="margin: 0; margin-bottom: 0.25rem;">
                            ${isStudyGroup ? '👥' : '💬'} ${discussion.title}
                            ${isStudyGroup ? '<span style="background: #10B981; color: white; padding: 0.25rem 0.5rem; border-radius: 4px; font-size: 0.75rem; margin-left: 0.5rem;">Study Group</span>' : ''}
                        </h3>
                        <p style="color: #718096; font-size: 0.9rem; margin-bottom: 0.5rem;">By ${discussion.createdBy} • ${new Date(discussion.createdAt).toLocaleDateString()}</p>
                        <p style="color: #4A5568; margin-bottom: 0.5rem;">${discussion.content}</p>
                        <p style="color: #718096; font-size: 0.85rem;">${discussion.replies || 0} replies</p>
                    </div>
                    <button class="btn btn-outline" onclick="viewDiscussion('${discussion.id}')">View</button>
                </div>
            </div>
        `;
    }).join('');
}

// Create study group
function createStudyGroup(courseId) {
    const userSession = JSON.parse(localStorage.getItem('userSession') || '{}');
    
    const modal = document.createElement('div');
    modal.className = 'modal active';
    modal.style.zIndex = '10001';
    modal.innerHTML = `
        <div class="modal-content" style="max-width: 500px;">
            <button class="modal-close" onclick="this.closest('.modal').remove()">×</button>
            <h2>Create Study Group</h2>
            <form onsubmit="saveStudyGroup(event, '${courseId}')">
                <div class="form-group">
                    <label>Group Name</label>
                    <input type="text" id="studyGroupName" placeholder="e.g., JavaScript Study Group" required style="width: 100%; padding: 0.75rem; border: 1px solid #E2E8F0; border-radius: 6px;">
                </div>
                <div class="form-group">
                    <label>Description</label>
                    <textarea id="studyGroupDescription" rows="4" placeholder="Describe your study group..." required style="width: 100%; padding: 0.75rem; border: 1px solid #E2E8F0; border-radius: 6px;"></textarea>
                </div>
                <button type="submit" class="btn btn-success" style="width: 100%;">Create Study Group</button>
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

// Save study group
function saveStudyGroup(event, courseId) {
    event.preventDefault();
    
    const userSession = JSON.parse(localStorage.getItem('userSession') || '{}');
    const title = document.getElementById('studyGroupName').value;
    const content = document.getElementById('studyGroupDescription').value;
    
    let discussions = JSON.parse(localStorage.getItem('courseDiscussions') || '[]');
    const newDiscussion = {
        id: 'disc-' + Date.now(),
        courseId: courseId,
        type: 'study-group',
        title: title,
        content: content,
        createdBy: userSession.name || userSession.email,
        createdAt: new Date().toISOString(),
        replies: 0
    };
    
    discussions.push(newDiscussion);
    localStorage.setItem('courseDiscussions', JSON.stringify(discussions));
    
    alert('Study group created successfully!');
    
    // Close modal
    const modal = document.querySelector('.modal.active');
    if (modal) modal.remove();
    
    // Reload discussions
    loadCourseDiscussions(courseId);
}

// Create discussion topic
function createDiscussionTopic(courseId) {
    const userSession = JSON.parse(localStorage.getItem('userSession') || '{}');
    
    const modal = document.createElement('div');
    modal.className = 'modal active';
    modal.style.zIndex = '10001';
    modal.innerHTML = `
        <div class="modal-content" style="max-width: 500px;">
            <button class="modal-close" onclick="this.closest('.modal').remove()">×</button>
            <h2>Create Discussion Topic</h2>
            <form onsubmit="saveDiscussionTopic(event, '${courseId}')">
                <div class="form-group">
                    <label>Topic Title</label>
                    <input type="text" id="discussionTitle" placeholder="Enter topic title..." required style="width: 100%; padding: 0.75rem; border: 1px solid #E2E8F0; border-radius: 6px;">
                </div>
                <div class="form-group">
                    <label>Content</label>
                    <textarea id="discussionContent" rows="4" placeholder="Share your thoughts..." required style="width: 100%; padding: 0.75rem; border: 1px solid #E2E8F0; border-radius: 6px;"></textarea>
                </div>
                <button type="submit" class="btn btn-success" style="width: 100%;">Create Topic</button>
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

// Save discussion topic
function saveDiscussionTopic(event, courseId) {
    event.preventDefault();
    
    const userSession = JSON.parse(localStorage.getItem('userSession') || '{}');
    const title = document.getElementById('discussionTitle').value;
    const content = document.getElementById('discussionContent').value;
    
    let discussions = JSON.parse(localStorage.getItem('courseDiscussions') || '[]');
    const newDiscussion = {
        id: 'disc-' + Date.now(),
        courseId: courseId,
        type: 'discussion',
        title: title,
        content: content,
        createdBy: userSession.name || userSession.email,
        createdAt: new Date().toISOString(),
        replies: 0
    };
    
    discussions.push(newDiscussion);
    localStorage.setItem('courseDiscussions', JSON.stringify(discussions));
    
    alert('Discussion topic created successfully!');
    
    // Close modal
    const modal = document.querySelector('.modal.active');
    if (modal) modal.remove();
    
    // Reload discussions
    loadCourseDiscussions(courseId);
}

// View discussion
function viewDiscussion(discussionId) {
    alert('Opening discussion thread...\n\nIn a full implementation, this would open a detailed discussion view with replies and the ability to respond.');
}

