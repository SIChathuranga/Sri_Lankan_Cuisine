/**
 * Home Page Logic
 * Handles food fetching, search, pagination, and comment submission
 */

document.addEventListener('DOMContentLoaded', () => {
    // Initialize
    loadFoods();
    setupSearch();
    setupCommentForm();
    setupAnimations();

    // Intersection Observer for scroll animations
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
            }
        });
    }, { threshold: 0.1 });

    document.querySelectorAll('.animate-on-scroll').forEach(el => observer.observe(el));
});

// Global state
let currentPage = 1;
let currentSearch = '';
const itemsPerPage = 9;

/**
 * Load foods from API
 */
async function loadFoods(page = 1, search = '') {
    const grid = document.getElementById('foodGrid');
    const pagination = document.getElementById('pagination');

    // Show Loading Skeletons
    grid.innerHTML = Array(6).fill(`
        <div class="col">
            <div class="food-card skeleton" style="height: 400px; padding: 20px;"></div>
        </div>
    `).join('');

    try {
        // Fetch data
        const response = await api.getFoods(page, itemsPerPage, search);

        // Update State
        currentPage = response.pagination.page;
        const totalPages = response.pagination.pages;
        const foods = response.data;

        // Render Grid
        if (foods.length === 0) {
            grid.innerHTML = `
                <div class="col-12 text-center py-5">
                    <i class="bi bi-search display-3 text-muted mb-3"></i>
                    <h3 class="text-muted">No recipes found</h3>
                    <p class="text-muted">Try adjusting your search terms.</p>
                </div>
            `;
            pagination.innerHTML = '';
            return;
        }

        grid.innerHTML = foods.map(food => createFoodCard(food)).join('');

        // Setup Pagination
        renderPagination(currentPage, totalPages);

    } catch (error) {
        console.error('Failed to load foods:', error);
        grid.innerHTML = `
            <div class="col-12 text-center text-danger py-5">
                <i class="bi bi-exclamation-circle display-4 mb-3"></i>
                <p>Failed to load recipes. Please try again later.</p>
                <button onclick="loadFoods(${page}, '${search}')" class="btn btn-outline-primary mt-3">Retry</button>
            </div>
        `;
    }
}

/**
 * Create HTML for a food card
 */
function createFoodCard(food) {
    // Use placeholder if no image
    const imageUrl = food.image_url || 'https://placehold.co/600x400?text=No+Image';
    const description = food.description || 'No description available.';

    return `
        <div class="col animate-on-scroll">
            <div class="food-card h-100">
                <div class="card-img-wrapper">
                    <img src="${imageUrl}" class="card-img" alt="${food.title}" loading="lazy">
                    <div class="badge bg-primary position-absolute top-0 end-0 m-3 shadow-sm">
                        ${food.category || 'Traditional'}
                    </div>
                </div>
                <div class="card-content">
                    <h3 class="card-title fw-bold text-truncate">${food.title}</h3>
                    <p class="card-text text-muted small mb-3">${description}</p>
                    <a href="food-details.html?id=${food._id}" class="btn btn-sm btn-outline-primary w-100 stretched-link">
                        View Recipe <i class="bi bi-arrow-right ms-1"></i>
                    </a>
                </div>
                <div class="card-footer bg-transparent border-top-0 pt-0 pb-3 px-3">
                    <small class="text-muted">
                        <i class="bi bi-clock me-1"></i> ${new Date(food.created_at).toLocaleDateString()}
                    </small>
                </div>
            </div>
        </div>
    `;
}

/**
 * Render Pagination Controls
 */
function renderPagination(current, total) {
    const pagination = document.getElementById('pagination');
    let html = '';

    // Previous Button
    html += `
        <li class="page-item ${current === 1 ? 'disabled' : ''}">
            <button class="page-link" onclick="changePage(${current - 1})" aria-label="Previous">
                <i class="bi bi-chevron-left"></i>
            </button>
        </li>
    `;

    // Page Numbers (simplified logic)
    for (let i = 1; i <= total; i++) {
        if (i === 1 || i === total || (i >= current - 1 && i <= current + 1)) {
            html += `
                <li class="page-item ${i === current ? 'active' : ''}">
                    <button class="page-link" onclick="changePage(${i})">${i}</button>
                </li>
            `;
        } else if (i === current - 2 || i === current + 2) {
            html += `<li class="page-item disabled"><span class="page-link border-0">...</span></li>`;
        }
    }

    // Next Button
    html += `
        <li class="page-item ${current === total ? 'disabled' : ''}">
            <button class="page-link" onclick="changePage(${current + 1})" aria-label="Next">
                <i class="bi bi-chevron-right"></i>
            </button>
        </li>
    `;

    pagination.innerHTML = html;
}

/**
 * Handle Page Change
 */
window.changePage = (page) => {
    window.scrollTo({ top: document.getElementById('food-showcase').offsetTop - 100, behavior: 'smooth' });
    loadFoods(page, currentSearch);
};

/**
 * Setup Search Functionality
 */
function setupSearch() {
    const input = document.getElementById('searchInput');
    let timeout = null;

    input.addEventListener('input', (e) => {
        clearTimeout(timeout);
        timeout = setTimeout(() => {
            currentSearch = e.target.value.trim();
            currentPage = 1;
            loadFoods(currentPage, currentSearch);
        }, 500); // Debounce search
    });
}

/**
 * Setup Comment Form Submission
 */
function setupCommentForm() {
    const form = document.getElementById('commentForm');

    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        const name = document.getElementById('commentName').value;
        const email = document.getElementById('commentEmail').value;
        const text = document.getElementById('commentText').value;

        const submitBtn = form.querySelector('button[type="submit"]');
        const originalText = submitBtn.innerHTML;

        try {
            // Show loading state
            submitBtn.disabled = true;
            submitBtn.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span>Sending...';

            await api.submitComment({
                name: name,
                email: email,
                comment_text: text
            });

            // Show success
            showToast('Comment submitted successfully! It will appear after approval.', 'success');
            form.reset();

        } catch (error) {
            console.error('Comment Error:', error);
            showToast(error.message || 'Failed to submit comment.', 'error');
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
    // Create toast container if needed
    let container = document.querySelector('.toast-container');
    if (!container) {
        container = document.createElement('div');
        container.className = 'toast-container';
        document.body.appendChild(container);
    }

    // Icons based on type
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

    // Remove after 3 seconds
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

/**
 * Initial Setup Animations
 */
function setupAnimations() {
    // Hide loading overlay
    const loader = document.getElementById('loadingOverlay');
    if (loader) {
        setTimeout(() => {
            loader.style.opacity = '0';
            setTimeout(() => loader.remove(), 500);
        }, 800);
    }
}
