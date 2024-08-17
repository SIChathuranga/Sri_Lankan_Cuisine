document.addEventListener('DOMContentLoaded', function() {
    const commentsContainer = document.getElementById('commentsContainer');
    const commentForm = document.getElementById('commentForm');
    const commentModal = new bootstrap.Modal(document.getElementById('commentModal'));
    const pagination = document.getElementById('pagination');
    const darkModeToggle = document.getElementById('darkModeToggle');
    const searchInput = document.getElementById('searchInput');
    const searchButton = document.getElementById('searchButton');
    
    const itemsPerPage = 10;
    let currentPage = 1;
    let comments = [];
    let filteredComments = [];

    // Fetch comments from the server
    function fetchComments() {
        fetch('http://localhost:5000/comments')
            .then(response => {
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                return response.json();
            })
            .then(data => {
                comments = data;
                filteredComments = comments;
                renderComments();
                setupPagination();
            })
            .catch(error => {
                console.error('Error fetching comments:', error);
                commentsContainer.innerHTML = `<p class="text-danger">Error loading comments. Please try again later.</p>`;
            });
    }

    // Function to render comments for the current page
    function renderComments() {
        commentsContainer.innerHTML = '';
        const start = (currentPage - 1) * itemsPerPage;
        const end = start + itemsPerPage;
        const commentsToRender = filteredComments.slice(start, end);

        if (commentsToRender.length === 0) {
            commentsContainer.innerHTML = '<p>No comments found.</p>';
            return;
        }

        commentsToRender.forEach(comment => {
            const commentElement = document.createElement('div');
            commentElement.className = 'col-lg-4 col-md-6';
            commentElement.innerHTML = `
                <div class="comment-card">
                    <h5>${comment.name}</h5>
                    <p>${comment.email}</p>
                    <p>${comment.text}</p>
                    <div class="comment-actions">
                        <button class="btn btn-sm btn-primary btn-edit-comment" data-id="${comment.id}">
                            <i class="bi bi-pencil"></i> Edit
                        </button>
                        <button class="btn btn-sm btn-danger btn-delete-comment" data-id="${comment.id}">
                            <i class="bi bi-trash"></i> Delete
                        </button>
                    </div>
                </div>
            `;
            commentsContainer.appendChild(commentElement);
        });
    }

    // Function to setup pagination
    function setupPagination() {
        pagination.innerHTML = '';
        const totalPages = Math.ceil(filteredComments.length / itemsPerPage);

        for (let i = 1; i <= totalPages; i++) {
            const pageItem = document.createElement('li');
            pageItem.className = `page-item ${i === currentPage ? 'active' : ''}`;
            pageItem.innerHTML = `
                <button class="page-link" data-page="${i}">${i}</button>
            `;
            pagination.appendChild(pageItem);
        }
    }

    // Function to filter comments based on search
    function filterComments() {
        const searchTerm = searchInput.value.toLowerCase();
        filteredComments = comments.filter(comment => 
            comment.name.toLowerCase().includes(searchTerm) || 
            comment.email.toLowerCase().includes(searchTerm) || 
            comment.text.toLowerCase().includes(searchTerm)
        );
        currentPage = 1;
        renderComments();
        setupPagination();
    }

    // Add event listener for pagination
    pagination.addEventListener('click', (event) => {
        if (event.target.classList.contains('page-link')) {
            currentPage = parseInt(event.target.dataset.page);
            renderComments();
            setupPagination();
        }
    });

    // Add event listener for search functionality
    searchButton.addEventListener('click', filterComments);

    // Add event listener for dark mode toggle
    darkModeToggle.addEventListener('click', () => {
        const currentTheme = document.documentElement.getAttribute('data-bs-theme');
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        document.documentElement.setAttribute('data-bs-theme', newTheme);
        darkModeToggle.innerHTML = newTheme === 'dark' ? '<i class="bi bi-sun"></i> Light Mode' : '<i class="bi bi-moon"></i> Dark Mode';
    });

    // Add event listener for edit and delete buttons
    commentsContainer.addEventListener('click', (event) => {
        if (event.target.classList.contains('btn-edit-comment')) {
            const commentId = event.target.dataset.id;
            const comment = comments.find(c => c.id === parseInt(commentId));
            populateForm(comment);
            commentModal.show();
        } else if (event.target.classList.contains('btn-delete-comment')) {
            const commentId = event.target.dataset.id;
            if (confirm('Are you sure you want to delete this comment?')) {
                deleteComment(commentId);
            }
        }
    });

    // Function to populate the form with comment data
    function populateForm(comment) {
        document.getElementById('commentId').value = comment.id;
        document.getElementById('commentName').value = comment.name;
        document.getElementById('commentEmail').value = comment.email;
        document.getElementById('commentText').value = comment.text;
    }

    // Handle comment form submission
    commentForm.addEventListener('submit', (event) => {
        event.preventDefault();
        const commentId = document.getElementById('commentId').value;
        const name = document.getElementById('commentName').value;
        const email = document.getElementById('commentEmail').value;
        const text = document.getElementById('commentText').value;

        updateComment(commentId, name, email, text);
    });

    // Function to update a comment
    function updateComment(id, name, email, text) {
        fetch(`http://localhost:5000/admin/comments/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ name, email, text }),
        })
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json();
        })
        .then(() => {
            fetchComments();
            commentModal.hide();
        })
        .catch(error => console.error('Error updating comment:', error));
    }

    // Function to delete a comment
    function deleteComment(id) {
        fetch(`http://localhost:5000/admin/comments/${id}`, {
            method: 'DELETE',
        })
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json();
        })
        .then(() => {
            fetchComments();
        })
        .catch(error => console.error('Error deleting comment:', error));
    }

    // Initial fetch of comments
    fetchComments();
});