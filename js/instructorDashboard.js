// Instructor Dashboard Functions

// Load instructor revenue data
function loadInstructorRevenue() {
    const revenueSection = document.getElementById('instructorRevenueSection');
    if (!revenueSection) return;
    
    const userSession = JSON.parse(localStorage.getItem('userSession') || '{}');
    if (!userSession.email || userSession.role !== 'instructor') {
        return;
    }
    
    // Get revenue share percentage (default 60% for instructor, 40% for platform)
    const platformSettings = JSON.parse(localStorage.getItem('platformSettings') || '{}');
    const instructorRevenueShare = platformSettings.instructorRevenueShare || 60;
    const platformRevenueShare = 100 - instructorRevenueShare;
    
    // Get all payments
    const payments = JSON.parse(localStorage.getItem('payments') || '[]');
    
    // Get instructor's courses
    const allCourses = getAllCoursesHelper();
    const instructorCourses = allCourses.filter(c => 
        (c.instructor === userSession.email || c.instructorEmail === userSession.email) && 
        c.status === 'approved'
    ).map(c => c.id);
    
    // Calculate revenue from payments that include instructor's courses
    let totalGrossRevenue = 0;
    let totalInstructorShare = 0;
    let totalPlatformShare = 0;
    const recentSales = [];
    
    payments.forEach(payment => {
        payment.courses.forEach(coursePayment => {
            if (instructorCourses.includes(coursePayment.id)) {
                const coursePrice = coursePayment.price || 0;
                totalGrossRevenue += coursePrice;
                
                const instructorShare = coursePrice * (instructorRevenueShare / 100);
                const platformShare = coursePrice * (platformRevenueShare / 100);
                
                totalInstructorShare += instructorShare;
                totalPlatformShare += platformShare;
                
                // Add to recent sales
                recentSales.push({
                    courseTitle: coursePayment.title || coursePayment.id,
                    studentEmail: payment.email,
                    amount: coursePrice,
                    instructorShare: instructorShare,
                    platformShare: platformShare,
                    date: payment.date,
                    paymentId: payment.id
                });
            }
        });
    });
    
    // Sort recent sales by date (newest first)
    recentSales.sort((a, b) => new Date(b.date) - new Date(a.date));
    
    // Get pending payout (last 30 days that haven't been paid out yet)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const pendingSales = recentSales.filter(sale => new Date(sale.date) >= thirtyDaysAgo);
    const pendingPayout = pendingSales.reduce((sum, sale) => sum + sale.instructorShare, 0);
    
    // Update revenue stats
    const statValues = revenueSection.querySelectorAll('.stat-value');
    if (statValues.length >= 4) {
        statValues[0].textContent = `$${totalGrossRevenue.toFixed(2)}`;
        statValues[1].textContent = `$${totalInstructorShare.toFixed(2)}`;
        statValues[2].textContent = `$${totalPlatformShare.toFixed(2)}`;
        statValues[3].textContent = `$${pendingPayout.toFixed(2)}`;
    }
    
    // Update recent sales list
    const salesList = revenueSection.querySelector('.content-list');
    if (salesList) {
        if (recentSales.length === 0) {
            salesList.innerHTML = '<p style="color: #718096; text-align: center; padding: 2rem;">No sales yet. Promote your courses to start earning!</p>';
        } else {
            salesList.innerHTML = recentSales.slice(0, 10).map(sale => `
                <div class="content-item">
                    <div>
                        <h3>${sale.courseTitle}</h3>
                        <p>Sold to: ${sale.studentEmail} • Gross Amount: $${sale.amount.toFixed(2)} • Your Share (${instructorRevenueShare}%): $${sale.instructorShare.toFixed(2)}</p>
                        <p style="font-size: 0.85rem; color: #718096; margin-top: 0.25rem;">Date: ${new Date(sale.date).toLocaleDateString()}</p>
                    </div>
                    <button class="btn btn-outline" onclick="viewSaleDetails('${sale.paymentId}')">View Details</button>
                </div>
            `).join('');
        }
    }
}

// Load instructor analytics
function loadInstructorAnalytics() {
    const analyticsSection = document.getElementById('instructorAnalyticsSection');
    if (!analyticsSection) return;
    
    const userSession = JSON.parse(localStorage.getItem('userSession') || '{}');
    if (!userSession.email || userSession.role !== 'instructor') {
        return;
    }
    
    // Get instructor's courses
    const allCourses = getAllCoursesHelper();
    const instructorCourses = allCourses.filter(c => 
        (c.instructor === userSession.email || c.instructorEmail === userSession.email) && 
        c.status === 'approved'
    );
    
    // Get enrolled courses
    const enrolledCourses = JSON.parse(localStorage.getItem('enrolledCourses') || '[]');
    
    // Calculate metrics
    let totalStudents = 0;
    let activeCourses = instructorCourses.length;
    let totalRating = 0;
    let ratingCount = 0;
    let totalCompletion = 0;
    let completionCount = 0;
    
    // Count students per course
    const courseStats = {};
    instructorCourses.forEach(course => {
        const enrollments = enrolledCourses.filter(e => e.courseId === course.id);
        const studentCount = enrollments.length;
        totalStudents += studentCount;
        
        courseStats[course.id] = {
            title: course.title || 'Untitled Course',
            students: studentCount,
            rating: course.rating || 0,
            completionRate: course.completionRate || 0
        };
        
        if (course.rating) {
            totalRating += course.rating;
            ratingCount++;
        }
        
        if (course.completionRate) {
            totalCompletion += course.completionRate;
            completionCount++;
        }
    });
    
    const averageRating = ratingCount > 0 ? totalRating / ratingCount : 0;
    const averageCompletionRate = completionCount > 0 ? totalCompletion / completionCount : 0;
    
    // Update stats
    const statValues = analyticsSection.querySelectorAll('.stat-value');
    if (statValues.length >= 4) {
        statValues[0].textContent = totalStudents;
        statValues[1].textContent = activeCourses;
        statValues[2].textContent = averageRating.toFixed(1);
        statValues[3].textContent = `${averageCompletionRate.toFixed(0)}%`;
    }
    
    // Update course performance list
    const performanceList = analyticsSection.querySelector('.content-list');
    if (performanceList) {
        const coursePerformance = Object.values(courseStats)
            .sort((a, b) => b.students - a.students)
            .slice(0, 10);
        
        if (coursePerformance.length === 0) {
            performanceList.innerHTML = '<p style="color: #718096; text-align: center; padding: 2rem;">No course data available yet.</p>';
        } else {
            performanceList.innerHTML = coursePerformance.map(course => {
                // Calculate revenue for this course
                const payments = JSON.parse(localStorage.getItem('payments') || '[]');
                let courseRevenue = 0;
                payments.forEach(payment => {
                    payment.courses.forEach(cp => {
                        if (cp.id === Object.keys(courseStats).find(cid => courseStats[cid].title === course.title)) {
                            courseRevenue += cp.price || 0;
                        }
                    });
                });
                
                return `
                    <div class="content-item">
                        <div>
                            <h3>${course.title}</h3>
                            <p>${course.students} students • $${courseRevenue.toFixed(2)} revenue • ${course.rating.toFixed(1)}★ rating • ${course.completionRate.toFixed(0)}% completion rate</p>
                        </div>
                        <button class="btn btn-outline" onclick="viewCourseAnalytics('${Object.keys(courseStats).find(cid => courseStats[cid].title === course.title)}')">View Details</button>
                    </div>
                `;
            }).join('');
        }
    }
}

// Load instructor reviews
function loadInstructorReviews() {
    const reviewsSection = document.getElementById('instructorReviewsSection');
    if (!reviewsSection) return;
    
    const userSession = JSON.parse(localStorage.getItem('userSession') || '{}');
    if (!userSession.email || userSession.role !== 'instructor') {
        return;
    }
    
    // Get instructor's courses
    const allCourses = getAllCoursesHelper();
    const instructorCourses = allCourses.filter(c => 
        (c.instructor === userSession.email || c.instructorEmail === userSession.email) && 
        c.status === 'approved'
    ).map(c => c.id);
    
    // Get reviews
    let reviews = JSON.parse(localStorage.getItem('courseReviews') || '[]');
    const instructorReviews = reviews.filter(r => instructorCourses.includes(r.courseId));
    
    // Sort by date (newest first)
    instructorReviews.sort((a, b) => new Date(b.date) - new Date(a.date));
    
    // Update reviews list
    const reviewsList = reviewsSection.querySelector('.content-list');
    if (reviewsList) {
        if (instructorReviews.length === 0) {
            reviewsList.innerHTML = '<p style="color: #718096; text-align: center; padding: 2rem;">No reviews yet. Encourage your students to leave reviews!</p>';
        } else {
            reviewsList.innerHTML = instructorReviews.map(review => {
                const stars = '⭐'.repeat(review.rating || 5);
                const course = allCourses.find(c => c.id === review.courseId);
                return `
                    <div class="content-item">
                        <div>
                            <h3>${review.studentName || review.studentEmail} ${stars}</h3>
                            <p>"${review.comment || 'No comment'}"</p>
                            <p style="font-size: 0.85rem; color: #718096; margin-top: 0.25rem;">
                                Course: ${course?.title || 'Unknown Course'} • ${new Date(review.date).toLocaleDateString()}
                            </p>
                            ${review.instructorReply ? `
                                <div style="margin-top: 0.75rem; padding: 0.75rem; background: #F7F9FC; border-radius: 6px; border-left: 3px solid #4F7CFF;">
                                    <strong>Your reply:</strong> ${review.instructorReply}
                                </div>
                            ` : ''}
                        </div>
                        ${!review.instructorReply ? `
                            <button class="btn btn-outline" onclick="replyToReview('${review.id}')">Reply</button>
                        ` : `
                            <button class="btn btn-outline" onclick="editReviewReply('${review.id}')">Edit Reply</button>
                        `}
                    </div>
                `;
            }).join('');
        }
    }
}

// Load instructor messages
function loadInstructorMessages() {
    const messagesSection = document.getElementById('instructorMessagesSection');
    if (!messagesSection) return;
    
    const userSession = JSON.parse(localStorage.getItem('userSession') || '{}');
    if (!userSession.email || userSession.role !== 'instructor') {
        return;
    }
    
    // Get instructor's courses
    const allCourses = getAllCoursesHelper();
    const instructorCourses = allCourses.filter(c => 
        (c.instructor === userSession.email || c.instructorEmail === userSession.email) && 
        c.status === 'approved'
    ).map(c => c.id);
    
    // Get messages sent by students for purchased courses
    let messages = JSON.parse(localStorage.getItem('instructorMessages') || '[]');
    
    // Filter messages to only those for instructor's courses and from students who purchased
    const instructorMessages = messages.filter(msg => {
        // Check if message is for one of instructor's courses
        if (!instructorCourses.includes(msg.courseId)) {
            return false;
        }
        
        // Check if student purchased the course
        const enrolledCourses = JSON.parse(localStorage.getItem('enrolledCourses') || '[]');
        const studentPurchased = enrolledCourses.some(e => 
            e.courseId === msg.courseId && e.studentEmail === msg.studentEmail
        );
        
        return studentPurchased;
    });
    
    // Sort by date (newest first)
    instructorMessages.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    
    // Update messages list
    const messagesList = messagesSection.querySelector('.content-list');
    if (messagesList) {
        if (instructorMessages.length === 0) {
            messagesList.innerHTML = '<p style="color: #718096; text-align: center; padding: 2rem;">No messages yet. Your students will message you about their purchased courses here!</p>';
        } else {
            messagesList.innerHTML = instructorMessages.map(msg => {
                const isRead = msg.read ? '' : 'style="background: #F0F4FF; border-left: 4px solid #4F7CFF;"';
                const course = allCourses.find(c => c.id === msg.courseId);
                return `
                    <div class="content-item" ${isRead}>
                        <div>
                            <h3>${msg.subject || 'No Subject'}</h3>
                            <p style="color: #718096; margin-bottom: 0.25rem;">From: ${msg.studentName || msg.studentEmail} • Course: ${course?.title || msg.courseTitle || 'Unknown Course'}</p>
                            <p style="color: #4A5568; margin-bottom: 0.5rem;">${msg.content.substring(0, 100)}${msg.content.length > 100 ? '...' : ''}</p>
                            <p style="font-size: 0.85rem; color: #718096;">${new Date(msg.timestamp).toLocaleString()}</p>
                        </div>
                        <button class="btn btn-outline" onclick="viewInstructorMessage('${msg.id}')">View</button>
                    </div>
                `;
            }).join('');
        }
    }
}

// View instructor message
function viewInstructorMessage(messageId) {
    let messages = JSON.parse(localStorage.getItem('instructorMessages') || '[]');
    const message = messages.find(m => m.id === messageId);
    
    if (!message) {
        alert('Message not found!');
        return;
    }
    
    // Mark as read
    message.read = true;
    const msgIndex = messages.findIndex(m => m.id === messageId);
    messages[msgIndex] = message;
    localStorage.setItem('instructorMessages', JSON.stringify(messages));
    
    // Also update in student messages
    let studentMessages = JSON.parse(localStorage.getItem('studentMessages') || '[]');
    const studentMsg = studentMessages.find(m => m.id === messageId);
    if (studentMsg) {
        studentMsg.read = true;
        const studentMsgIndex = studentMessages.findIndex(m => m.id === messageId);
        studentMessages[studentMsgIndex] = studentMsg;
        localStorage.setItem('studentMessages', JSON.stringify(studentMessages));
    }
    
    // Get course details
    const allCourses = typeof getAllCourses === 'function' ? getAllCourses() : [];
    const course = allCourses.find(c => c.id === message.courseId);
    
    // Show message modal
    const modal = document.createElement('div');
    modal.className = 'modal active';
    modal.style.zIndex = '10000';
    modal.innerHTML = `
        <div class="modal-content" style="max-width: 600px;">
            <button class="modal-close" onclick="this.closest('.modal').remove(); loadInstructorMessages();">×</button>
            <h2>${message.subject || 'No Subject'}</h2>
            <div style="margin-bottom: 1rem; padding: 1rem; background: #F7F9FC; border-radius: 6px;">
                <p style="margin: 0.25rem 0;"><strong>From:</strong> ${message.studentName || message.studentEmail}</p>
                <p style="margin: 0.25rem 0;"><strong>Course:</strong> ${course?.title || message.courseTitle || 'Unknown Course'}</p>
                <p style="margin: 0.25rem 0;"><strong>Date:</strong> ${new Date(message.timestamp).toLocaleString()}</p>
            </div>
            <div style="padding: 1rem; background: #F7F9FC; border-radius: 6px; white-space: pre-wrap; color: #2D3748; margin-bottom: 1rem;">
                ${message.content}
            </div>
            <form onsubmit="replyToInstructorMessage(event, '${messageId}', '${message.studentEmail}', '${message.studentName || message.studentEmail}')">
                <div class="form-group">
                    <label>Reply</label>
                    <textarea id="instructorReplyContent" rows="4" placeholder="Type your reply..." required style="width: 100%; padding: 0.75rem; border: 1px solid #E2E8F0; border-radius: 6px;"></textarea>
                </div>
                <button type="submit" class="btn btn-success" style="width: 100%;">Send Reply</button>
            </form>
        </div>
    `;
    document.body.appendChild(modal);
    
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.remove();
            loadInstructorMessages();
        }
    });
}

// Reply to instructor message
function replyToInstructorMessage(event, messageId, studentEmail, studentName) {
    event.preventDefault();
    
    const userSession = JSON.parse(localStorage.getItem('userSession') || '{}');
    const replyContent = document.getElementById('instructorReplyContent').value;
    
    if (!replyContent.trim()) {
        alert('Please enter a reply message!');
        return;
    }
    
    // Get original message
    let messages = JSON.parse(localStorage.getItem('instructorMessages') || '[]');
    const originalMessage = messages.find(m => m.id === messageId);
    
    if (!originalMessage) {
        alert('Original message not found!');
        return;
    }
    
    // Create reply message
    const replyMessage = {
        id: 'reply-' + Date.now(),
        originalMessageId: messageId,
        instructorEmail: userSession.email,
        instructorName: userSession.name || userSession.email,
        studentEmail: studentEmail,
        studentName: studentName,
        courseId: originalMessage.courseId,
        courseTitle: originalMessage.courseTitle,
        subject: 'Re: ' + (originalMessage.subject || 'No Subject'),
        content: replyContent,
        timestamp: new Date().toISOString(),
        read: false,
        type: 'instructor-to-student'
    };
    
    // Save reply to instructor messages
    messages.push(replyMessage);
    localStorage.setItem('instructorMessages', JSON.stringify(messages));
    
    // Also save to student messages
    let studentMessages = JSON.parse(localStorage.getItem('studentMessages') || '[]');
    studentMessages.push(replyMessage);
    localStorage.setItem('studentMessages', JSON.stringify(studentMessages));
    
    alert('Reply sent successfully!');
    
    // Close modal
    const modal = document.querySelector('.modal.active');
    if (modal) modal.remove();
    
    // Reload messages
    loadInstructorMessages();
}

// Reply to review
function replyToReview(reviewId) {
    const userSession = JSON.parse(localStorage.getItem('userSession') || '{}');
    
    const modal = document.createElement('div');
    modal.className = 'modal active';
    modal.style.zIndex = '10000';
    modal.innerHTML = `
        <div class="modal-content" style="max-width: 500px;">
            <button class="modal-close" onclick="this.closest('.modal').remove()">×</button>
            <h2>Reply to Review</h2>
            <form onsubmit="saveReviewReply(event, '${reviewId}')">
                <div class="form-group">
                    <label>Your Reply</label>
                    <textarea id="reviewReplyContent" rows="4" placeholder="Thank you for your feedback..." required style="width: 100%; padding: 0.75rem; border: 1px solid #E2E8F0; border-radius: 6px;"></textarea>
                </div>
                <button type="submit" class="btn btn-success" style="width: 100%;">Post Reply</button>
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

// Save review reply
function saveReviewReply(event, reviewId) {
    event.preventDefault();
    
    const replyContent = document.getElementById('reviewReplyContent').value;
    
    let reviews = JSON.parse(localStorage.getItem('courseReviews') || '[]');
    const reviewIndex = reviews.findIndex(r => r.id === reviewId);
    
    if (reviewIndex === -1) {
        alert('Review not found!');
        return;
    }
    
    reviews[reviewIndex].instructorReply = replyContent;
    reviews[reviewIndex].replyDate = new Date().toISOString();
    localStorage.setItem('courseReviews', JSON.stringify(reviews));
    
    alert('Reply posted successfully!');
    
    // Close modal
    const modal = document.querySelector('.modal.active');
    if (modal) modal.remove();
    
    // Reload reviews
    loadInstructorReviews();
}

// Edit review reply
function editReviewReply(reviewId) {
    let reviews = JSON.parse(localStorage.getItem('courseReviews') || '[]');
    const review = reviews.find(r => r.id === reviewId);
    
    if (!review || !review.instructorReply) {
        alert('No reply found to edit!');
        return;
    }
    
    const modal = document.createElement('div');
    modal.className = 'modal active';
    modal.style.zIndex = '10000';
    modal.innerHTML = `
        <div class="modal-content" style="max-width: 500px;">
            <button class="modal-close" onclick="this.closest('.modal').remove()">×</button>
            <h2>Edit Reply to Review</h2>
            <form onsubmit="saveReviewReply(event, '${reviewId}')">
                <div class="form-group">
                    <label>Your Reply</label>
                    <textarea id="reviewReplyContent" rows="4" required style="width: 100%; padding: 0.75rem; border: 1px solid #E2E8F0; border-radius: 6px;">${review.instructorReply}</textarea>
                </div>
                <button type="submit" class="btn btn-success" style="width: 100%;">Update Reply</button>
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

// View sale details
function viewSaleDetails(paymentId) {
    const payments = JSON.parse(localStorage.getItem('payments') || '[]');
    const payment = payments.find(p => p.id === paymentId);
    
    if (!payment) {
        alert('Payment details not found!');
        return;
    }
    
    alert(`Payment Details:\n\nPayment ID: ${payment.id}\nDate: ${new Date(payment.date).toLocaleString()}\nTotal: $${payment.total.toFixed(2)}\nCard: ****${payment.cardLast4}\nEmail: ${payment.email}\n\nCourses:\n${payment.courses.map(c => `- ${c.title}: $${c.price.toFixed(2)}`).join('\n')}`);
}

// View course analytics
function viewCourseAnalytics(courseId) {
    alert('Opening detailed course analytics...\n\nIn a full implementation, this would show detailed analytics for the course including enrollment trends, completion rates, revenue breakdown, and student engagement metrics.');
}

