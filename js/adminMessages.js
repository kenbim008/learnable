// Admin and Super Admin Messages Functions

// Load admin messages
function loadAdminMessages() {
    const userSession = JSON.parse(localStorage.getItem('userSession') || '{}');
    if (userSession.role !== 'admin' && userSession.role !== 'superadmin') {
        return;
    }
    
    // Get all messages (admins can see all messages)
    let allMessages = [];
    
    // Get instructor messages
    const instructorMessages = JSON.parse(localStorage.getItem('instructorMessages') || '[]');
    allMessages = allMessages.concat(instructorMessages);
    
    // Get student messages
    const studentMessages = JSON.parse(localStorage.getItem('studentMessages') || '[]');
    allMessages = allMessages.concat(studentMessages);
    
    // Remove duplicates (same message might be in both)
    const uniqueMessages = [];
    const seenIds = new Set();
    allMessages.forEach(msg => {
        if (!seenIds.has(msg.id)) {
            seenIds.add(msg.id);
            uniqueMessages.push(msg);
        }
    });
    
    // Sort by date (newest first)
    uniqueMessages.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    
    // Update messages display based on role
    if (userSession.role === 'admin') {
        updateAdminMessagesDisplay(uniqueMessages);
    } else if (userSession.role === 'superadmin') {
        updateSuperAdminMessagesDisplay(uniqueMessages);
    }
}

// Update admin messages display
function updateAdminMessagesDisplay(messages) {
    const messagesSection = document.getElementById('adminMessagesSection');
    if (!messagesSection) return;
    
    const messagesList = messagesSection.querySelector('.content-list');
    if (!messagesList) return;
    
    if (messages.length === 0) {
        messagesList.innerHTML = '<p style="color: #718096; text-align: center; padding: 2rem;">No messages yet.</p>';
        return;
    }
    
    const allCourses = getAllCoursesHelper();
    
    messagesList.innerHTML = messages.slice(0, 20).map(msg => {
        const isRead = msg.read ? '' : 'style="background: #F0F4FF; border-left: 4px solid #4F7CFF;"';
        const course = allCourses.find(c => c.id === msg.courseId);
        const messageType = msg.type === 'student-to-instructor' ? 'Student to Instructor' : 
                           msg.type === 'instructor-to-student' ? 'Instructor to Student' : 'Message';
        
        return `
            <div class="content-item" ${isRead}>
                <div>
                    <h3>${msg.subject || 'No Subject'}</h3>
                    <p style="color: #718096; margin-bottom: 0.25rem;">
                        ${messageType} • From: ${msg.studentName || msg.instructorName || msg.studentEmail || msg.instructorEmail || 'Unknown'} • 
                        Course: ${course?.title || msg.courseTitle || 'Unknown Course'}
                    </p>
                    <p style="color: #4A5568; margin-bottom: 0.5rem;">${msg.content.substring(0, 100)}${msg.content.length > 100 ? '...' : ''}</p>
                    <p style="font-size: 0.85rem; color: #718096;">${new Date(msg.timestamp).toLocaleString()}</p>
                </div>
                <button class="btn btn-outline" onclick="viewAdminMessage('${msg.id}')">View</button>
            </div>
        `;
    }).join('');
}

// Update super admin messages display
function updateSuperAdminMessagesDisplay(messages) {
    const messagesSection = document.getElementById('superAdminMessagesSection');
    if (!messagesSection) {
        // Create messages section if it doesn't exist
        const superAdminDashboard = document.getElementById('superAdminDashboard');
        if (superAdminDashboard) {
            // Messages section should be in the sidebar
            // For now, we'll just log that it doesn't exist
            console.log('Super Admin messages section not found');
        }
        return;
    }
    
    // Similar to admin messages
    updateAdminMessagesDisplay(messages);
}

// View admin message
function viewAdminMessage(messageId) {
    let allMessages = [];
    
    const instructorMessages = JSON.parse(localStorage.getItem('instructorMessages') || '[]');
    const studentMessages = JSON.parse(localStorage.getItem('studentMessages') || '[]');
    allMessages = allMessages.concat(instructorMessages).concat(studentMessages);
    
    const message = allMessages.find(m => m.id === messageId);
    
    if (!message) {
        alert('Message not found!');
        return;
    }
    
    // Mark as read
    message.read = true;
    
    if (instructorMessages.find(m => m.id === messageId)) {
        const msgIndex = instructorMessages.findIndex(m => m.id === messageId);
        instructorMessages[msgIndex] = message;
        localStorage.setItem('instructorMessages', JSON.stringify(instructorMessages));
    }
    
    if (studentMessages.find(m => m.id === messageId)) {
        const msgIndex = studentMessages.findIndex(m => m.id === messageId);
        studentMessages[msgIndex] = message;
        localStorage.setItem('studentMessages', JSON.stringify(studentMessages));
    }
    
    // Get course details
    const allCourses = getAllCoursesHelper();
    const course = allCourses.find(c => c.id === message.courseId);
    
    const messageType = message.type === 'student-to-instructor' ? 'Student to Instructor' : 
                       message.type === 'instructor-to-student' ? 'Instructor to Student' : 'Message';
    
    const fromName = message.studentName || message.instructorName || message.studentEmail || message.instructorEmail || 'Unknown';
    
    // Show message modal
    const modal = document.createElement('div');
    modal.className = 'modal active';
    modal.style.zIndex = '10000';
    modal.innerHTML = `
        <div class="modal-content" style="max-width: 600px;">
            <button class="modal-close" onclick="this.closest('.modal').remove(); loadAdminMessages();">×</button>
            <h2>${message.subject || 'No Subject'}</h2>
            <div style="margin-bottom: 1rem; padding: 1rem; background: #F7F9FC; border-radius: 6px;">
                <p style="margin: 0.25rem 0;"><strong>Type:</strong> ${messageType}</p>
                <p style="margin: 0.25rem 0;"><strong>From:</strong> ${fromName}</p>
                <p style="margin: 0.25rem 0;"><strong>Course:</strong> ${course?.title || message.courseTitle || 'Unknown Course'}</p>
                <p style="margin: 0.25rem 0;"><strong>Date:</strong> ${new Date(message.timestamp).toLocaleString()}</p>
            </div>
            <div style="padding: 1rem; background: #F7F9FC; border-radius: 6px; white-space: pre-wrap; color: #2D3748;">
                ${message.content}
            </div>
        </div>
    `;
    document.body.appendChild(modal);
    
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.remove();
            loadAdminMessages();
        }
    });
}

// Helper function to get all courses (same as in instructorDashboard.js)
function getAllCoursesHelper() {
    if (typeof getAllCourses === 'function') {
        return getAllCourses();
    }
    
    // Fallback: get courses from localStorage
    const approvedCourses = JSON.parse(localStorage.getItem('courses') || '[]')
        .filter(c => c.status === 'approved');
    return approvedCourses;
}

