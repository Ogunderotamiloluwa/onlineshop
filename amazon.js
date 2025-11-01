// amazon.js

import { product } from "./product-data.js"; 
import { cart, addtocart } from "./cart.js"; 

// --- Setup ---
let activeProductList = [...product]; 
let currentCategory = 'All'; 

// --- Initial Setup ---
updatecartquantity(); 
loadProducts('All'); 

// --- Core Functions ---

function updatecartquantity() { 
    let cartquantity = 0; 
    cart.forEach((item) => { 
        cartquantity += item.quantity; 
    }); 
    const cartElement = document.querySelector('.number');
    if (cartElement) {
        cartElement.innerHTML = cartquantity; 
    }
} 

function displayProducts(productsToDisplay) { 
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
    productContainer.innerHTML = producthtml; 
    
    const loadingIndicator = document.querySelector('.js-loading-indicator');
    if (loadingIndicator) {
        loadingIndicator.style.display = 'none';
    }

    setupAddToCartButtons(); 
} 

function setupAddToCartButtons() { 
    document.querySelectorAll('.addto').forEach((button) => { 
        const newButton = button.cloneNode(true);
        button.parentNode.replaceChild(newButton, button);
        
        newButton.addEventListener('click', () => { 
            let productId = Number(newButton.dataset.productid); 
            addtocart(productId); 
            updatecartquantity(); 
        }); 
    }); 
} 

// --- Category Filtering Logic (Instant Full Display) ---

function filterProductsByCategory(category) {
    currentCategory = category;
    
    if (category === 'All') {
        activeProductList = [...product]; 
    } else {
        activeProductList = product.filter(p => p.category === category);
    }
    
    displayProducts(activeProductList); 

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
            
            const searchInput = document.querySelector('.Search');
            if (searchInput) {
                 searchInput.value = ''; 
            }
            
            filterProductsByCategory(category);
            window.scrollTo(0, 0); 
        });
    });
}

function loadProducts(initialCategory) {
    filterProductsByCategory(initialCategory);
    setupCategoryListeners(); 
}

// --- Search Functionality ---

const searchInput = document.querySelector('.Search'); 
if (searchInput) { 
    searchInput.addEventListener('input', (event) => { 
        const searchTerm = event.target.value.toLowerCase(); 
        
        const listToSearch = currentCategory === 'All' ? product : activeProductList;
        
        const filteredProducts = listToSearch.filter(productItem => { 
            return productItem.name1.toLowerCase().includes(searchTerm) || productItem.name2.toLowerCase().includes(searchTerm); 
        }); 
        
        displayProducts(filteredProducts); 

        if (searchTerm === '') {
            filterProductsByCategory(currentCategory); 
        }
    }); 
}