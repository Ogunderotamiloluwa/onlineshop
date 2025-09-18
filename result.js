import { cart, removefromcart } from "./cart.js";
import { product } from "./product-data.js";

function renderordersummary() {
  let cartsummaryHtml = '';

  cart.forEach((cartitem) => {
    const productId = cartitem.productId;
    let matchingproduct;

    product.forEach((products) => {
      if (products.id === productId) {
        matchingproduct = products;
      }
    });

    if (matchingproduct) {
      cartsummaryHtml += `
        <div class="suball1 js-suball1-${matchingproduct.id}">
          <div class="delivery-date-container">
            Delivery date: Sunday, Sep 22
          </div>
          <div class="suball1-content">
            <div class="suball1-product-info">
              <div class="suball1-img-container">
                <img src="${matchingproduct.image}" alt="${matchingproduct.name2}" class="suball1-img">
              </div>
              <div class="suball1-details">
                <div class="product-name">${matchingproduct.name2}</div>
                <div class="product-price">$${(matchingproduct.pricecent / 100).toFixed(2)}</div>
                <div class="quantity-text">Quantity: ${cartitem.quantity}</div>
                <div class="action-links">
                  <span class="update-delete-link update-quantity-link">Update</span>
                  <span class="update-delete-link delete-quantity-link" data-product-del="${matchingproduct.id}">Delete</span>
                </div>
              </div>
            </div>
            <div class="suball1-delivery-options">
              <div class="delivery-option-group">
                <label class="delivery-option-label">
                  <input type="radio" name="delivery-option-${matchingproduct.id}" checked>
                  Get it Sunday, Sep 22
                </label>
                <div class="delivery-cost">FREE Shipping</div>
              </div>
              <div class="delivery-option-group">
                <label class="delivery-option-label">
                  <input type="radio" name="delivery-option-${matchingproduct.id}">
                  Get it Sunday, Sep 28
                </label>
                <div class="delivery-cost">$9.22 Shipping</div>
              </div>
              <div class="delivery-option-group">
                <label class="delivery-option-label">
                  <input type="radio" name="delivery-option-${matchingproduct.id}">
                  Get it Friday, Sep 20
                </label>
                <div class="delivery-cost">$4.99 - Shipping</div>
              </div>
            </div>
          </div>
        </div>
      `;
    }
  });

  document.querySelector('.js-order-summary').innerHTML = cartsummaryHtml;

  document.querySelectorAll('.delete-quantity-link').forEach((link) => {
    link.addEventListener('click', () => {
      const productId = Number(link.dataset.productDel);
      removefromcart(productId);
      const container = document.querySelector(`.js-suball1-${productId}`);
      if (container) {
        container.remove();
      }
      updatePaymentSummary();
    });
  });

  updatePaymentSummary();
}

function updatePaymentSummary() {
  let itemPriceCents = 0;
  let shippingPriceCents = 0;

  cart.forEach((cartitem) => {
    let matchingproduct;
    product.forEach((products) => {
      if (products.id === cartitem.productId) {
        matchingproduct = products;
      }
    });

    if (matchingproduct) {
      itemPriceCents += matchingproduct.pricecent * cartitem.quantity;
      shippingPriceCents += 0; // Assuming free shipping is default
    }
  });

  const totalBeforeTaxCents = itemPriceCents + shippingPriceCents;
  const taxCents = totalBeforeTaxCents * 0.1;
  const totalCents = totalBeforeTaxCents + taxCents;

  document.querySelector('.js-payment-item-price').innerHTML = `$${(itemPriceCents / 100).toFixed(2)}`;
  document.querySelector('.js-payment-shipping-price').innerHTML = `$${(shippingPriceCents / 100).toFixed(2)}`;
  document.querySelector('.js-payment-total-before-tax').innerHTML = `$${(totalBeforeTaxCents / 100).toFixed(2)}`;
  document.querySelector('.js-payment-tax').innerHTML = `$${(taxCents / 100).toFixed(2)}`;
  document.querySelector('.js-payment-total').innerHTML = `$${(totalCents / 100).toFixed(2)}`;
}

// Initial render
renderordersummary();