// API Communication for Signup and Contact Forms
const API_BASE_URL = 'http://localhost:3000/api';

// Signup Form Handler
document.addEventListener('DOMContentLoaded', function() {
    const signupForm = document.getElementById('signup-form');
    const contactForm = document.getElementById('contact-form');
    
    if (signupForm) {
        signupForm.addEventListener('submit', handleSignup);
    }
    
    if (contactForm) {
        contactForm.addEventListener('submit', handleContact);
    }
});

// Handle Signup
async function handleSignup(e) {
    e.preventDefault();
    
    const form = e.target;
    const formData = new FormData(form);
    const data = Object.fromEntries(formData);
    
    // Validate passwords match
    if (data.password !== data.confirmPassword) {
        showMessage('signup-message', 'Passwords do not match!', 'error');
        return;
    }
    
    // Validate password length
    if (data.password.length < 6) {
        showMessage('signup-message', 'Password must be at least 6 characters!', 'error');
        return;
    }
    
    // Disable submit button
    const submitBtn = form.querySelector('.btn-submit');
    const originalText = submitBtn.textContent;
    submitBtn.disabled = true;
    submitBtn.textContent = 'Signing Up...';
    
    try {
        const response = await fetch(`${API_BASE_URL}/signup`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                name: data.name,
                email: data.email,
                password: data.password,
                phone: data.phone || null
            })
        });
        
        const result = await response.json();
        
        if (response.ok) {
            showMessage('signup-message', result.message || 'Account created successfully! Redirecting to home...', 'success');
            form.reset();
            
            // Redirect to home after 2 seconds
            setTimeout(() => {
                window.location.href = 'home.html';
            }, 2000);
        } else {
            showMessage('signup-message', result.error || 'Signup failed. Please try again.', 'error');
        }
    } catch (error) {
        console.error('Signup error:', error);
        showMessage('signup-message', 'Unable to connect to server. Please check if the server is running.', 'error');
    } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = originalText;
    }
}

// Handle Contact Form
async function handleContact(e) {
    e.preventDefault();
    
    const form = e.target;
    const formData = new FormData(form);
    const data = Object.fromEntries(formData);
    
    // Disable submit button
    const submitBtn = form.querySelector('.btn-submit');
    const originalText = submitBtn.textContent;
    submitBtn.disabled = true;
    submitBtn.textContent = 'Sending...';
    
    try {
        const response = await fetch(`${API_BASE_URL}/contact`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                name: data.name,
                email: data.email,
                subject: data.subject,
                message: data.message
            })
        });
        
        const result = await response.json();
        
        if (response.ok) {
            showMessage('contact-form-message', result.message || 'Message sent successfully! We will get back to you soon.', 'success');
            form.reset();
        } else {
            showMessage('contact-form-message', result.error || 'Failed to send message. Please try again.', 'error');
        }
    } catch (error) {
        console.error('Contact error:', error);
        showMessage('contact-form-message', 'Unable to connect to server. Please check if the server is running.', 'error');
    } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = originalText;
    }
}

// Show message to user
function showMessage(elementId, message, type) {
    const messageEl = document.getElementById(elementId);
    if (!messageEl) return;
    
    messageEl.textContent = message;
    messageEl.className = `form-message ${type}`;
    messageEl.style.display = 'block';
    
    // Add animation
    messageEl.classList.add('fade-in');
    
    // Auto-hide after 5 seconds for success messages
    if (type === 'success') {
        setTimeout(() => {
            messageEl.style.display = 'none';
        }, 5000);
    }
}

// Test API connection
async function testConnection() {
    try {
        const response = await fetch(`${API_BASE_URL}/health`);
        if (response.ok) {
            console.log('API server is running');
            return true;
        }
    } catch (error) {
        console.warn('API server is not running:', error.message);
        return false;
    }
}

// Test connection on load
window.addEventListener('load', () => {
    setTimeout(testConnection, 1000);
});

