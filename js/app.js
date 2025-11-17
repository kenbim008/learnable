// Initialize
document.addEventListener('DOMContentLoaded', function() {
    loadCourses();
    updateInstructorPrice();
    updateCart();
    
    // Disable right-click on course videos (basic protection)
    document.addEventListener('contextmenu', function(e) {
        if (e.target.tagName === 'VIDEO') {
            e.preventDefault();
            alert('Content is protected. Streaming only - no downloads allowed.');
        }
    });
});

