// API Configuration
// ==========================================
// IMPORTANT: Before deploying to Vercel, update the PRODUCTION_API_URL
// with your actual Render backend URL (e.g., https://your-app-name.onrender.com/api)
// ==========================================

const PRODUCTION_API_URL = 'https://your-backend-app.onrender.com/api'; // <-- UPDATE THIS!

const API_CONFIG = {
    // Automatically detect environment and use appropriate URL
    BASE_URL: (function () {
        const hostname = window.location.hostname;

        // Local development
        if (hostname === 'localhost' || hostname === '127.0.0.1') {
            return 'http://localhost:5000/api';
        }

        // Production (Vercel or any other hosting)
        return PRODUCTION_API_URL;
    })(),

    ENDPOINTS: {
        // Foods
        FOODS: '/foods',
        FOOD_BY_ID: (id) => `/foods/${id}`,

        // Comments
        COMMENTS_APPROVED: '/comments/approved',
        COMMENTS_ALL: '/comments/all',
        COMMENT_CREATE: '/comments',
        COMMENT_APPROVE: (id) => `/comments/${id}/approve`,
        COMMENT_REJECT: (id) => `/comments/${id}/reject`,
        COMMENT_DELETE: (id) => `/comments/${id}`,

        // Admin
        ADMIN_LOGIN: '/admin/login',
        ADMIN_LOGOUT: '/admin/logout',
        ADMIN_CHECK_AUTH: '/admin/check-auth',
        ADMIN_CHANGE_PASSWORD: '/admin/change-password',

        // Upload
        UPLOAD_IMAGE: '/upload/image'
    }
};

// Log the API URL in development for debugging
if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    console.log('API Base URL:', API_CONFIG.BASE_URL);
}

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = API_CONFIG;
}
