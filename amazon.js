import { product } from "./product-data.js";
import { cart, addtocart } from "./cart.js";

// Initialize cart quantity display when page loads
updatecartquantity();

// Function to generate and display product HTML
function displayProducts(productsToDisplay) {


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
  document.querySelector('.js-product').innerHTML = producthtml;
  setupAddToCartButtons();
}

// Function to update the cart quantity on the page
function updatecartquantity() {
  let cartquantity = 0;
  cart.forEach((item) => {
    cartquantity += item.quantity;
  });
  document.querySelector('.number').innerHTML = cartquantity;
}

// Function to set up "Add to Cart" button listeners
function setupAddToCartButtons() {
  document.querySelectorAll('.addto').forEach((button) => {
    button.addEventListener('click', () => {
      let productId = Number(button.dataset.productid);
      addtocart(productId);
      updatecartquantity();
    });
  });
}

// Handle the search functionality
const searchInput = document.querySelector('.Search');
searchInput.addEventListener('input', (event) => {
  const searchTerm = event.target.value.toLowerCase();
  const filteredProducts = product.filter(productItem => {
    return productItem.name1.toLowerCase().includes(searchTerm) || productItem.name2.toLowerCase().includes(searchTerm);
  });
  displayProducts(filteredProducts);
});

// Initial render when the page loads
document.addEventListener('DOMContentLoaded', () => {
  displayProducts(product);
  updatecartquantity();
});