/**
 * API Helper Module
 * Centralized API calls with error handling and loading states
 */

class API {
    constructor() {
        this.baseURL = API_CONFIG.BASE_URL;
    }

    /**
     * Make HTTP request
     * @param {string} endpoint - API endpoint
     * @param {object} options - Fetch options
     * @returns {Promise} Response data
     */
    async request(endpoint, options = {}) {
        const url = `${this.baseURL}${endpoint}`;

        const defaultOptions = {
            headers: {
                'Content-Type': 'application/json',
            },
            credentials: 'include', // Include cookies for session
        };

        const config = { ...defaultOptions, ...options };

        try {
            const response = await fetch(url, config);
            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Request failed');
            }

            return data;
        } catch (error) {
            console.error('API Error:', error);
            throw error;
        }
    }

    // ========== FOOD ENDPOINTS ==========

    /**
     * Get all foods with pagination
     * @param {number} page - Page number
     * @param {number} limit - Items per page
     * @param {string} search - Search query
     */
    async getFoods(page = 1, limit = 9, search = '') {
        let endpoint = `${API_CONFIG.ENDPOINTS.FOODS}?page=${page}&limit=${limit}`;
        if (search) {
            endpoint += `&search=${encodeURIComponent(search)}`;
        }
        return this.request(endpoint);
    }

    /**
     * Get single food by ID
     * @param {string} id - Food ID
     */
    async getFoodById(id) {
        return this.request(API_CONFIG.ENDPOINTS.FOOD_BY_ID(id));
    }

    /**
     * Create new food (admin only)
     * @param {object} foodData - Food data
     */
    async createFood(foodData) {
        return this.request(API_CONFIG.ENDPOINTS.FOODS, {
            method: 'POST',
            body: JSON.stringify(foodData)
        });
    }

    /**
     * Update food (admin only)
     * @param {string} id - Food ID
     * @param {object} foodData - Updated food data
     */
    async updateFood(id, foodData) {
        return this.request(API_CONFIG.ENDPOINTS.FOOD_BY_ID(id), {
            method: 'PUT',
            body: JSON.stringify(foodData)
        });
    }

    /**
     * Delete food (admin only)
     * @param {string} id - Food ID
     */
    async deleteFood(id) {
        return this.request(API_CONFIG.ENDPOINTS.FOOD_BY_ID(id), {
            method: 'DELETE'
        });
    }

    // ========== COMMENT ENDPOINTS ==========

    /**
     * Get approved comments
     * @param {number} page - Page number
     * @param {number} limit - Items per page
     */
    async getApprovedComments(page = 1, limit = 50) {
        return this.request(`${API_CONFIG.ENDPOINTS.COMMENTS_APPROVED}?page=${page}&limit=${limit}`);
    }

    /**
     * Get all comments with filter (admin only)
     * @param {number} page - Page number
     * @param {number} limit - Items per page
     * @param {string} status - Filter by status
     */
    async getAllComments(page = 1, limit = 50, status = '') {
        let endpoint = `${API_CONFIG.ENDPOINTS.COMMENTS_ALL}?page=${page}&limit=${limit}`;
        if (status) {
            endpoint += `&status=${status}`;
        }
        return this.request(endpoint);
    }

    /**
     * Submit new comment
     * @param {object} commentData - Comment data (name, email, comment_text)
     */
    async submitComment(commentData) {
        return this.request(API_CONFIG.ENDPOINTS.COMMENT_CREATE, {
            method: 'POST',
            body: JSON.stringify(commentData)
        });
    }

    /**
     * Approve comment (admin only)
     * @param {string} id - Comment ID
     */
    async approveComment(id) {
        return this.request(API_CONFIG.ENDPOINTS.COMMENT_APPROVE(id), {
            method: 'PUT'
        });
    }

    /**
     * Reject comment (admin only)
     * @param {string} id - Comment ID
     */
    async rejectComment(id) {
        return this.request(API_CONFIG.ENDPOINTS.COMMENT_REJECT(id), {
            method: 'PUT'
        });
    }

    /**
     * Delete comment (admin only)
     * @param {string} id - Comment ID
     */
    async deleteComment(id) {
        return this.request(API_CONFIG.ENDPOINTS.COMMENT_DELETE(id), {
            method: 'DELETE'
        });
    }

    // ========== ADMIN ENDPOINTS ==========

    /**
     * Admin login
     * @param {string} username - Admin username
     * @param {string} password - Admin password
     */
    async adminLogin(username, password) {
        return this.request(API_CONFIG.ENDPOINTS.ADMIN_LOGIN, {
            method: 'POST',
            body: JSON.stringify({ username, password })
        });
    }

    /**
     * Admin logout
     */
    async adminLogout() {
        return this.request(API_CONFIG.ENDPOINTS.ADMIN_LOGOUT, {
            method: 'POST'
        });
    }

    /**
     * Check admin authentication
     */
    async checkAuth() {
        return this.request(API_CONFIG.ENDPOINTS.ADMIN_CHECK_AUTH);
    }

    /**
     * Change admin password
     * @param {string} oldPassword - Current password
     * @param {string} newPassword - New password
     */
    async changePassword(oldPassword, newPassword) {
        return this.request(API_CONFIG.ENDPOINTS.ADMIN_CHANGE_PASSWORD, {
            method: 'PUT',
            body: JSON.stringify({
                old_password: oldPassword,
                new_password: newPassword
            })
        });
    }

    // ========== UPLOAD ENDPOINTS ==========

    /**
     * Upload image (admin only)
     * @param {File} file - Image file
     */
    async uploadImage(file) {
        const formData = new FormData();
        formData.append('file', file);

        const url = `${this.baseURL}${API_CONFIG.ENDPOINTS.UPLOAD_IMAGE}`;

        try {
            const response = await fetch(url, {
                method: 'POST',
                body: formData,
                credentials: 'include'
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Upload failed');
            }

            return data;
        } catch (error) {
            console.error('Upload Error:', error);
            throw error;
        }
    }
}

// Create singleton instance
const api = new API();

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = api;
}
