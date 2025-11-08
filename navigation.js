// Navigation and Page Routing
document.addEventListener('DOMContentLoaded', function() {
    const navLinks = document.querySelectorAll('.nav-link');
    const pages = document.querySelectorAll('.page');
    const hamburger = document.querySelector('.hamburger');
    const navMenu = document.querySelector('.nav-menu');
    const navLogo = document.querySelector('.nav-logo');
    
    // Initialize - show home page
    showPage('home');
    
    // Logo click handler
    if (navLogo) {
        navLogo.addEventListener('click', function() {
            showPage('home');
            updateActiveNav('home');
        });
    }
    
    // Handle navigation clicks
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const pageName = this.getAttribute('data-page');
            showPage(pageName);
            
            // Update active nav link
            navLinks.forEach(l => l.classList.remove('active'));
            this.classList.add('active');
            
            // Close mobile menu if open
            if (navMenu.classList.contains('active')) {
                navMenu.classList.remove('active');
                hamburger.classList.remove('active');
            }
        });
    });
    
    // Handle hamburger menu
    if (hamburger) {
        hamburger.addEventListener('click', function() {
            hamburger.classList.toggle('active');
            navMenu.classList.toggle('active');
        });
    }
    
    // Handle browser back/forward buttons
    window.addEventListener('popstate', function(e) {
        const page = window.location.hash.slice(1) || 'home';
        showPage(page);
        updateActiveNav(page);
    });
    
    // Handle initial hash
    if (window.location.hash) {
        const page = window.location.hash.slice(1);
        if (page) {
            showPage(page);
            updateActiveNav(page);
        }
    }
});

// Show specific page with animation
function showPage(pageName) {
    const pages = document.querySelectorAll('.page');
    const targetPage = document.getElementById(`${pageName}-page`);
    
    if (!targetPage) {
        console.error(`Page ${pageName} not found`);
        return;
    }
    
    // Hide all pages with fade out
    pages.forEach(page => {
        if (page.classList.contains('active')) {
            page.classList.add('fade-out');
            setTimeout(() => {
                page.classList.remove('active', 'fade-out');
            }, 300);
        } else {
            page.classList.remove('active');
        }
    });
    
    // Show target page with fade in
    setTimeout(() => {
        targetPage.classList.add('active');
        targetPage.style.opacity = '0';
        
        // Trigger animations for page elements
        setTimeout(() => {
            targetPage.style.opacity = '1';
            animatePageElements(targetPage);
        }, 50);
        
        // Update URL hash
        window.history.pushState({ page: pageName }, '', `#${pageName}`);
    }, 300);
}

// Animate page elements on load
function animatePageElements(page) {
    const animatedElements = page.querySelectorAll('.fade-in, .fade-in-up, .slide-in-left, .slide-in-right, .slide-in-up');
    
    animatedElements.forEach((element, index) => {
        element.style.opacity = '0';
        setTimeout(() => {
            element.style.opacity = '1';
        }, index * 100);
    });
}

// Update active navigation link
function updateActiveNav(pageName) {
    const navLinks = document.querySelectorAll('.nav-link');
    navLinks.forEach(link => {
        if (link.getAttribute('data-page') === pageName) {
            link.classList.add('active');
        } else {
            link.classList.remove('active');
        }
    });
}

// Export for use in other scripts
window.showPage = showPage;

