// confirmation.js
import dayjs from 'https://unpkg.com/dayjs@1.11.10/esm/index.js'; 

/**
 * Utility to get URL parameters from the query string.
 * @param {string} name - The name of the parameter.
 * @returns {string | null}
 */
function getUrlParam(name) {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get(name);
}

/**
 * Provides a simplified tracking progress for display.
 * @param {string} status - The current order status.
 * @returns {{percentage: number, label: string}}
 */
function getTrackingProgress(status) {
  // Simple status mapping for visualization
  switch (status) {
    case 'Order Placed':
      return { percentage: 25, label: 'Order Confirmed' };
    case 'Processing':
      return { percentage: 50, label: 'Being Prepared' };
    case 'Shipped':
      return { percentage: 75, label: 'Out for Delivery' };
    case 'Delivered':
      return { percentage: 100, label: 'Delivered' };
    default:
      return { percentage: 10, label: 'Pending' };
  }
}

/**
 * Renders the order details and tracking status on the confirmation page.
 */
function renderOrderConfirmation() {
  const orderId = getUrlParam('orderId');
  const orders = JSON.parse(localStorage.getItem('orders')) || [];
  // Find the order that was just placed
  const order = orders.find(o => o.id === orderId);

  // Assuming you have an empty div with class .js-order-confirmation-container 
  // on your confirmation.html page
  const container = document.querySelector('.js-order-confirmation-container');

  if (!container) {
    console.error("Confirmation container (.js-order-confirmation-container) not found.");
    return;
  }

  if (!order) {
    container.innerHTML = '<h1>Order Not Found 🙁</h1><p>We couldn\'t load the details for this order. Please check your order history or go back to <a href="index.html">shopping</a>.</p>';
    return;
  }

  // --- HTML Generation for the Confirmation/Tracking Page ---
  let itemsHtml = '';
  order.items.forEach(item => {
    const productPrice = `$${(item.priceCent / 100).toFixed(2)}`;
    itemsHtml += `
      <div class="tracking-item-card">
        <div class="tracking-item-image-container">
          <img src="${item.image}" alt="${item.name}" class="tracking-item-image">
        </div>
        <div class="tracking-item-details">
          <div class="tracking-item-name">${item.name}</div>
          <div class="tracking-item-quantity">Quantity: ${item.quantity}</div>
          <div class="tracking-item-price">${productPrice}</div>
          <div class="tracking-item-delivery">Estimated Delivery: <strong class="delivery-date">${item.deliveryDate}</strong></div>
        </div>
      </div>
    `;
  });

  const totalDisplay = `$${(order.totalCents / 100).toFixed(2)}`;
  const tracking = getTrackingProgress(order.trackingStatus);
  
  const confirmationHtml = `
    <h1>🎉 Order Confirmed!</h1>
    <p class="summary-line">Thank you for your order. We've saved the details for your tracking!</p>
    <p><strong>Order ID:</strong> <span class="order-id-display">${order.id}</span></p>
    <p><strong>Order Date:</strong> ${dayjs(order.date).format('MMMM D, YYYY')}</p>
    <p><strong>Total Charged:</strong> <span class="order-total-display">${totalDisplay}</span></p>

    <div class="tracking-section">
      <h2>Order Status & Tracking</h2>
      
      <div class="tracking-progress-bar">
        <div class="progress-indicator" style="width: ${tracking.percentage}%;"></div>
      </div>
      <div class="tracking-status-label">
        Current Status: <strong class="status-text">${tracking.label}</strong>
      </div>
    </div>
    
    <div class="items-section">
      <h2>Items Ordered (${order.items.length})</h2>
      <div class="tracking-items-grid">
        ${itemsHtml}
      </div>
    </div>
    
    <div class="return-home">
      <a href="index.html" class="continue-shopping-link">⬅️ Continue Shopping</a>
    </div>
  `;

  container.innerHTML = confirmationHtml;
}

document.addEventListener('DOMContentLoaded', renderOrderConfirmation);