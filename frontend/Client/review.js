/**
 * Review Page Logic
 * Fetch and display approved comments
 */

document.addEventListener('DOMContentLoaded', () => {
    loadComments();
    setupAnimations();

    // Intersection Observer for scroll animations
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry =>
            entry.isIntersecting && entry.target.classList.add('visible')
        );
    }, { threshold: 0.1 });

    document.querySelectorAll('.animate-on-scroll').forEach(el => observer.observe(el));
});

// State
let currentPage = 1;
const itemsPerPage = 8;

/**
 * Load Approved Comments
 */
async function loadComments(page = 1) {
    const list = document.getElementById('commentsContainer');
    list.innerHTML = Array(4).fill(
        `<div class="review-card skeleton" style="height: 150px; opacity: 0.6;"></div>`
    ).join('');

    try {
        const response = await api.getApprovedComments(page, itemsPerPage);

        currentPage = response.pagination.page;
        const totalPages = response.pagination.pages;
        const comments = response.data;

        // Render Comments List
        list.
            innerHTML = comments.length > 0
                ? comments.map(comment => createCommentCard(comment)).join('')
                : `<div class="no-reviews"><i class="bi bi-chat-square-dots"></i><p>No reviews yet. Be the first to share your thoughts!</p></div>`;

        // Setup Pagination
        renderPagination(currentPage, totalPages);

    } catch (error) {
        console.error('Failed to load comments:', error);
        list.innerHTML = `
            <div class="text-center text-danger py-5">
                <i class="bi bi-exclamation-triangle display-4"></i>
                <p>Failed to load comments. Please refresh the page.</p>
            </div>
        `;
    }
}

/**
 * Create Comment Card HTML
 */
function createCommentCard(comment) {
    // Generate avatar initials
    const initials = comment.name
        ? comment.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()
        : '?';

    // Format date
    const date = new Date(comment.created_at).toLocaleDateString(undefined, {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });

    return `
        <div class="review-card animate-on-scroll">
            <div class="review-avatar animate-on-scroll delay-100">
                ${initials}
            </div>
            <div class="review-content animate-on-scroll delay-200">
                <div class="review-header">
                    <span class="review-author">${comment.name}</span>
                    <span class="review-date">${date}</span>
                </div>
                <p class="review-text">${comment.comment_text}</p>
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

    if (total <= 1) {
        pagination.innerHTML = '';
        return;
    }

    // Previous Button
    html += `
        <li class="page-item ${current === 1 ? 'disabled' : ''}">
            <button class="page-link" onclick="changePage(${current - 1})" aria-label="Previous">
                <i class="bi bi-chevron-left"></i>
            </button>
        </li>
    `;

    // Page Numbers
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
    window.scrollTo({ top: 300, behavior: 'smooth' });
    loadComments(page);
};

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
}