import { product } from "./product-data.js"; 
import { cart, addtocart } from "./cart.js"; 

// --- Infinite Scroll/Lazy Loading Setup ---
const PRODUCTS_PER_LOAD = 6; 
let currentProductIndex = 0; 
let isLoading = false; 
let activeProductList = [...product]; 
let currentCategory = 'All'; 

// --- Initial Setup ---
updatecartquantity(); 
// Call loadProducts to start the instant load and setup listeners
loadProducts(currentCategory); 

// --- Core Functions ---

// Function to update the cart quantity on the page 
function updatecartquantity() { 
    let cartquantity = 0; 
    cart.forEach((item) => { 
        cartquantity += item.quantity; 
    }); 
    document.querySelector('.number').innerHTML = cartquantity; 
} 

// Function to generate and display product HTML 
function displayProducts(productsToDisplay, append = false) { 
    let producthtml = ''; 
    productsToDisplay.forEach((product) => { 
        producthtml += ` 
            <div class="subdiv1"> 
                <div class="divimage"> 
                    <img src="${product.image}" class="image" loading="lazy"> 
                    <button class="addtocartbutton addto" data-productid="${product.id}"> 
                        <img src="icon-add-to-cart.svg"> 
                        Add to Cart 
                    </button> 
                </div> 
                <div class="divtext"> 
                    <nav class="text1">${product.name1}</nav> 
                    <nav class="text2">${product.name2}</nav> 
                    <nav class="text3"> $ ${(product.pricecent / 100).toFixed(2)}</nav> 
                </div> 
            </div> 
        `; 
    }); 

    const productContainer = document.querySelector('.js-product');
    if (append) {
        productContainer.insertAdjacentHTML('beforeend', producthtml);
    } else {
        productContainer.innerHTML = producthtml; 
    }

    setupAddToCartButtons(); 
} 

// Function to set up "Add to Cart" button listeners 
function setupAddToCartButtons() { 
    document.querySelectorAll('.addto').forEach((button) => { 
        // Re-attach listeners to all buttons, including newly added ones
        const newButton = button.cloneNode(true);
        button.parentNode.replaceChild(newButton, button);
        
        newButton.addEventListener('click', () => { 
            let productId = Number(newButton.dataset.productid); 
            addtocart(productId); 
            updatecartquantity(); 
        }); 
    }); 
} 

// --- Lazy Loading / Infinite Scroll Logic (Updated to be synchronous for instant load) ---

function loadMoreProducts() {
    // Use the activeProductList for total length and slicing
    if (currentProductIndex >= activeProductList.length || isLoading) {
        if (currentProductIndex >= activeProductList.length) {
            document.querySelector('.js-loading-indicator').style.display = 'none';
        }
        return;
    }

    isLoading = true;
    document.querySelector('.js-loading-indicator').style.display = 'block';

    const productsToLoad = activeProductList.slice(
        currentProductIndex, 
        currentProductIndex + PRODUCTS_PER_LOAD
    );
    
    // *** 💥 KEY CHANGE: Removed setTimeout for instant rendering of the first batch ***
    displayProducts(productsToLoad, true); // true = append

    currentProductIndex += PRODUCTS_PER_LOAD;
    isLoading = false;
    document.querySelector('.js-loading-indicator').style.display = 'none';
    
    // Check if more products are needed immediately (e.g., on a large screen)
    checkScrollPosition();
}


function checkScrollPosition() {
    // Only check scroll if we're not filtering by search
    const isSearching = document.querySelector('.Search').value !== '';
    if (isSearching) return;
    
    // Check if the bottom of the page is within 100px of the viewport
    const isNearBottom = (window.innerHeight + window.scrollY) >= (document.body.offsetHeight - 100);
    
    if (isNearBottom) {
        // Load the next batch immediately if the page isn't full
        loadMoreProducts();
    }
}

// Add the scroll event listener for infinite scroll
window.addEventListener('scroll', checkScrollPosition);
window.addEventListener('resize', checkScrollPosition); 

// --- Category Filtering Logic ---

function filterProductsByCategory(category) {
    currentCategory = category;
    // 1. Set the active list based on the category
    if (category === 'All') {
        activeProductList = [...product]; // Copy of the full list
    } else {
        activeProductList = product.filter(p => p.category === category);
    }
    
    // 2. Reset and load the new list
    currentProductIndex = 0; // Reset index
    document.querySelector('.js-product').innerHTML = ''; // Clear content
    
    // Load the first batch instantly
    const initialLoad = activeProductList.slice(0, PRODUCTS_PER_LOAD);
    displayProducts(initialLoad, false); // false = overwrite content
    currentProductIndex += PRODUCTS_PER_LOAD;

    // Check if we need to load more to fill the screen
    checkScrollPosition();
    
    // Optional: Highlight the active button (CSS required)
    document.querySelectorAll('.js-category-button').forEach(button => {
        button.classList.remove('active');
        if (button.dataset.category === category) {
            button.classList.add('active');
        }
    });
}

function setupCategoryListeners() {
    document.querySelectorAll('.js-category-button').forEach(button => {
        button.addEventListener('click', (event) => {
            const category = event.target.dataset.category;
            // Temporarily disable search logic event listeners
            document.querySelector('.Search').value = ''; 
            
            filterProductsByCategory(category);
            
            // Scroll to the top to see the new products
            window.scrollTo(0, 0); 
        });
    });
}

// Function to call the filter and scroll setup at the start
function loadProducts(initialCategory) {
    filterProductsByCategory(initialCategory);
    setupCategoryListeners(); // Set up category buttons
}

// --- Search Functionality (Modified to work with activeProductList) ---

const searchInput = document.querySelector('.Search'); 
if (searchInput) { 
    searchInput.addEventListener('input', (event) => { 
        const searchTerm = event.target.value.toLowerCase(); 
        
        // Remove infinite scroll events during search
        window.removeEventListener('scroll', checkScrollPosition);
        window.removeEventListener('resize', checkScrollPosition);
        document.querySelector('.js-loading-indicator').style.display = 'none';
        
        // Filter the *active* product list (full list or category)
        const listToSearch = currentCategory === 'All' ? product : activeProductList;
        
        const filteredProducts = listToSearch.filter(productItem => { 
            return productItem.name1.toLowerCase().includes(searchTerm) || productItem.name2.toLowerCase().includes(searchTerm); 
        }); 
        
        displayProducts(filteredProducts, false); // false = overwrite content

        // If search is cleared, revert back to the category view with infinite scroll
        if (searchTerm === '') {
            // Re-enable infinite scroll logic
            filterProductsByCategory(currentCategory); 
            window.addEventListener('scroll', checkScrollPosition);
            window.addEventListener('resize', checkScrollPosition);
        }
    }); 
}