document.addEventListener('DOMContentLoaded', function() {
    const foodContainer = document.getElementById('food-cards-container');
    const pagination = document.getElementById('pagination');
    const darkModeToggle = document.getElementById('darkModeToggle');
    const searchInput = document.getElementById('searchInput');
    const searchButton = document.getElementById('searchButton');
    const body = document.body;

    const cardsPerPage = 12;
    let currentPage = 1;
    let foods = [];
    let filteredFoods = [];

    function fetchFoods() {
        fetch('http://localhost:5000/foods')
            .then(response => response.json())
            .then(data => {
                foods = data;
                filteredFoods = [...foods];
                displayFoods(currentPage);
                setupPagination();
            })
            .catch(error => {
                console.error('Error fetching food data:', error);
                foodContainer.innerHTML = '<p class="col-12">Failed to load food data. Please try again later.</p>';
            });
    }

    function displayFoods(page) {
        const startIndex = (page - 1) * cardsPerPage;
        const endIndex = startIndex + cardsPerPage;
        const foodsToDisplay = filteredFoods.slice(startIndex, endIndex);

        foodContainer.innerHTML = '';

        foodsToDisplay.forEach(food => {
            const foodCard = document.createElement('div');
            foodCard.className = 'col';
            foodCard.innerHTML = `
                <div class="card h-100">
                    <img src="${food.image_url}" class="card-img-top" alt="${food.name}">
                    <div class="card-body">
                        <h5 class="card-title">${food.name}</h5>
                        <p class="card-text">${food.description}</p>
                    </div>
                </div>
            `;
            foodContainer.appendChild(foodCard);
        });
    }

    function setupPagination() {
        const pageCount = Math.ceil(filteredFoods.length / cardsPerPage);
        pagination.innerHTML = '';

        // Previous button
        const prevLi = createPaginationItem('Previous', '&laquo;', () => {
            if (currentPage > 1) {
                currentPage--;
                changePage(currentPage);
            }
        });
        pagination.appendChild(prevLi);

        // Numbered pages
        for (let i = 1; i <= pageCount; i++) {
            const li = createPaginationItem(i, i, () => {
                currentPage = i;
                changePage(currentPage);
            });
            pagination.appendChild(li);
        }

        // Next button
        const nextLi = createPaginationItem('Next', '&raquo;', () => {
            if (currentPage < pageCount) {
                currentPage++;
                changePage(currentPage);
            }
        });
        pagination.appendChild(nextLi);

        updatePagination();
    }

    function createPaginationItem(ariaLabel, innerHTML, onClick) {
        const li = document.createElement('li');
        li.className = 'page-item';
        const a = document.createElement('a');
        a.className = 'page-link';
        a.href = '#';
        a.setAttribute('aria-label', ariaLabel);
        a.innerHTML = innerHTML;
        a.addEventListener('click', (event) => {
            event.preventDefault();
            onClick();
        });
        li.appendChild(a);
        return li;
    }

    function updatePagination() {
        const items = pagination.getElementsByClassName('page-item');
        for (let i = 1; i < items.length - 1; i++) {
            const item = items[i];
            item.classList.toggle('active', i === currentPage);
        }
    }

    function changePage(page) {
        currentPage = page;
        displayFoods(currentPage);
        updatePagination();
    }

    searchButton.addEventListener('click', () => {
        const query = searchInput.value.toLowerCase();
        filteredFoods = foods.filter(food => food.name.toLowerCase().includes(query));
        currentPage = 1;
        displayFoods(currentPage);
        setupPagination();
    });

    searchInput.addEventListener('keydown', (event) => {
        if (event.key === 'Enter') {
            searchButton.click();
        }
    });

    darkModeToggle.addEventListener('click', () => {
        body.classList.toggle('dark-mode');
        const icon = darkModeToggle.querySelector('i');
        icon.classList.toggle('bi-moon-fill');
        icon.classList.toggle('bi-sun-fill');
    });

    fetchFoods();
});
