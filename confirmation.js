// confirmation.js

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
 * Gets status-specific details (icon and color).
 * @param {string} status - The current tracking status.
 * @returns {object} Contains icon and display color.
 */
function getStatusDetails(status) {
    switch (status) {
        case 'Delivered':
            return { icon: '📦✅', color: '#66ff99' };
        case 'Out for Delivery':
            return { icon: '🚚💨', color: '#FFD700' };
        case 'Shipped':
            return { icon: '✈️', color: '#64B5F6' };
        case 'Order Placed':
            return { icon: '🛒⏳', color: '#B0B0B0' };
        default:
            return { icon: '❓', color: '#FF5252' };
    }
}

/**
 * Saves the updated orders back to localStorage.
 * @param {object[]} allOrders - The complete list of orders.
 */
function saveAllOrders(allOrders) {
    localStorage.setItem('orders', JSON.stringify(allOrders));
}

/**
 * **ADVANCED FEATURE: Daily Status Persistence and Update**
 * Checks if the order status needs to be updated (i.e., if it's a new day since the last check).
 * In a real system, this would be an API call to fetch the latest status.
 * Here, we simulate progression based on the order date if a day has passed.
 * @param {object} order - The specific order object to update.
 * @param {object[]} allOrders - The complete list of orders for saving.
 */
function initializeTrackingData(order, allOrders) {
    const today = dayjs().format('YYYY-MM-DD');
    const orderDate = dayjs(order.date);
    const daysSinceOrder = dayjs().diff(orderDate, 'day');
    
    // Check if the tracking data was already updated today OR if the order is already Delivered
    if (order.lastUpdateDate === today || order.trackingStatus === 'Delivered') {
        return; // Status is static for today
    }

    // --- Daily Progression Logic (Simulation of Server Update) ---
    let newStatus = order.trackingStatus || 'Order Placed';

    if (daysSinceOrder >= 3 && newStatus === 'Shipped') {
        newStatus = 'Out for Delivery';
    } else if (daysSinceOrder >= 1 && newStatus === 'Order Placed') {
        newStatus = 'Shipped';
    } else if (daysSinceOrder >= 5 && newStatus === 'Out for Delivery') {
        newStatus = 'Delivered';
    }

    // Apply the new status to the overall order
    order.trackingStatus = newStatus;
    order.lastUpdateDate = today; 

    // Update each item's status and delivery date accordingly
    order.items.forEach(item => {
        item.trackingStatus = newStatus;
        
        // Adjust Estimated Delivery Date based on the NEW status
        if (newStatus === 'Delivered') {
            item.deliveryDate = dayjs().format('MMMM D, YYYY'); 
        } else if (newStatus === 'Out for Delivery') {
             // 1-2 day delivery
             item.deliveryDate = dayjs().add(Math.floor(Math.random() * 2) + 1, 'day').format('dddd, MMMM D');
        } else if (newStatus === 'Shipped' && !item.deliveryDate) {
            // Re-estimate a longer delivery window
            item.deliveryDate = dayjs().add(Math.floor(Math.random() * 3) + 3, 'day').format('dddd, MMMM D');
        }
    });

    // Save the updated order and the timestamp
    saveAllOrders(allOrders);
}


/**
 * Generates the HTML content for the order confirmation page.
 * @param {object} order - The complete order object.
 * @returns {string} The full HTML string for the confirmation container.
 */
function generateConfirmationHTML(order) {
    let itemsTrackingHTML = '';
    
    // Use the overall status for the main progress bar
    const overallStatus = order.trackingStatus || 'Order Placed';
    const progressPercent = getProgressPercentage(overallStatus);
    const overallStatusDetails = getStatusDetails(overallStatus);

    // Generate HTML for each item in the order - showing individual tracking
    order.items.forEach(item => {
        const itemStatus = item.trackingStatus || overallStatus;
        const itemDeliveryDate = item.deliveryDate || 'N/A';
        const itemDetails = getStatusDetails(itemStatus);

        itemsTrackingHTML += `
            <div class="tracking-item-card">
                <div class="tracking-item-image-container">
                    <img src="${item.image}" alt="${item.name}" class="tracking-item-image">
                </div>
                <div>
                    <div class="tracking-item-name">${item.name} (Qty: ${item.quantity})</div>
                    <div style="font-size: 0.9em; margin-bottom: 5px; color: #B0B0B0;">
                        Status: ${itemDetails.icon} 
                        <span style="font-weight: 600; color: ${itemDetails.color};">${itemStatus}</span>
                    </div>
                    <div class="delivery-date" style="color: ${itemDetails.color};">
                        ${itemStatus === 'Delivered' ? 'Delivered On:' : 'Estimated Delivery:'} **${itemDeliveryDate}**
                    </div>
                    <div style="margin-top: 5px; font-size: 0.9em; color: #999;">
                        Price: $${(item.priceCent / 100).toFixed(2)} each
                    </div>
                </div>
            </div>
        `;
    });

    const paymentDisplay = order.paymentMethod === 'Transfer' ? 'Bank Transfer (Confirmed)' : 'Cash on Delivery (COD)';
    
    const deliveryAddress = `
        ${order.deliveryInfo.streetAddress}, ${order.deliveryInfo.city} 
        <br>Phone: ${order.deliveryInfo.phone}
    `;

    const totalDollars = (order.totalCents / 100).toFixed(2);

    return `
        <h1>${overallStatusDetails.icon} Order Status</h1>
        <p class="summary-line">
            Your tracking details below reflect the latest update as of today.
        </p>
        
        <h2>Order Summary: #${order.id}</h2>
        <p>Order Date: **${order.date}**</p>
        <p>Payment Method: **${paymentDisplay}**</p>
        <p>Delivery To: **${order.deliveryInfo.fullName}**</p>
        <p style="margin-bottom: 20px;">Address: ${deliveryAddress}</p>

        <h2 style="color: #66ff99;">📦 Tracking Status</h2>
        <div class="tracking-section">
            <div class="tracking-status-label">
                Current Overall Status: <span class="status-text" style="color: ${overallStatusDetails.color};">${overallStatus}</span>
            </div>
            <div class="tracking-progress-bar">
                <div class="progress-indicator" style="width: ${progressPercent}%; background-color: ${overallStatusDetails.color};"></div>
            </div>

            <p style="text-align: center; margin-top: 15px; font-style: italic; color: #999;">
                The status is updated daily based on shipping milestones.
            </p>

            <h3 style="margin-top: 25px; color: #E0E0E0;">Items Tracking Details (${order.items.length})</h3>
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
        // Error handling for missing orderId
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
        // 1. Check and update the tracking status only if a new day has started
        initializeTrackingData(order, allOrders); 

        // 2. Display the confirmation with the latest static data
        container.innerHTML = generateConfirmationHTML(order);

    } else {
        // Error handling for order not found
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