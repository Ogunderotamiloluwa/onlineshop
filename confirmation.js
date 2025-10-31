// confirmation.js

// Import dayjs for date formatting if needed (already imported in result.js but good practice here)
import dayjs from 'https://unpkg.com/dayjs@1.11.10/esm/index.js'; 

/**
 * Gets a specific parameter value from the current URL query string.
 * @param {string} name - The name of the parameter to get (e.g., 'orderId').
 * @returns {string | null} The parameter value or null if not found.
 */
function getUrlParam(name) {
    const params = new URLSearchParams(window.location.search);
    return params.get(name);
}

/**
 * Calculates the progress percentage based on the tracking status.
 * @param {string} status - The current tracking status.
 * @returns {number} The progress percentage (0-100).
 */
function getProgressPercentage(status) {
    switch (status) {
        case 'Order Placed':
            return 25;
        case 'Shipped':
            return 50;
        case 'Out for Delivery':
            return 75;
        case 'Delivered':
            return 100;
        default:
            return 0;
    }
}

/**
 * Generates the HTML content for the order confirmation page.
 * @param {object} order - The complete order object.
 * @returns {string} The full HTML string for the confirmation container.
 */
function generateConfirmationHTML(order) {
    let itemsTrackingHTML = '';
    
    // Determine the overall status for the progress bar
    const overallStatus = order.trackingStatus || 'Order Placed';
    const progressPercent = getProgressPercentage(overallStatus);

    // Generate HTML for each item in the order
    order.items.forEach(item => {
        // NOTE: In a real system, each item might have its own tracking status/delivery date.
        // Here, we use the date/status saved when the order was placed.
        itemsTrackingHTML += `
            <div class="tracking-item-card">
                <div class="tracking-item-image-container">
                    <img src="${item.image}" alt="${item.name}" class="tracking-item-image">
                </div>
                <div>
                    <div class="tracking-item-name">${item.name} (Qty: ${item.quantity})</div>
                    <div class="delivery-date">Expected Delivery: ${item.deliveryDate}</div>
                    <div style="margin-top: 5px; font-size: 0.9em; color: #999;">
                        Price: $${(item.priceCent / 100).toFixed(2)} each
                    </div>
                </div>
            </div>
        `;
    });

    // Determine payment info
    const paymentDisplay = order.paymentMethod === 'Transfer' ? 'Bank Transfer (Confirmed)' : 'Cash on Delivery (COD)';
    
    // Determine delivery address info
    const deliveryAddress = `
        ${order.deliveryInfo.streetAddress}, ${order.deliveryInfo.city} 
        <br>Phone: ${order.deliveryInfo.phone}
    `;

    const totalDollars = (order.totalCents / 100).toFixed(2);

    return `
        <h1>✅ Order Placed Successfully!</h1>
        <p class="summary-line">
            Thank you for your order. A confirmation email has been sent to your address.
        </p>
        
        <h2>Order Summary: #${order.id}</h2>
        <p>Order Date: **${order.date}**</p>
        <p>Payment Method: **${paymentDisplay}**</p>
        <p>Delivery To: **${order.deliveryInfo.fullName}**</p>
        <p style="margin-bottom: 20px;">Address: ${deliveryAddress}</p>

        <h2 style="color: #66ff99;">📦 Tracking Status</h2>
        <div class="tracking-section">
            <div class="tracking-status-label">
                Current Status: <span class="status-text">${overallStatus}</span>
            </div>
            <div class="tracking-progress-bar">
                <div class="progress-indicator" style="width: ${progressPercent}%"></div>
            </div>

            <p style="text-align: center; margin-top: 15px; font-style: italic; color: #999;">
                The status below reflects the overall progress of your order.
            </p>

            <h3 style="margin-top: 25px; color: #E0E0E0;">Items in Order (${order.items.length})</h3>
            <div class="tracking-items-grid">
                ${itemsTrackingHTML}
            </div>
        </div>

        <h2 style="margin-top: 30px;">💵 Final Total: <span class="order-total-display">$${totalDollars}</span></h2>

        <div class="return-home">
            <a href="index.html" class="continue-shopping-link">
                Continue Shopping
            </a>
        </div>
    `;
}

/**
 * Main function to load and display the order.
 */
function loadOrderConfirmation() {
    const orderId = getUrlParam('orderId');
    const container = document.querySelector('.js-order-confirmation-container');

    if (!orderId) {
        container.innerHTML = `
            <div class="placeholder-content">
                <h1>Error 🛑</h1>
                <p>No Order ID found in the URL. Cannot display confirmation.</p>
                <a href="index.html" class="continue-shopping-link" style="margin-top: 20px;">
                    Go to Home Page
                </a>
            </div>
        `;
        return;
    }

    // Retrieve all orders from localStorage
    const allOrders = JSON.parse(localStorage.getItem('orders')) || [];
    
    // Find the specific order
    const order = allOrders.find(o => o.id === orderId);

    if (order) {
        // If order is found, display the detailed confirmation
        container.innerHTML = generateConfirmationHTML(order);
    } else {
        // If order is not found
        container.innerHTML = `
            <div class="placeholder-content">
                <h1>Order Not Found 🔍</h1>
                <p>The order ID **#${orderId}** could not be found in our records.</p>
                <a href="index.html" class="continue-shopping-link" style="margin-top: 20px;">
                    Go to Home Page
                </a>
            </div>
        `;
    }
}

// Execute the main function when the script runs
document.addEventListener('DOMContentLoaded', loadOrderConfirmation);