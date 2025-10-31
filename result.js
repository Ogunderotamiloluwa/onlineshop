import { cart, removefromcart, updateCartQuantity, updateDeliveryOption } from "./cart.js";
import { product as allProducts } from "./product-data.js";
import { deliveryOptions, getDeliveryOption } from "./deliveryOptions.js";
import dayjs from 'https://unpkg.com/dayjs@1.11.10/esm/index.js'; 
import { paymentsummary } from "./payment.summary.js";
import "./backend-practice.js"

// Call the payment summary function once on load
paymentsummary()

// ---------------------------------------------------------------------
// 📦 NEW/MODIFIED STEP-FLOW FUNCTIONS 📦
// ---------------------------------------------------------------------

/**
 * Extracts delivery details from the form inputs for final order submission.
 * @returns {object | null} An object with delivery details, or null if validation fails.
 */
function getDeliveryDetailsFromForm() {
    const fullName = document.getElementById('fullName')?.value.trim();
    const phone = document.getElementById('phone')?.value.trim();
    const streetAddress = document.getElementById('streetAddress')?.value.trim();
    const apartment = document.getElementById('apartment')?.value.trim();
    const city = document.getElementById('city')?.value.trim();

    // The HTML form 'required' handles front-end validation, but this is a safe backend check
    if (!fullName || !phone || !streetAddress || !city) {
        // Since this is triggered by a form submit, the browser's required validation should fire first.
        alert('Please fill in all required delivery details.');
        return null;
    }

    return {
        fullName,
        phone,
        streetAddress,
        apartment: apartment || 'N/A',
        city
    };
}

/**
 * Handles the process of placing an order, saves the payment method and delivery info, and redirects.
 * @param {string} paymentMethod - 'COD' or 'Transfer'.
 * @param {object} deliveryInfo - The validated delivery details.
 */
function placeOrder(paymentMethod, deliveryInfo) { 
  const orderSummaryElement = document.querySelector('.js-order-summary');

  if (cart.length === 0) {
    if (orderSummaryElement) {
      orderSummaryElement.innerHTML = '<p style="color: red;">Your cart is empty. Please add items before placing an order.</p>';
    }
    console.error('Attempted to place an order with an empty cart.');
    return;
  }
  
  const orderId = generateOrderId();
  const orderDate = dayjs().format('MMMM D, YYYY h:mm A');
  const items = [];
  
  cart.forEach(cartItem => {
    const matchingProduct = getProduct(cartItem.productId);
    const deliveryOption = getDeliveryOption(cartItem.deliveryOptionId);

    if (matchingProduct) {
      items.push({
        productId: cartItem.productId,
        quantity: cartItem.quantity,
        name: matchingProduct.name2,
        priceCent: matchingProduct.pricecent,
        image: matchingProduct.image,
        deliveryDate: getDeliveryDate(deliveryOption.deliveryDays),
        deliveryOptionId: cartItem.deliveryOptionId
      });
    }
  });

  const order = {
    id: orderId,
    date: orderDate,
    items: items,
    totalCents: calculateTotalCents(),
    trackingStatus: 'Order Placed',
    paymentMethod: paymentMethod, 
    deliveryInfo: deliveryInfo // Save the validated details
  };
  
  // 1. Get existing orders from localStorage
  let orders = JSON.parse(localStorage.getItem('orders')) || [];
  
  // 2. Add the new order
  orders.push(order);
  
  // 3. Save the updated list back to localStorage
  localStorage.setItem('orders', JSON.stringify(orders));

  // 4. Redirect based on the payment method
  if (paymentMethod === 'Transfer') {
    const totalDollars = (order.totalCents / 100).toFixed(2);
    window.location.href = `transfer.html?orderId=${orderId}&total=${totalDollars}`;
  } else { 
    window.location.href = `confirmation.html?orderId=${orderId}`; 
  }
}

// ---------------------------------------------------------------------
// 📦 CORE HELPER FUNCTIONS (Completed) 📦
// ---------------------------------------------------------------------

/**
 * Generates a unique order ID using timestamp and random number.
 * @returns {string}
 */
function generateOrderId() {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

/**
 * Finds a product object based on its ID.
 * @param {number} productId 
 * @returns {object | undefined}
 */
function getProduct(productId) {
  let matchingProduct;
  allProducts.forEach((p) => { 
    if (p.id === productId) {
      matchingProduct = p;
    }
  });
  return matchingProduct;
}

/**
 * Calculates the next non-weekend delivery date.
 * @param {number} deliveryDays - The number of days until delivery.
 * @returns {string} Formatted date string (e.g., "Thursday, December 1").
 */
function getDeliveryDate(deliveryDays) {
  const today = dayjs();
  let deliveryDate = today.add(deliveryDays, 'days');
  while (deliveryDate.day() === 0 || deliveryDate.day() === 6) {
    deliveryDate = deliveryDate.add(1, 'day');
  }
  return deliveryDate.format('dddd, MMMM D');
}

/**
 * Updates the total number of items displayed in the header.
 * @returns {number} The total quantity of items in the cart.
 */
function updateItemsCount() {
  let totalItems = 0;
  cart.forEach((item) => {
    totalItems += item.quantity;
  });
  const itemsCountText = totalItems === 1 ? '(1 item)' : `(${totalItems} items)`;
  const itemsCountElement = document.querySelector('.items-count');
  if (itemsCountElement) {
    itemsCountElement.textContent = itemsCountText;
  }
  return totalItems;
}

/**
 * Generates the HTML for delivery options for a single cart item.
 * @param {object} matchingProduct - The product object.
 * @param {object} cartItem - The cart item object.
 * @returns {string} HTML string of delivery options.
 */
function deliveryOptionsHTML(matchingProduct, cartItem) {
  let html = '';

  deliveryOptions.forEach((option) => {
    const isChecked = option.id === cartItem.deliveryOptionId;
    const dateString = getDeliveryDate(option.deliveryDays);
    const priceString = option.priceCents === 0 
      ? 'FREE Shipping' 
      : `$${(option.priceCents / 100).toFixed(2)} - Shipping`;

    html += `
      <div class="delivery-option-group">
        <label class="delivery-option-label">
          <input type="radio" 
            ${isChecked ? 'checked' : ''}
            name="delivery-option-${matchingProduct.id}" 
            data-product-id="${matchingProduct.id}"
            data-delivery-option-id="${option.id}"
            class="js-delivery-option">
          <div>
            <div class="delivery-date">${dateString}</div>
            <div class="delivery-cost">${priceString}</div>
          </div>
        </label>
      </div>
    `;
  });
  return html;
}

/**
 * Calculates the total cost of the cart in cents (items + shipping + tax).
 * @returns {number} Total cost in cents.
 */
function calculateTotalCents() {
  let itemPriceCents = 0;
  let shippingPriceCents = 0;

  cart.forEach((cartItem) => {
    const matchingProduct = getProduct(cartItem.productId);
    const deliveryOption = getDeliveryOption(cartItem.deliveryOptionId);

    if (matchingProduct) {
      itemPriceCents += matchingProduct.pricecent * cartItem.quantity;
      shippingPriceCents += deliveryOption.priceCents;
    }
  });
  
  const totalBeforeTaxCents = itemPriceCents + shippingPriceCents;
  const taxCents = Math.round(totalBeforeTaxCents * 0.1); 
  const totalCents = totalBeforeTaxCents + taxCents;
  
  return totalCents;
}

/**
 * Updates the payment summary section with calculated totals.
 */
function updatePaymentSummary() {
  let itemPriceCents = 0;
  let shippingPriceCents = 0;

  cart.forEach((cartItem) => {
    const matchingProduct = getProduct(cartItem.productId);
    const deliveryOption = getDeliveryOption(cartItem.deliveryOptionId);

    if (matchingProduct) {
      itemPriceCents += matchingProduct.pricecent * cartItem.quantity;
      shippingPriceCents += deliveryOption.priceCents;
    }
  });

  const totalBeforeTaxCents = itemPriceCents + shippingPriceCents;
  const taxCents = Math.round(totalBeforeTaxCents * 0.1);
  const totalCents = totalBeforeTaxCents + taxCents;

  if (document.querySelector('.js-payment-item-price')) {
    document.querySelector('.js-payment-item-price').innerHTML = `$${(itemPriceCents / 100).toFixed(2)}`;
    document.querySelector('.js-payment-shipping-price').innerHTML = `$${(shippingPriceCents / 100).toFixed(2)}`;
    document.querySelector('.js-payment-total-before-tax').innerHTML = `$${(totalBeforeTaxCents / 100).toFixed(2)}`;
    document.querySelector('.js-payment-tax').innerHTML = `$${(taxCents / 100).toFixed(2)}`;
    document.querySelector('.js-payment-total').innerHTML = `$${(totalCents / 100).toFixed(2)}`;
  }
}

/**
 * Renders the order summary (cart items) on the checkout page.
 */
export function renderOrderSummary() {
  let cartSummaryHtml = '';
  const totalItems = updateItemsCount();

  if (totalItems === 0) {
    document.querySelector('.js-order-summary').innerHTML = '<p>Your cart is empty. <a href="index.html">Go shopping!</a></p>';
    updatePaymentSummary();
    const placeOrderButton = document.querySelector('.js-place-order-button');
    if (placeOrderButton) placeOrderButton.style.display = 'none';
    return;
  }

  cart.forEach((cartItem) => {
    const matchingProduct = getProduct(cartItem.productId);
    const deliveryOption = getDeliveryOption(cartItem.deliveryOptionId);
    const deliveryDateString = getDeliveryDate(deliveryOption.deliveryDays);
    
    if (matchingProduct) {
      cartSummaryHtml += `
        <div class="suball1 js-suball1-${matchingProduct.id}">
          <div class="delivery-date-container">
            Estimated Delivery: <span class="js-delivery-date-${matchingProduct.id}">${deliveryDateString}</span>
          </div>
          <div class="suball1-content">
            <div class="suball1-product-info">
              <div class="suball1-img-container">
                <img src="${matchingProduct.image}" alt="${matchingProduct.name2}" class="suball1-img">
              </div>
              <div class="suball1-details">
                <div class="product-name">${matchingProduct.name2}</div>
                <div class="product-price">$${(matchingProduct.pricecent / 100).toFixed(2)}</div>
                <div class="quantity-container">
                  <div class="quantity-text">Quantity: </div>
                  <input type="number" class="quantity-input" value="${cartItem.quantity}" 
                    min="0" max="99" data-product-id="${matchingProduct.id}">
                </div>
                <div class="action-links">
                  <span class="update-delete-link update-quantity-link" data-product-id="${matchingProduct.id}">Update</span>
                  <span class="update-delete-link delete-quantity-link" data-product-del="${matchingProduct.id}">Delete</span>
                </div>
              </div>
            </div>
            <div class="suball1-delivery-options">
              ${deliveryOptionsHTML(matchingProduct, cartItem)}
            </div>
          </div>
        </div>
      `;
    }
  });

  document.querySelector('.js-order-summary').innerHTML = cartSummaryHtml;
  
  const continueShoppingHtml = `
    <div class="continue-shopping-link-container" style="margin-top: 20px; text-align: center;">
      <a href="index.html" class="continue-shopping-button">← Continue Shopping</a>
    </div>
  `;
  document.querySelector('.js-order-summary').insertAdjacentHTML('beforeend', continueShoppingHtml);
  
  attachEventListeners();
  updatePaymentSummary();
}


// ---------------------------------------------------------------------
// 📦 MODIFIED EVENT LISTENERS (Completed) 📦
// ---------------------------------------------------------------------

function attachEventListeners() {
    
  const deliveryFormStep = document.querySelector('.js-delivery-form-step');

  // Listener for delete buttons
  document.querySelectorAll('.delete-quantity-link').forEach((link) => {
    link.addEventListener('click', () => {
      const productId = Number(link.dataset.productDel);
      removefromcart(productId);
      renderOrderSummary(); 
    });
  });

  // Listener for update buttons
  document.querySelectorAll('.update-quantity-link').forEach((link) => {
    link.addEventListener('click', () => {
      const productId = Number(link.dataset.productId);
      const quantityInput = document.querySelector(`.quantity-input[data-product-id="${productId}"]`);
      const newQuantity = Number(quantityInput.value);
      
      if (newQuantity >= 0 && newQuantity <= 99) {
        updateCartQuantity(productId, newQuantity);
        renderOrderSummary();
      } else {
        console.error('Quantity must be between 0 and 99.');
        const cartItem = cart.find(item => item.productId === productId);
        quantityInput.value = cartItem ? cartItem.quantity : 1; 
      }
    });
  });

  // Listener for delivery option radios
  document.querySelectorAll('.js-delivery-option').forEach((radio) => {
    radio.addEventListener('change', (event) => {
      const productId = Number(event.target.dataset.productId);
      const deliveryOptionId = event.target.dataset.deliveryOptionId;
      
      updateDeliveryOption(productId, deliveryOptionId);
      
      const deliveryOption = getDeliveryOption(deliveryOptionId);
      const deliveryDateString = getDeliveryDate(deliveryOption.deliveryDays);
      document.querySelector(`.js-delivery-date-${productId}`).textContent = deliveryDateString;

      updatePaymentSummary();
    });
  });


  // ** MODIFIED: Place Order button to SHOW the delivery form step **
  const placeOrderButton = document.querySelector('.js-place-order-button');
  
  if (placeOrderButton) {
    placeOrderButton.addEventListener('click', () => {
      if (cart.length > 0 && deliveryFormStep) {
        // Show the delivery form step (the modal)
        deliveryFormStep.style.display = 'flex';
      } else if (cart.length === 0) {
        alert('Your cart is empty. Please add items before placing an order.');
      }
    });
  }

  // ** NEW LISTENER: Final submission is attached to the delivery form **
  const finalDeliveryForm = document.querySelector('.js-delivery-form');
  
  if (finalDeliveryForm) {
    finalDeliveryForm.addEventListener('submit', (event) => {
      event.preventDefault(); // Stop the form from submitting normally
      
      const deliveryInfo = getDeliveryDetailsFromForm();
      
      if (deliveryInfo) {
        // 1. Get selected payment method
        const selectedPaymentRadio = document.querySelector('.js-payment-method:checked');
        const paymentMethod = selectedPaymentRadio ? selectedPaymentRadio.dataset.method : 'COD';
        
        // 2. Hide the form
        if (deliveryFormStep) deliveryFormStep.style.display = 'none';

        // 3. Finalize the order and redirect (Place Order)
        placeOrder(paymentMethod, deliveryInfo);
      }
    });
  }
}

// Initial render
renderOrderSummary();



  