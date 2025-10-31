// amazon.js (Updated)

import { product } from "./product-data.js"; 
import { cart, addtocart } from "./cart.js"; 

// --- Infinite Scroll/Lazy Loading Setup ---
const PRODUCTS_PER_LOAD = 6; 
let currentProductIndex = 0; 
let isLoading = false; 
// NEW: Store the currently active list of products (full list or filtered)
let activeProductList = [...product]; 
let currentCategory = 'All'; // Track the currently selected category

// --- Initial Setup ---
updatecartquantity(); 
// Call loadProducts instead of loadMoreProducts directly
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

// --- Lazy Loading / Infinite Scroll Logic (Updated to use activeProductList) ---

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
  
  // Simulate network delay (optional, for testing the loader)
  setTimeout(() => {
    displayProducts(productsToLoad, true); // true = append
    currentProductIndex += PRODUCTS_PER_LOAD;
    isLoading = false;
    document.querySelector('.js-loading-indicator').style.display = 'none';
    
    // Check if more products are needed immediately (e.g., on a large screen)
    checkScrollPosition();
  }, 300); 
}


function checkScrollPosition() {
  // Only check scroll if we're not filtering by search
  const isSearching = document.querySelector('.Search').value !== '';
  if (isSearching) return;
  
  const isNearBottom = (window.innerHeight + window.scrollY) >= (document.body.offsetHeight - 100);
  
  if (isNearBottom) {
    loadMoreProducts();
  }
}

// Add the scroll event listener for infinite scroll
window.addEventListener('scroll', checkScrollPosition);
window.addEventListener('resize', checkScrollPosition); 

// --- NEW: Category Filtering Logic ---

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
  loadMoreProducts(); // Start the infinite scroll process for the new list
  
  // Optional: Highlight the active button (CSS required)
  document.querySelectorAll('.js-category-button').forEach(button => {
    button.style.fontWeight = button.dataset.category === category ? 'bold' : 'normal';
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
    // Temporarily disable infinite scroll while searching
    window.removeEventListener('scroll', checkScrollPosition);
    window.removeEventListener('resize', checkScrollPosition);
    document.querySelector('.js-loading-indicator').style.display = 'none';
    
    const searchTerm = event.target.value.toLowerCase(); 
    // Filter the *active* product list (which could be the full list or a category filter)
    const listToSearch = currentCategory === 'All' ? product : activeProductList;
    
    const filteredProducts = listToSearch.filter(productItem => { 
      return productItem.name1.toLowerCase().includes(searchTerm) || productItem.name2.toLowerCase().includes(searchTerm); 
    }); 
    
    displayProducts(filteredProducts, false); // false = overwrite content

    // If search is cleared, re-enable infinite scroll and reload initial view
    if (searchTerm === '') {
      // Re-enable category filter view with infinite scroll
      currentProductIndex = 0; 
      document.querySelector('.js-product').innerHTML = ''; 
      // Reset active list to the current category before calling loadMoreProducts
      if (currentCategory === 'All') {
        activeProductList = [...product];
      } else {
        activeProductList = product.filter(p => p.category === currentCategory);
      }
      loadMoreProducts();
      window.addEventListener('scroll', checkScrollPosition);
      window.addEventListener('resize', checkScrollPosition);
    }
  }); 
}