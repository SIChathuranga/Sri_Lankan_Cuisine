document.addEventListener('DOMContentLoaded', function() {
    const foodList = document.getElementById('foodList');
    const foodForm = document.getElementById('foodForm');
    const foodModal = new bootstrap.Modal(document.getElementById('foodModal'));
    const pagination = document.getElementById('pagination');
    const darkModeToggle = document.getElementById('darkModeToggle');
    const searchInput = document.getElementById('searchInput');
    const searchButton = document.getElementById('searchButton');
    const logoutButton = document.getElementById('logoutBtn');
    const logoutMessage = document.getElementById('logoutMessage');

    const itemsPerPage = 12;
    let currentPage = 1;
    let foods = [];
    let filteredFoods = [];

    function fetchFoods() {
        fetch('http://localhost:5000/foods')
            .then(response => response.json())
            .then(data => {
                foods = data;
                filteredFoods = [...foods];
                displayFoods();
                setupPagination();
            })
            .catch(error => console.error('Error:', error));
    }

    function displayFoods() {
        const startIndex = (currentPage - 1) * itemsPerPage;
        const endIndex = startIndex + itemsPerPage;
        const foodsToDisplay = filteredFoods.slice(startIndex, endIndex);

        foodList.innerHTML = '';
        foodsToDisplay.forEach(food => {
            const foodCard = createFoodCard(food);
            foodList.appendChild(foodCard);
        });
    }

    function createFoodCard(food) {
        const col = document.createElement('div');
        col.className = 'col';
        col.innerHTML = `
            <div class="card h-100 food-card">
                <img src="${food.image_url}" class="card-img-top food-image" alt="${food.name}">
                <div class="card-body">
                    <h5 class="card-title">${food.name}</h5>
                    <p class="card-text">${food.description}</p>
                </div>
                <div class="card-footer">
                    <button class="btn btn-sm btn-primary btn-edit" data-id="${food.id}">
                        <i class="bi bi-pencil"></i> Edit
                    </button>
                    <button class="btn btn-sm btn-danger btn-delete" data-id="${food.id}">
                        <i class="bi bi-trash"></i> Delete
                    </button>
                </div>
            </div>
        `;
        return col;
    }

    function setupPagination() {
        const pageCount = Math.ceil(filteredFoods.length / itemsPerPage);
        pagination.innerHTML = '';

        for (let i = 1; i <= pageCount; i++) {
            const li = document.createElement('li');
            li.className = `page-item ${i === currentPage ? 'active' : ''}`;
            li.innerHTML = `<a class="page-link" href="#">${i}</a>`;
            li.addEventListener('click', (e) => {
                e.preventDefault();
                currentPage = i;
                displayFoods();
                updatePagination();
            });
            pagination.appendChild(li);
        }
    }

    function updatePagination() {
        const pageItems = pagination.querySelectorAll('.page-item');
        pageItems.forEach((item, index) => {
            item.classList.toggle('active', index + 1 === currentPage);
        });
    }

    foodForm.addEventListener('submit', function(e) {
        e.preventDefault();
        const foodId = document.getElementById('foodId').value;
        const foodData = {
            name: document.getElementById('name').value,
            description: document.getElementById('description').value,
            image_url: document.getElementById('image_url').value
        };

        if (foodId) {
            updateFood(foodId, foodData);
        } else {
            addFood(foodData);
        }
    });

    function addFood(foodData) {
        fetch('http://localhost:5000/foods', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(foodData),
        })
        .then(response => response.json())
        .then(data => {
            console.log('Success:', data);
            foodModal.hide();
            fetchFoods();
        })
        .catch((error) => {
            console.error('Error:', error);
        });
    }

    function updateFood(id, foodData) {
        fetch(`http://localhost:5000/foods/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(foodData),
        })
        .then(response => response.json())
        .then(data => {
            console.log('Success:', data);
            foodModal.hide();
            fetchFoods();
        })
        .catch((error) => {
            console.error('Error:', error);
        });
    }

    function deleteFood(id) {
        if (confirm('Are you sure you want to delete this food item?')) {
            fetch(`http://localhost:5000/foods/${id}`, {
                method: 'DELETE',
            })
            .then(response => response.json())
            .then(data => {
                console.log('Success:', data);
                fetchFoods();
            })
            .catch((error) => {
                console.error('Error:', error);
            });
        }
    }

    foodList.addEventListener('click', function(e) {
        if (e.target.classList.contains('btn-edit') || e.target.parentElement.classList.contains('btn-edit')) {
            const foodId = e.target.closest('.btn-edit').dataset.id;
            editFood(foodId);
        } else if (e.target.classList.contains('btn-delete') || e.target.parentElement.classList.contains('btn-delete')) {
            const foodId = e.target.closest('.btn-delete').dataset.id;
            deleteFood(foodId);
        }
    });

    function editFood(id) {
        fetch(`http://localhost:5000/foods/${id}`)
            .then(response => response.json())
            .then(food => {
                document.getElementById('foodId').value = food.id;
                document.getElementById('name').value = food.name;
                document.getElementById('description').value = food.description;
                document.getElementById('image_url').value = food.image_url;
                document.getElementById('modalTitle').textContent = 'Edit Food';
                foodModal.show();
            })
            .catch((error) => {
                console.error('Error:', error);
            });
    }

    document.getElementById('foodModal').addEventListener('hidden.bs.modal', function () {
        foodForm.reset();
        document.getElementById('foodId').value = '';
        document.getElementById('modalTitle').textContent = 'Add Food';
    });

    // Dark mode toggle
    darkModeToggle.addEventListener('click', function() {
        const html = document.documentElement;
        if (html.getAttribute('data-bs-theme') === 'dark') {
            html.setAttribute('data-bs-theme', 'light');
            this.innerHTML = '<i class="bi bi-moon"></i> Dark Mode';
        } else {
            html.setAttribute('data-bs-theme', 'dark');
            this.innerHTML = '<i class="bi bi-sun"></i> Light Mode';
        }
    });

    // Search functionality
    function searchFoods() {
        const searchTerm = searchInput.value.toLowerCase();
        filteredFoods = foods.filter(food => 
            food.name.toLowerCase().includes(searchTerm) || 
            food.description.toLowerCase().includes(searchTerm)
        );
        currentPage = 1;
        displayFoods();
        setupPagination();
    }

    searchButton.addEventListener('click', searchFoods);
    searchInput.addEventListener('keyup', function(e) {
        if (e.key === 'Enter') {
            searchFoods();
        }
    });

    fetchFoods();

    // Logout button event listener with null check
    if (logoutButton) {
        logoutButton.addEventListener('click', async () => {
            try {
                const response = await fetch('http://localhost:5000/admin/logout', {
                    method: 'POST',
                    credentials: 'include' // This is necessary to include cookies in the request
                });

                if (!response.ok) {
                    throw new Error('Logout failed');
                }

                const result = await response.json();
                console.log(result.message); // Logged out successfully
                
                // Display a logout message
                if (logoutMessage) {
                    logoutMessage.textContent = 'Logged out successfully. Redirecting to login page...';
                }

                // Wait for a moment to display the message before redirecting
                setTimeout(() => {
                    window.location.href = '/admin/login.html'; // Navigate to the login page
                }, 1000); // 2 seconds delay

            } catch (error) {
                console.error('Error:', error);
                if (logoutMessage) {
                    logoutMessage.textContent = 'An error occurred during logout: ' + error.message;
                }
            }
        });
    } else {
        console.error('Logout button not found.');
    }
});
