// deliveryOptions.js
export const deliveryOptions = [{
  id: '1',
  deliveryDays: 7,
  priceCents: 0
}, {
  id: '2',
  deliveryDays: 3,
  priceCents:499
}, {
  id: '3',
  deliveryDays: 1,
  priceCents:  999 
}];

// Utility function to find a delivery option
export function getDeliveryOption(deliveryOptionId) {
  let deliveryOption;

  deliveryOptions.forEach(option => {
    if (option.id === deliveryOptionId) {
      deliveryOption = option;
    }
  });

  // Default to the first (free) option if ID not found
  return deliveryOption || deliveryOptions[0]; 
}