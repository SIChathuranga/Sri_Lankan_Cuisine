/**
 * Admin Login Logic
 * Handles authentication and redirect to dashboard
 */

document.addEventListener('DOMContentLoaded', () => {
    // Redirect if already logged in (optional check)
    checkAlreadyLoggedIn();

    setupLoginForm();
    setupPasswordToggle();
    setupThemeToggle();
});

/**
 * Check if already logged in
 */
async function checkAlreadyLoggedIn() {
    try {
        const response = await api.checkAuth();
        if (response.authenticated) {
            window.location.href = 'admin.html';
        }
    } catch (error) {
        console.log('Not logged in');
    }
}

/**
 * Setup Login Form
 */
function setupLoginForm() {
    const form = document.querySelector('form');
    const alert = document.getElementById('loginAlert');
    const alertMsg = document.getElementById('alertMessage');

    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        const username = document.getElementById('username').value.trim();
        const password = document.getElementById('password').value;
        const submitBtn = form.querySelector('button[type="submit"]');
        const originalText = submitBtn.innerHTML;

        // Reset Alert
        alert.classList.add('d-none');

        if (!username || !password) {
            showAlert('Please enter both username and password.');
            return;
        }

        try {
            // Show loading state
            submitBtn.disabled = true;
            submitBtn.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span>Authenticating...';

            const response = await api.adminLogin(username, password);

            if (response.success) {
                // Success - Redirect
                submitBtn.innerHTML = '<i class="bi bi-check-circle me-2"></i>Success!';
                submitBtn.classList.remove('btn-login');
                submitBtn.classList.add('btn-success');

                setTimeout(() => {
                    window.location.href = 'admin.html';
                }, 800);
            } else {
                showAlert(response.message || 'Invalid credentials');
            }

        } catch (error) {
            console.error('Login Error:', error);
            showAlert('Login failed. Please check your connection or credentials.');
        } finally {
            if (!alert.classList.contains('d-none')) {
                // Restore button only on error
                submitBtn.disabled = false;
                submitBtn.innerHTML = originalText;
            }
        }
    });

    function showAlert(msg) {
        alertMsg.textContent = msg;
        alert.classList.remove('d-none');
        alert.classList.add('show');
    }
}

/**
 * Setup Password Visibility Toggle
 */
function setupPasswordToggle() {
    const toggle = document.querySelector('#togglePassword');
    const password = document.querySelector('#password');

    if (toggle && password) {
        toggle.addEventListener('click', () => {
            const type = password.getAttribute('type') === 'password' ? 'text' : 'password';
            password.setAttribute('type', type);

            toggle.querySelector('i').classList.toggle('bi-eye');
            toggle.querySelector('i').classList.toggle('bi-eye-slash');
        });
    }
}

/**
 * Setup Theme Toggle (Specific for Login Page)
 */
function setupThemeToggle() {
    const toggle = document.getElementById('darkModeToggle');
    if (toggle) {
        toggle.addEventListener('click', () => {
            window.themeManager.toggleTheme();
        });
    }
}
