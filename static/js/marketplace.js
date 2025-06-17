// Marketplace JavaScript functionality
let currentPage = 1;
let productsPerPage = 12;
let allProducts = [];
let filteredProducts = [];

// Initialize the page
document.addEventListener('DOMContentLoaded', function() {
    // In a real application, this would fetch from Flask backend
    loadProducts();
    setupEventListeners();
});

// Setup event listeners
function setupEventListeners() {
    // Search functionality
    document.getElementById('searchInput').addEventListener('input', debounce(searchProducts, 300));
    
    // Filter change listeners
    document.querySelectorAll('input[name="category"]').forEach(input => {
        input.addEventListener('change', applyFilters);
    });
    
    document.getElementById('minPrice').addEventListener('input', debounce(applyFilters, 300));
    document.getElementById('maxPrice').addEventListener('input', debounce(applyFilters, 300));
    
    // Add product form
    document.getElementById('addProductForm').addEventListener('submit', handleAddProduct);
    
    // Modal close on overlay click
    document.getElementById('addProductModal').addEventListener('click', function(e) {
        if (e.target === this) {
            closeAddProductModal();
        }
    });
}

// Load products (simulates Flask backend call)
async function loadProducts() {
    showLoading();
    
    const response = await fetch('/api/products');
    allProducts = await response.json();
    filteredProducts = [...allProducts];
    console.log(allProducts);
    hideLoading();
    renderProducts();
    updateResultsCount();
}

// Show loading state
function showLoading() {
    document.getElementById('loadingState').style.display = 'block';
    document.getElementById('productsGrid').style.display = 'none';
    document.getElementById('emptyState').style.display = 'none';
}

// Hide loading state
function hideLoading() {
    document.getElementById('loadingState').style.display = 'none';
    document.getElementById('productsGrid').style.display = 'grid';
}

// Render products
function renderProducts() {
    console.log(filteredProducts);
    const grid = document.getElementById('productsGrid');
    const startIndex = (currentPage - 1) * productsPerPage;
    const endIndex = startIndex + productsPerPage;
    const productsToShow = filteredProducts.slice(startIndex, endIndex);
    
    if (productsToShow.length === 0) {
        grid.style.display = 'none';
        document.getElementById('emptyState').style.display = 'block';
        document.getElementById('pagination').style.display = 'none';
        return;
    }
    
    document.getElementById('emptyState').style.display = 'none';
    document.getElementById('pagination').style.display = 'flex';
    
    grid.innerHTML = productsToShow.map(product => `
        <div class="product-card" onclick="viewProduct('${product.id}')">
            <div class="product-image">${product.image}</div>
            <div class="product-info">
                <h3 class="product-title">${product.prod_name}</h3>
                <div class="product-price">₹${product.price.toLocaleString()}</div>
                <div class="product-meta">
                    <span class="product-seller">by ${product.seller}</span>
                </div>
            </div>
        </div>
    `).join('');
    
    renderPagination();
}

// Search products
function searchProducts() {
    const query = document.getElementById('searchInput').value.toLowerCase().trim();
    
    if (query === '') {
        filteredProducts = [...allProducts];
    } else {
        filteredProducts = allProducts.filter(product => 
            product.title.toLowerCase().includes(query) ||
            product.description.toLowerCase().includes(query) ||
            product.category.toLowerCase().includes(query)
        );
    }
    
    currentPage = 1;
    renderProducts();
    updateResultsCount();
}

// Apply filters
function applyFilters() {
    let filtered = [...allProducts];
    
    // Category filter
    const selectedCategories = Array.from(document.querySelectorAll('input[name="category"]:checked'))
        .map(input => parseInt(input.value));
    
    if (!selectedCategories.includes(0)) {
        filtered = filtered.filter(product => selectedCategories.includes(product.cat));
    }

    // Price range filter
    const minPrice = parseFloat(document.getElementById('minPrice').value) || 0;
    const maxPrice = parseFloat(document.getElementById('maxPrice').value) || Infinity;
    
    filtered = filtered.filter(product => 
        product.price >= minPrice && product.price <= maxPrice
    );
    
    // Apply search query if exists
    const query = document.getElementById('searchInput').value.toLowerCase().trim();
    if (query) {
        filtered = filtered.filter(product => 
            product.prod_name.toLowerCase().includes(query) ||
            product.desc.toLowerCase().includes(query) ||
            product.cat.toLowerCase().includes(query)
        );
    }
    
    filteredProducts = filtered;
    currentPage = 1;
    renderProducts();
    updateResultsCount();
}

// Clear all filters
function clearFilters() {
    // Reset category filters
    document.querySelectorAll('input[name="category"]').forEach(input => {
        input.checked = input.value === 'all';
    });
    
    // Reset condition filter
    document.querySelector('input[name="condition"][value="all"]').checked = true;
    
    // Reset price inputs
    document.getElementById('minPrice').value = '';
    document.getElementById('maxPrice').value = '';
    
    // Reset search
    document.getElementById('searchInput').value = '';
    
    // Apply filters
    applyFilters();
}

// Sort products
function sortProducts() {
    const sortBy = document.getElementById('sortBy').value;
    
    switch (sortBy) {
        case 'newest':
            filteredProducts.sort((a, b) => new Date(b.dateAdded) - new Date(a.dateAdded));
            break;
        case 'price-low':
            filteredProducts.sort((a, b) => a.price - b.price);
            break;
        case 'price-high':
            filteredProducts.sort((a, b) => b.price - a.price);
            break;
        case 'alphabetical':
            filteredProducts.sort((a, b) => a.title.localeCompare(b.title));
            break;
    }
    
    currentPage = 1;
    renderProducts();
}

// Update results count
function updateResultsCount() {
    const count = filteredProducts.length;
    const resultsText = count === 1 ? '1 product found' : `${count} products found`;
    document.getElementById('resultsCount').textContent = resultsText;
}

// Pagination
function renderPagination() {
    const totalPages = Math.ceil(filteredProducts.length / productsPerPage);
    const pageNumbers = document.getElementById('pageNumbers');
    
    // Update prev/next buttons
    document.querySelector('.prev-btn').disabled = currentPage === 1;
    document.querySelector('.next-btn').disabled = currentPage === totalPages;
    
    // Render page numbers
    let paginationHTML = '';
    const maxVisiblePages = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
    
    if (endPage - startPage + 1 < maxVisiblePages) {
        startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }
    
    for (let i = startPage; i <= endPage; i++) {
        paginationHTML += `
            <button class="page-number ${i === currentPage ? 'active' : ''}" 
                    onclick="goToPage(${i})">${i}</button>
        `;
    }
    
    pageNumbers.innerHTML = paginationHTML;
}

function previousPage() {
    if (currentPage > 1) {
        currentPage--;
        renderProducts();
    }
}

function nextPage() {
    const totalPages = Math.ceil(filteredProducts.length / productsPerPage);
    if (currentPage < totalPages) {
        currentPage++;
        renderProducts();
    }
}

function goToPage(page) {
    currentPage = page;
    renderProducts();
}

// Product actions
function viewProduct(productId) {
    const product = allProducts.find(p => p.id === productId);
    if (product) {
        alert(`Product Details:\n\nTitle: ${product.title}\nPrice: ₹${product.price.toLocaleString()}\nCondition: ${formatCondition(product.condition)}\nDescription: ${product.description}\nSeller: ${product.seller}\nContact: ${product.contact}`);
    }
}

// Modal functions
function showAddProductModal() {
    document.getElementById('addProductModal').style.display = 'flex';
    document.body.style.overflow = 'hidden';
}

function closeAddProductModal() {
    document.getElementById('addProductModal').style.display = 'none';
    document.body.style.overflow = 'auto';
    document.getElementById('addProductForm').reset();
}

// Handle add product form submission
async function handleAddProduct(e) {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    const newProduct = {
        prod_name: document.getElementById('productTitle').value,
        cat: parseInt(document.getElementById('productCategory').value),
        price: parseInt(document.getElementById('productPrice').value),
        desc: document.getElementById('productDescription').value,
        seller: sessionStorage.getItem("name"), 
        seller_no: document.getElementById('sellerContact').value,
        image: getCategoryIcon(document.getElementById('productCategory').value),
        pref: document.getElementById('pref').value,
        negotiable: document.getElementById('negotiable').value
    };
    
    await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newProduct)
    });
    
    // For demo, add to local array
    allProducts.unshift(newProduct);
    applyFilters(); // Refresh the display
    
    closeAddProductModal();
    alert('Product added successfully!');
}

// Get category icon
function getCategoryIcon(category) {
    const icons = {
        'electronics': '📱',
        'books': '📚',
        'bicycles': '🚴',
        'furniture': '🪑',
        'clothing': '👕',
        'sports': '⚽'
    };
    return icons[category] || '📦';
}

// Utility function for debouncing
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Smooth scroll to top when navigating pages
function scrollToTop() {
    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });
}

// Add scroll to top on page navigation
const originalGoToPage = goToPage;
goToPage = function(page) {
    originalGoToPage(page);
    scrollToTop();
};

const originalPreviousPage = previousPage;
previousPage = function() {
    originalPreviousPage();
    scrollToTop();
};

const originalNextPage = nextPage;
nextPage = function() {
    originalNextPage();
    scrollToTop();
};

