// amazon.js

import { product } from "./product-data.js"; 
import { cart, addtocart } from "./cart.js"; 

// --- Setup ---
let activeProductList = [...product]; 
let currentCategory = 'All'; 

// --- Initial Setup Execution ---
document.addEventListener('DOMContentLoaded', () => {
    updatecartquantity(); 
    loadProducts('All'); 
});


// --- Core Functions ---

/**
 * Calculates the total quantity in the cart and updates all display elements.
 */
function updatecartquantity() { 
    let cartquantity = 0; 
    cart.forEach((item) => { 
        cartquantity += item.quantity; 
    }); 
    
    // Select ALL elements with the cart quantity class
    const cartElements = document.querySelectorAll('.js-cart-quantity'); 
    
    if (cartElements.length > 0) {
        cartElements.forEach(element => {
            element.innerHTML = cartquantity; 
        });
    }
} 

/**
 * Generates and displays the HTML for the specified list of products.
 * @param {Array} productsToDisplay - The list of products to render.
 */
function displayProducts(productsToDisplay) { 
    let producthtml = ''; 
    productsToDisplay.forEach((product) => { 
        // Price is converted from Kobo (pricecent) to Naira (₦)
        const priceNaira = (product.pricecent / 100).toFixed(2);
        
        producthtml += ` 
            <div class="subdiv1"> 
                <div class="divimage"> 
                    <img src="${product.image}" alt="${product.name1} ${product.name2}" class="image" loading="lazy"> 
                    <button class="addtocartbutton addto" data-productid="${product.id}"> 
                        <img src="icon-add-to-cart.svg"> 
                        Add to Cart 
                    </button> 
                </div> 
                <div class="divtext"> 
                    <nav class="text1">${product.name1}</nav> 
                    <nav class="text2">${product.name2}</nav> 
                    <nav class="text3"> ₦ ${priceNaira}</nav> 
                </div> 
            </div> 
        `; 
    }); 

    const productContainer = document.querySelector('.js-product');
    if (productContainer) {
        productContainer.innerHTML = producthtml; 
        setupAddToCartButtons(); 
    }
} 

/**
 * Sets up event listeners for all 'Add to Cart' buttons.
 */
function setupAddToCartButtons() { 
    // Use event delegation or check for button existence
    document.querySelectorAll('.addto').forEach((button) => { 
        // Remove and re-add listeners to prevent duplication
        const oldButton = button;
        const newButton = oldButton.cloneNode(true);
        oldButton.parentNode.replaceChild(newButton, oldButton);

        newButton.addEventListener('click', () => { 
            let productId = Number(newButton.dataset.productid); 
            addtocart(productId); 
            updatecartquantity(); 
        }); 
    }); 
} 

// --- Category Filtering Logic ---

/**
 * Filters the product list by the selected category and updates the display.
 * @param {string} category - The category to filter by ('All', 'Cloth', etc.).
 */
function filterProductsByCategory(category) {
    currentCategory = category;
    
    if (category === 'All') {
        activeProductList = [...product]; 
    } else {
        activeProductList = product.filter(p => p.category === category);
    }
    
    displayProducts(activeProductList); 

    // Update the visual active state of the category buttons
    document.querySelectorAll('.js-category-button').forEach(button => {
        button.classList.remove('active');
        if (button.dataset.category === category) {
            button.classList.add('active');
        }
    });
}

/**
 * Attaches click listeners to all category buttons.
 */
function setupCategoryListeners() {
    document.querySelectorAll('.js-category-button').forEach(button => {
        button.addEventListener('click', (event) => {
            const category = event.target.dataset.category;
            
            // Clear search input when switching categories
            const searchInput = document.querySelector('.Search');
            if (searchInput) {
                 searchInput.value = ''; 
            }
            
            filterProductsByCategory(category);
            window.scrollTo(0, 0); // Scroll to top after filter
        });
    });
}

/**
 * Initiates the product loading and listener setup.
 * @param {string} initialCategory - The category to load on startup.
 */
function loadProducts(initialCategory) {
    filterProductsByCategory(initialCategory);
    setupCategoryListeners(); 
    setupSearchFunctionality(); 
}

// --- Search Functionality ---
function setupSearchFunctionality() {
    const searchInput = document.querySelector('.Search'); 
    if (searchInput) { 
        searchInput.addEventListener('input', (event) => { 
            const searchTerm = event.target.value.toLowerCase(); 
            
            // Decide which list to search based on the currently selected category
            const listToSearch = currentCategory === 'All' ? product : product.filter(p => p.category === currentCategory);
            
            const filteredProducts = listToSearch.filter(productItem => { 
                // Search in name1 OR name2
                return productItem.name1.toLowerCase().includes(searchTerm) || productItem.name2.toLowerCase().includes(searchTerm); 
            }); 
            
            displayProducts(filteredProducts); 

            // If search is cleared, reset to the current category view
            if (searchTerm === '') {
                filterProductsByCategory(currentCategory); 
            }
        }); 
    }
}