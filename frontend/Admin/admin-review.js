/**
 * Admin Comment Moderation Logic
 * Fetch comments, filter by status, and approve/reject/delete
 */

// State
let currentPage = 1;
let currentStatus = '';
let itemsPerPage = 12;

document.addEventListener('DOMContentLoaded', () => {
    checkAuth();
    loadComments();
    setupFilters();
});

/**
 * Check Authentication
 */
async function checkAuth() {
    try {
        const response = await api.checkAuth();
        if (!response.authenticated) {
            window.location.href = 'login.html';
        }
    } catch (error) {
        console.error('Auth Check Failed:', error);
        window.location.href = 'login.html';
    }
}

/**
 * Load Comments
 */
async function loadComments(page = 1) {
    const container = document.getElementById('commentsContainer');
    container.innerHTML = `
        <div class="col-12 text-center py-5">
            <div class="spinner-border text-primary"></div>
        </div>
    `;

    try {
        // Fetch comments with current status filter
        const response = await api.getAllComments(page, itemsPerPage, currentStatus);

        const comments = response.data;
        const { pagination, stats } = response;
        currentPage = pagination.page;

        // Update Stats
        if (stats) {
            document.getElementById('pendingCount').textContent = stats.pending || 0;
            document.getElementById('approvedCount').textContent = stats.approved || 0;
            document.getElementById('rejectedCount').textContent = stats.rejected || 0;
        }

        // Render List
        if (comments.length === 0) {
            container.innerHTML = `
                <div class="col-12 empty-state">
                    <i class="bi bi-chat-square-dots"></i>
                    <p>No comments found.</p>
                </div>
            `;
        } else {
            container.innerHTML = comments.map(comment => createCommentCard(comment)).join('');
        }

        renderPagination(pagination.page, pagination.pages);

    } catch (error) {
        console.error('Failed to load comments:', error);
        container.innerHTML = `
            <div class="col-12 text-center text-danger py-5">
                <i class="bi bi-exclamation-triangle display-4"></i>
                <p>Failed to load comments.</p>
            </div>
        `;
    }
}

/**
 * Create Comment Card HTML
 */
function createCommentCard(comment) {
    const initials = comment.name ? comment.name.substring(0, 2).toUpperCase() : '??';
    const statusClass = `status-${comment.status}`;
    const date = new Date(comment.created_at).toLocaleDateString();

    let actionButtons = '';

    // Logic for action buttons based on status
    if (comment.status === 'pending') {
        actionButtons = `
            <button class="btn btn-sm btn-outline-success" onclick="updateStatus('${comment._id}', 'approve')" title="Approve">
                <i class="bi bi-check-lg"></i> Approve
            </button>
            <button class="btn btn-sm btn-outline-danger" onclick="updateStatus('${comment._id}', 'reject')" title="Reject">
                <i class="bi bi-x-lg"></i> Reject
            </button>
        `;
    } else if (comment.status === 'rejected') {
        actionButtons = `
            <button class="btn btn-sm btn-outline-secondary" onclick="updateStatus('${comment._id}', 'approve')" title="Restore">
                <i class="bi bi-arrow-counterclockwise"></i> Restore
            </button>
            <button class="btn btn-sm btn-outline-danger" onclick="deleteComment('${comment._id}')" title="Delete Permanently">
                <i class="bi bi-trash"></i> Delete
            </button>
        `;
    } else {
        // Approved
        actionButtons = `
            <button class="btn btn-sm btn-outline-warning" onclick="updateStatus('${comment._id}', 'reject')" title="Reject">
                <i class="bi bi-ban"></i> Reject
            </button>
        `;
    }

    return `
        <div class="col-md-6 col-xl-4 animate-on-scroll">
            <div class="comment-card ${statusClass} h-100 d-flex flex-column">
                <div class="comment-header">
                    <div class="comment-author">
                        <div class="author-avatar">${initials}</div>
                        <div class="author-info">
                            <h5 class="text-truncate" style="max-width: 150px;">${comment.name}</h5>
                            <small>${comment.email}</small>
                        </div>
                    </div>
                    <span class="badge bg-secondary text-capitalize">${comment.status}</span>
                </div>
                
                <div class="comment-body flex-grow-1">
                    <p class="text-secondary small mb-1"><i class="bi bi-clock"></i> ${date}</p>
                    <p>${comment.comment_text}</p>
                </div>

                <div class="comment-actions">
                    ${actionButtons}
                </div>
            </div>
        </div>
    `;
}

/**
 * Update Comment Status (Approve/Reject)
 */
window.updateStatus = async (id, action) => {
    try {
        if (action === 'approve') {
            await api.approveComment(id);
            showToast('Comment approved', 'success');
        } else if (action === 'reject') {
            await api.rejectComment(id);
            showToast('Comment rejected', 'warning');
        }

        // Refresh list
        loadComments(currentPage);

    } catch (error) {
        console.error(`Failed to ${action} comment:`, error);
        alert(`Failed to ${action} comment.`);
    }
};

/**
 * Delete Comment
 */
window.deleteComment = async (id) => {
    if (!confirm('Are you sure you want to permanently delete this comment?')) return;

    try {
        await api.deleteComment(id);
        loadComments(currentPage);
        showToast('Comment deleted permanently', 'info');
    } catch (error) {
        console.error('Delete failed:', error);
        alert('Failed to delete comment.');
    }
};

/**
 * Setup Filters
 */
function setupFilters() {
    const tabs = document.querySelectorAll('.filter-tab');
    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            // Update active state
            tabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');

            // Update filter
            currentStatus = tab.dataset.status;
            currentPage = 1;
            loadComments(1);
        });
    });
}

/**
 * Render Pagination
 */
function renderPagination(current, total) {
    const pagination = document.getElementById('pagination');
    let html = '';

    if (total <= 1) {
        pagination.innerHTML = '';
        return;
    }

    // Previous
    html += `<li class="page-item ${current === 1 ? 'disabled' : ''}">
                <button class="page-link" onclick="loadComments(${current - 1})">&laquo;</button>
             </li>`;

    // Numbers
    for (let i = 1; i <= total; i++) {
        html += `<li class="page-item ${i === current ? 'active' : ''}">
                    <button class="page-link" onclick="loadComments(${i})">${i}</button>
                 </li>`;
    }

    // Next
    html += `<li class="page-item ${current === total ? 'disabled' : ''}">
                <button class="page-link" onclick="loadComments(${current + 1})">&raquo;</button>
             </li>`;

    pagination.innerHTML = html;
}

// Helper: Toast (reuse logic)
function showToast(msg, type = 'info') {
    // Basic implementation or reuse shared toast
    // For now simple placeholder
    console.log(`[${type.toUpperCase()}] ${msg}`);
}

// Logout
document.getElementById('logoutBtn').addEventListener('click', async (e) => {
    e.preventDefault();
    await api.adminLogout();
    window.location.href = 'login.html';
});