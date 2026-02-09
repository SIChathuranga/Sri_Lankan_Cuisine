// API Configuration
const API_CONFIG = {
    // Change this to your Render backend URL when deployed
    BASE_URL: window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
        ? 'http://localhost:5000/api'
        : 'https://your-backend-app.onrender.com/api',

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

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = API_CONFIG;
}
