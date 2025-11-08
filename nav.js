// Navigation functionality for separate pages
document.addEventListener('DOMContentLoaded', function() {
    const hamburger = document.querySelector('.hamburger');
    const navMenu = document.querySelector('.nav-menu');
    
    // Handle hamburger menu
    if (hamburger) {
        hamburger.addEventListener('click', function() {
            hamburger.classList.toggle('active');
            navMenu.classList.toggle('active');
        });
    }
    
    // Close mobile menu when clicking on a link
    const navLinks = document.querySelectorAll('.nav-link');
    navLinks.forEach(link => {
        link.addEventListener('click', function() {
            if (navMenu.classList.contains('active')) {
                navMenu.classList.remove('active');
                hamburger.classList.remove('active');
            }
        });
    });
    
    // Highlight active page based on current URL
    const currentPage = window.location.pathname.split('/').pop() || 'home.html';
    navLinks.forEach(link => {
        const linkPage = link.getAttribute('href');
        // Handle both 'home.html' and empty string (root)
        if (linkPage === currentPage || 
            (currentPage === '' && linkPage === 'home.html') ||
            (currentPage === 'index.html' && linkPage === 'home.html')) {
            link.classList.add('active');
        } else {
            link.classList.remove('active');
        }
    });
    
    // Handle dashboard page highlighting
    if (currentPage === 'dashboard.html') {
        const dashboardLink = document.querySelector('a[href="dashboard.html"]');
        if (dashboardLink) {
            dashboardLink.classList.add('active');
        }
    }
    
    // Add smooth scroll behavior for same-page anchors
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const href = this.getAttribute('href');
            if (href !== '#' && href.length > 1) {
                const target = document.querySelector(href);
                if (target) {
                    e.preventDefault();
                    target.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                }
            }
        });
    });
    
    // Add page transition effect
    document.body.style.opacity = '0';
    setTimeout(() => {
        document.body.style.transition = 'opacity 0.3s ease-in';
        document.body.style.opacity = '1';
    }, 10);
});

