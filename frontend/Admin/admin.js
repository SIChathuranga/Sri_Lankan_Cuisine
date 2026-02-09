/**
 * Admin Dashboard Logic
 * Food Management: List, Add, Edit, Delete
 */

// Global State
let currentPage = 1;
let currentFoods = [];

document.addEventListener('DOMContentLoaded', () => {
    checkAuth();
    loadFoods();
    setupModal();
    setupImageUpload();
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
 * Load Foods
 */
async function loadFoods(page = 1) {
    const tableBody = document.getElementById('foodTableBody');
    tableBody.innerHTML = `<tr><td colspan="5" class="text-center py-4"><div class="spinner-border text-primary"></div></td></tr>`;

    try {
        const response = await api.getFoods(page, 10);
        currentFoods = response.data;
        const { pagination } = response;

        // Update Stats
        document.getElementById('totalFoods').textContent = pagination.total || 0;

        // Render Table
        if (currentFoods.length === 0) {
            tableBody.innerHTML = `<tr><td colspan="5" class="text-center text-muted py-4">No recipes found.</td></tr>`;
            return;
        }

        renderTable(currentFoods);
        renderPagination(pagination.page, pagination.pages);

    } catch (error) {
        console.error('Failed to load foods:', error);
        tableBody.innerHTML = `<tr><td colspan="5" class="text-center text-danger py-4">Error loading data.</td></tr>`;
    }
}

/**
 * Render Data Table
 */
function renderTable(foods) {
    const tableBody = document.getElementById('foodTableBody');
    tableBody.innerHTML = foods.map(food => `
        <tr>
            <td>
                <img src="${food.image_url || 'https://placehold.co/50'}" class="rounded object-fit-cover" width="50" height="50" alt="Preview">
            </td>
            <td class="fw-bold text-truncate" style="max-width: 200px;">${food.title}</td>
            <td><span class="badge bg-secondary">${food.category || 'Standard'}</span></td>
            <td>${new Date(food.created_at).toLocaleDateString()}</td>
            <td class="text-end">
                <button class="btn btn-sm btn-edit me-1" onclick="openEditModal('${food._id}')" title="Edit">
                    <i class="bi bi-pencil-fill"></i>
                </button>
                <button class="btn btn-sm btn-delete" onclick="deleteFood('${food._id}')" title="Delete">
                    <i class="bi bi-trash-fill"></i>
                </button>
            </td>
        </tr>
    `).join('');
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
                <button class="page-link" onclick="loadFoods(${current - 1})">&laquo;</button>
             </li>`;

    // Numbers
    for (let i = 1; i <= total; i++) {
        html += `<li class="page-item ${i === current ? 'active' : ''}">
                    <button class="page-link" onclick="loadFoods(${i})">${i}</button>
                 </li>`;
    }

    // Next
    html += `<li class="page-item ${current === total ? 'disabled' : ''}">
                <button class="page-link" onclick="loadFoods(${current + 1})">&raquo;</button>
             </li>`;

    pagination.innerHTML = html;
}

/**
 * Setup Modal (Add/Edit Logic)
 */
function setupModal() {
    const saveBtn = document.getElementById('saveFoodBtn');

    // Reset form on open
    document.getElementById('addFoodBtn').addEventListener('click', () => {
        document.getElementById('foodForm').reset();
        document.getElementById('foodId').value = '';
        document.getElementById('foodModalLabel').textContent = 'Add New Recipe';
        document.getElementById('imagePreview').src = '';
        document.getElementById('imagePreview').classList.add('d-none');
        document.getElementById('uploadPlaceholder').classList.remove('d-none');
    });

    // Save Action
    saveBtn.addEventListener('click', async () => {
        const id = document.getElementById('foodId').value;
        const title = document.getElementById('foodTitle').value;
        const category = document.getElementById('foodCategory').value;
        const description = document.getElementById('foodDescription').value;
        const instructions = document.getElementById('foodInstructions').value;
        const imageFile = document.getElementById('foodImage').files[0];

        if (!title || !description) {
            alert('Title and description are required.');
            return;
        }

        try {
            saveBtn.disabled = true;
            saveBtn.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span>Saving...';

            let imageUrl = '';
            let imagePublicId = '';

            // Upload Image if selected
            if (imageFile) {
                const uploadRes = await api.uploadImage(imageFile);
                imageUrl = uploadRes.data.url;
                imagePublicId = uploadRes.data.public_id;
            } else if (id) {
                // Keep existing image if editing
                const existing = currentFoods.find(f => f._id === id);
                imageUrl = existing.image_url;
                imagePublicId = existing.image_public_id;
            }

            const foodData = {
                title,
                category,
                description,
                instructions,
                image_url: imageUrl,
                image_public_id: imagePublicId
            };

            if (id) {
                await api.updateFood(id, foodData);
            } else {
                await api.createFood(foodData);
            }

            // Close Modal & Refresh
            const modal = bootstrap.Modal.getInstance(document.getElementById('foodModal'));
            modal.hide();
            loadFoods(currentPage);
            showToast('Recipe saved successfully!', 'success');

        } catch (error) {
            console.error('Save failed:', error);
            alert('Failed to save recipe. ' + (error.message || ''));
        } finally {
            saveBtn.disabled = false;
            saveBtn.innerHTML = 'Save Food';
        }
    });
}

/**
 * Open Edit Modal
 */
window.openEditModal = (id) => {
    const food = currentFoods.find(f => f._id === id);
    if (!food) return;

    document.getElementById('foodId').value = food._id;
    document.getElementById('foodTitle').value = food.title;
    document.getElementById('foodCategory').value = food.category || 'Traditional';
    document.getElementById('foodDescription').value = food.description;
    document.getElementById('foodInstructions').value = food.instructions || '';

    // Show Preview
    if (food.image_url) {
        const preview = document.getElementById('imagePreview');
        preview.src = food.image_url;
        preview.classList.remove('d-none');
        document.getElementById('uploadPlaceholder').classList.add('d-none');
    }

    document.getElementById('foodModalLabel').textContent = 'Edit Recipe';
    const modal = new bootstrap.Modal(document.getElementById('foodModal'));
    modal.show();
};

/**
 * Delete Food
 */
window.deleteFood = async (id) => {
    if (!confirm('Are you sure you want to delete this recipe?')) return;

    try {
        await api.deleteFood(id);
        loadFoods(currentPage);
        showToast('Recipe deleted.', 'info');
    } catch (error) {
        console.error('Delete failed:', error);
        alert('Failed to delete.');
    }
};

/**
 * Image Upload Preview
 */
function setupImageUpload() {
    const input = document.getElementById('foodImage');
    const preview = document.getElementById('imagePreview');
    const placeholder = document.getElementById('uploadPlaceholder');

    input.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                preview.src = e.target.result;
                preview.classList.remove('d-none');
                placeholder.classList.add('d-none');
            };
            reader.readAsDataURL(file);
        }
    });
}

// Helper: Toast (reuse or import if module)
function showToast(msg, type = 'info') {
    // Simple alert fallback if toast logic is complex for this file scope
    // Ideally use shared logic or create toast element dynamically
    alert(msg);
}

// Logout
document.getElementById('logoutBtn').addEventListener('click', async (e) => {
    e.preventDefault();
    await api.adminLogout();
    window.location.href = 'login.html';
});
