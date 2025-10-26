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

// ---------------------------------------------------------------------
// NEW FUNCTION FOR TIME-BASED TRACKING PROGRESS
// ---------------------------------------------------------------------

/**
 * Calculates a time-based tracking percentage for a given item.
 * The progress increases day by day until the fixed delivery date.
 * @param {string} orderDateStr - The date the order was placed (e.g., "October 26, 2025 10:29 PM").
 * @param {string} deliveryDateStr - The fixed, estimated delivery date (e.g., "Thursday, November 7").
 * @returns {{percentage: number, label: string, status: string}}
 */
function calculateTimeBasedProgress(orderDateStr, deliveryDateStr) {
  // 1. Define key dates
  // dayjs is smart enough to parse the full 'MMMM D, YYYY h:mm A' order date string
  const orderDate = dayjs(orderDateStr);
  const currentDate = dayjs();
  
  // To parse the delivery date ('dddd, MMMM D'), we need to ensure it's referenced to the 
  // correct year, especially if it's a cross-year delivery (e.g., Dec to Jan).
  let deliveryDate = dayjs(deliveryDateStr, 'dddd, MMMM D');

  // Simple fix: if the parsed delivery date is before the order date (meaning it defaulted 
  // to the current year when it should be next year), adjust the year.
  if (deliveryDate.isBefore(orderDate, 'day')) {
      deliveryDate = deliveryDate.add(1, 'year');
  }

  // 2. Calculate time span and elapsed time
  // Total milliseconds between order and delivery
  const totalDurationMs = deliveryDate.diff(orderDate);
  
  // Elapsed milliseconds between order and now
  const elapsedDurationMs = currentDate.diff(orderDate);
  
  // 3. Calculate percentage and status
  let percentage = 0;
  let status = 'Order Placed';
  let label = 'Order Confirmed';

  if (totalDurationMs > 0) {
    percentage = (elapsedDurationMs / totalDurationMs) * 100;
  }
  
  // Clamp the percentage between 0 and 100
  percentage = Math.max(0, Math.min(100, percentage));

  // Determine the status label based on progress
  if (percentage >= 100) {
      status = 'Delivered';
      label = 'Delivered';
      percentage = 100; // Ensure it's exactly 100 once "delivered"
  } else if (percentage > 70) {
      status = 'Shipped';
      label = 'Out for Delivery';
  } else if (percentage > 30) {
      status = 'Processing';
      label = 'Being Prepared';
  }
  
  return { percentage: Math.round(percentage), label, status };
}

// NOTE: The original getTrackingProgress is no longer needed, it has been removed.

// ---------------------------------------------------------------------
// RENDER FUNCTION (MODIFIED)
// ---------------------------------------------------------------------

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
  
  // Iterate through items to create an individual tracking bar for each
  order.items.forEach(item => {
    const productPrice = `$${(item.priceCent / 100).toFixed(2)}`;
    
    // Use the new function to get the dynamic tracking progress
    const tracking = calculateTimeBasedProgress(order.date, item.deliveryDate);
    
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
          
          <div class="item-tracking-section">
            <div class="tracking-progress-bar">
              <div class="progress-indicator" style="width: ${tracking.percentage}%;"></div>
            </div>
            <div class="tracking-status-label">
              Status: <strong class="status-text">${tracking.label}</strong> (${tracking.percentage}%)
            </div>
          </div>
          </div>
      </div>
    `;
  });

  const totalDisplay = `$${(order.totalCents / 100).toFixed(2)}`;
  
  const confirmationHtml = `
    <h1>🎉 Order Confirmed!</h1>
    <p class="summary-line">Thank you for your order. We've saved the details for your tracking!</p>
    <p><strong>Order ID:</strong> <span class="order-id-display">${order.id}</span></p>
    <p><strong>Order Date:</strong> ${dayjs(order.date).format('MMMM D, YYYY')}</p>
    <p><strong>Total Charged:</strong> <span class="order-total-display">${totalDisplay}</span></p>

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