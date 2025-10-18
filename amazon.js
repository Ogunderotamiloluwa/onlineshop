// amazon.js (or main.js, as per your comment)

import { product } from "./product-data.js"; // Assume 'product' is your full array of products
import { cart, addtocart } from "./cart.js"; 

// --- Infinite Scroll/Lazy Loading Setup ---
const PRODUCTS_PER_LOAD = 6; // Load 6 products at a time
let currentProductIndex = 0; // Start at the beginning
let isLoading = false; // Flag to prevent multiple loads at once

// --- Initial Setup ---
updatecartquantity(); // Initialize cart quantity display

// Load the first batch of products immediately
loadMoreProducts(); 

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
          <img src="${product.image}" class="image"> 
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
    // Append new products for infinite scroll
    productContainer.insertAdjacentHTML('beforeend', producthtml);
  } else {
    // Replace content for initial load or search results
    productContainer.innerHTML = producthtml; 
  }

  setupAddToCartButtons(); 
} 

// Function to set up "Add to Cart" button listeners 
function setupAddToCartButtons() { 
  document.querySelectorAll('.addto').forEach((button) => { 
    // Clear existing listeners to prevent duplicates after appending
    const newButton = button.cloneNode(true);
    button.parentNode.replaceChild(newButton, button);
    
    newButton.addEventListener('click', () => { 
      let productId = Number(newButton.dataset.productid); 
      addtocart(productId); 
      updatecartquantity(); 
    }); 
  }); 
} 

// --- Lazy Loading / Infinite Scroll Logic ---

function loadMoreProducts() {
  // Stop if all products are loaded or if a load is already in progress
  if (currentProductIndex >= product.length || isLoading) {
    // Hide the loader if all products are loaded
    if (currentProductIndex >= product.length) {
       document.querySelector('.js-loading-indicator').style.display = 'none';
    }
    return;
  }

  isLoading = true;
  document.querySelector('.js-loading-indicator').style.display = 'block';

  const productsToLoad = product.slice(
    currentProductIndex, 
    currentProductIndex + PRODUCTS_PER_LOAD
  );
  
  // Simulate network delay (optional, for testing the loader)
  setTimeout(() => {
    displayProducts(productsToLoad, true); // true = append
    currentProductIndex += PRODUCTS_PER_LOAD;
    isLoading = false;
    document.querySelector('.js-loading-indicator').style.display = 'none';
    
    // Check if more products are needed immediately (e.g., on a large screen)
    checkScrollPosition();
  }, 300); // Wait 300ms before loading
}


function checkScrollPosition() {
  // Check if the user has scrolled to the bottom (within 100px)
  const isNearBottom = (window.innerHeight + window.scrollY) >= (document.body.offsetHeight - 100);
  
  if (isNearBottom) {
    loadMoreProducts();
  }
}

// Add the scroll event listener for infinite scroll
window.addEventListener('scroll', checkScrollPosition);
window.addEventListener('resize', checkScrollPosition); // Also check on resize

// --- Search Functionality (Modified to work with full product list) ---

const searchInput = document.querySelector('.Search'); 
if (searchInput) { 
  searchInput.addEventListener('input', (event) => { 
    // Temporarily disable infinite scroll while searching
    window.removeEventListener('scroll', checkScrollPosition);
    window.removeEventListener('resize', checkScrollPosition);
    document.querySelector('.js-loading-indicator').style.display = 'none';
    
    const searchTerm = event.target.value.toLowerCase(); 
    const filteredProducts = product.filter(productItem => { 
      // Filter the *entire* product array for the search
      return productItem.name1.toLowerCase().includes(searchTerm) || productItem.name2.toLowerCase().includes(searchTerm); 
    }); 
    
    displayProducts(filteredProducts, false); // false = overwrite content

    // If search is cleared, re-enable infinite scroll and reload initial view
    if (searchTerm === '') {
      currentProductIndex = 0; // Reset index
      document.querySelector('.js-product').innerHTML = ''; // Clear content
      loadMoreProducts();
      window.addEventListener('scroll', checkScrollPosition);
      window.addEventListener('resize', checkScrollPosition);
    }
  }); 
}