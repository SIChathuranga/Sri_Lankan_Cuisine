document.addEventListener('DOMContentLoaded', function () {
    const commentsContainer = document.getElementById('commentsContainer');
    const commentForm = document.getElementById('commentForm');
    const nameInput = document.getElementById('nameInput');
    const emailInput = document.getElementById('emailInput');
    const textInput = document.getElementById('textInput');
    const darkModeToggle = document.getElementById('darkModeToggle');
    const body = document.body;

    const API_URL = 'http://localhost:5000'; // Update this with your actual API URL
    const FOOD_ID = 1; // Update this with the actual food ID you want to display comments for

    async function fetchComments() {
        try {
            const response = await fetch(`${API_URL}/foods/${FOOD_ID}/comments`);
            const comments = await response.json();
            renderComments(comments);
        } catch (error) {
            console.error('Error fetching comments:', error);
        }
    }

    function renderComments(comments) {
        commentsContainer.innerHTML = '';
        comments.forEach(comment => {
            const commentElement = document.createElement('div');
            commentElement.classList.add('be-comment');
            commentElement.innerHTML = `
                <div class="be-img-comment">	
                    <a href="#">
                        <img src="https://bootdey.com/img/Content/avatar/avatar${comment.id % 8 + 1}.png" alt="" class="be-ava-comment">
                    </a>
                </div>
                <div class="be-comment-content">
                    <span class="be-comment-name">
                        <a href="#">${comment.name}</a>
                    </span>
                    <span class="be-comment-time">
                        <i class="bi bi-clock"></i>
                        ${new Date(comment.timestamp).toLocaleString()}
                    </span>
                    <p class="be-comment-text">${comment.text}</p>
                </div>
            `;
            commentsContainer.appendChild(commentElement);
        });
    }

    commentForm.addEventListener('submit', async function (e) {
        e.preventDefault();
        const newComment = {
            name: nameInput.value,
            email: emailInput.value,
            text: textInput.value
        };
        try {
            const response = await fetch(`${API_URL}/foods/${FOOD_ID}/comments`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(newComment)
            });
            if (response.ok) {
                commentForm.reset();
                fetchComments(); // Refresh comments after adding a new one
            } else {
                console.error('Error adding comment:', await response.text());
            }
        } catch (error) {
            console.error('Error adding comment:', error);
        }
    });

    darkModeToggle.addEventListener('click', function () {
        body.classList.toggle('dark-mode');
        if (body.classList.contains('dark-mode')) {
            darkModeToggle.innerHTML = '<i class="bi bi-sun-fill"></i> Light Mode';
        } else {
            darkModeToggle.innerHTML = '<i class="bi bi-moon-fill"></i> Dark Mode';
        }
    });

    fetchComments(); // Initial fetch of comments
});