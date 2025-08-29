


import { cart, addtocart } from "./cart.js";
export let product = [{
  id: 244341,
  image: 'image-waffle-desktop.jpg',
  name1: 'waffle',
  name2: 'waffle with berries',
  pricecent: 1090
},
{
  id: 244342,
  image: 'image-creme-brulee-desktop.jpg',
  name1: 'Vanilla Bean',
  name2: 'Vanilla Bean Creme Brulee',
  pricecent: 700
},
{
  id: 244343,
  image: 'image-macaron-desktop.jpg',
  name1: 'Macaron',
  name2: 'Macaron Mix Of Five',
  pricecent: 800
},
{
  id: 244344,
  image: 'image-tiramisu-desktop.jpg',
  name1: 'Tiramisu',
  name2: 'Classic Tiramisu',
  pricecent: 550
},
{
  id: 244345,
  image: 'image-baklava-desktop.jpg',
  name1: 'Baklava',
  name2: 'Pistacho Baklava',
  pricecent: 400
}, {
  id: 244346,
  image: 'image-meringue-desktop.jpg',
  name1: ' Pie',
  name2: 'Lemon Meringue pie',
  pricecent: 500
},
{
  id: 244347,
  image: 'image-cake-desktop.jpg',
  name1: ' Cake',
  name2: 'Red Valvet Cake ',
  pricecent: 450
},
{
  id: 244348,
  image: 'image-brownie-desktop.jpg',
  name1: ' Brownie',
  name2: 'Salted Caramel Brownie ',
  pricecent: 550
},
{
  id: 244349,
  image: 'image-panna-cotta-desktop.jpg',
  name1: ' Panna Cotta',
  name2: 'Vanilla Panna Cotta',
  pricecent: 650
},
{
  id: 2443410,
  image: 'pexels-ella-olsson-572949-3026810.jpg',
  name1: ' Panna Cotta',
  name2: 'Vanilla Panna Cotta',
  pricecent: 870
},
{
  id: 2443411,
  image: 'pexels-ella-olsson-572949-3026811.jpg',
  name1: ' Panna Cotta',
  name2: 'chocolate Panna Cotta',
  pricecent: 900
},
{
  id: 2443412,
  image: 'pexels-ella-olsson-572949-3026806.jpg',
  name1: ' Cake',
  name2: 'chocolate cake Cotta',
  pricecent:700
}
];

document.addEventListener('DOMContentLoaded', () => {
  // Initial display of all products

  
// Function to generate and display product HTML
function displayProducts(productsToDisplay) {
  let producthtml = '';
  productsToDisplay.forEach((product) => {
    producthtml += `
      <div class="subdiv1">
        <div class="divimage">
          <img src="${product.image}" class="image">
          <button class="addtocartbutton addto" data-productid="${product.name2}">
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

  document.querySelector('.js-product').innerHTML =producthtml;
  setupAddToCartButtons(); // Re-attach event listeners to new buttons
}

  displayProducts(product);

  // Handle the search functionality
  const searchInput = document.querySelector('.Search');
  // ... rest of the code
  searchInput.addEventListener('input', (event) => {
  const searchTerm = event.target.value.toLowerCase();
  const filteredProducts = product.filter(productItem => {
    return productItem.name1.toLowerCase().includes(searchTerm) || productItem.name2.toLowerCase().includes(searchTerm);
  });
  displayProducts(filteredProducts);
});
});





function updatecartquantity(){
     let cartquantity = 0;
      cart.forEach((item) => {
        cartquantity += item.quantity;
      });
      document.querySelector('.number').innerHTML = cartquantity;
      console.log(cartquantity);
      console.log(cart);
}
// Function to set up "Add to Cart" button listeners
function setupAddToCartButtons() {
  document.querySelectorAll('.addto').forEach((button) => {
    button.addEventListener('click', () => {
      let productid = button.dataset.productid;
addtocart(productid)
 updatecartquantity()
    });
  });
}

