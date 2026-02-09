/**
 * Contact Page Logic
 * Handlers for contact form submission
 */

document.addEventListener('DOMContentLoaded', () => {
    setupContactForm();
    setupAnimations();
});

/**
 * Setup Contact Form
 */
function setupContactForm() {
    const form = document.getElementById('contactForm');
    if (!form) return;

    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        const submitBtn = form.querySelector('button[type="submit"]');
        const originalText = submitBtn.innerHTML;

        try {
            // Show loading state
            submitBtn.disabled = true;
            submitBtn.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span>Sending...';

            // Simulate API call (Replace with actual endpoint if available)
            await new Promise(resolve => setTimeout(resolve, 1500));

            // Show success
            showToast('Message sent successfully! We will get back to you soon.', 'success');
            form.reset();

        } catch (error) {
            console.error('Contact Error:', error);
            showToast('Failed to send message. Please try again.', 'error');
        } finally {
            // Restore button
            submitBtn.disabled = false;
            submitBtn.innerHTML = originalText;
        }
    });
}

/**
 * Show Toast Notification
 */
function showToast(message, type = 'info') {
    let container = document.querySelector('.toast-container');
    if (!container) {
        container = document.createElement('div');
        container.className = 'toast-container';
        document.body.appendChild(container);
    }

    const icons = {
        success: 'bi-check-circle-fill',
        error: 'bi-x-circle-fill',
        info: 'bi-info-circle-fill'
    };

    const toast = document.createElement('div');
    toast.className = `toast ${type} show`;
    toast.innerHTML = `
        <i class="bi ${icons[type]} toast-icon"></i>
        <span>${message}</span>
    `;

    container.appendChild(toast);

    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

/**
 * Setup Animations
 */
function setupAnimations() {
    const loader = document.getElementById('loadingOverlay');
    if (loader) {
        setTimeout(() => {
            loader.style.opacity = '0';
            setTimeout(() => loader.remove(), 500);
        }, 600);
    }

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry =>
            entry.isIntersecting && entry.target.classList.add('visible')
        );
    }, { threshold: 0.1 });

    document.querySelectorAll('.animate-on-scroll').forEach(el => observer.observe(el));
}