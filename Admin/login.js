document.getElementById('loginForm').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    
    fetch('http://localhost:5000/admin/login', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        return response.json();
    })
    .then(data => {
        if (data.message === "Login successful") {
            window.location.href = '/admin/admin.html'; // Ensure this path is correct based on your directory structure
        } else {
            document.getElementById('loginMessage').textContent = 'Invalid username or password';
        }
    })
    .catch((error) => {
        console.error('Error:', error);
        document.getElementById('loginMessage').textContent = 'An error occurred. Please try again.';
    });
});

// Check login status when loading admin.html
if (window.location.pathname.endsWith('admin.html')) {
    fetch('http://localhost:5000/admin/check_auth')
    .then(response => response.json())
    .then(data => {
        if (!data.authenticated) {
            window.location.href = '/admin/login.html'; // Ensure this path is correct based on your directory structure
        }
    })
    .catch((error) => {
        console.error('Error checking auth:', error);
        window.location.href = '/admin/login.html'; // Redirect to login page if auth check fails
    });
}

// Logout functionality
const logoutBtn = document.getElementById('logoutBtn');
if (logoutBtn) {
    logoutBtn.addEventListener('click', function() {
        fetch('http://localhost:5000/admin/logout', {
            method: 'POST',
        })
        .then(response => response.json())
        .then(data => {
            if (data.message === "Logout successful") {
                window.location.href = '/admin/login.html'; // Redirect to login page on successful logout
            } else {
                console.error('Logout failed:', data);
                document.getElementById('logoutMessage').textContent = 'An error occurred during logout. Please try again.';
            }
        })
        .catch((error) => {
            console.error('Error:', error);
            document.getElementById('logoutMessage').textContent = 'An error occurred during logout. Please try again.';
        });
    });
}
