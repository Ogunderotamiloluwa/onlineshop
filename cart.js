
export let cart = JSON.parse(localStorage.getItem('cart'));
if (!cart) {
  cart = [];
}

function savetolocalstorage() {
  localStorage.setItem('cart', JSON.stringify(cart));
}

export function addtocart(productid) {
  let matchingitem;
  cart.forEach((cartitem) => {
    if (productid === cartitem.productId) {
      matchingitem = cartitem;
    }
  });

  const defaultDeliveryOptionId = '1';

  if (matchingitem) {
    matchingitem.quantity += 1;
  } else {
    cart.push({
      productId: productid,
      quantity: 1,
      deliveryOptionId: defaultDeliveryOptionId 
    });
  }
  savetolocalstorage();
}

export function removefromcart(productId) {
  let newcart = [];
  cart.forEach((cartitem) => {
    if (cartitem.productId !== productId) {
      newcart.push(cartitem);
    }
  });
  cart = newcart;
  savetolocalstorage();
}

export function updateCartQuantity(productId, newQuantity) {
  let itemFound = false;
  cart.forEach((cartitem) => {
    if (cartitem.productId === productId) {
      cartitem.quantity = Number(newQuantity);
      itemFound = true;
    }
  });
  if (itemFound) {
    if (Number(newQuantity) <= 0) {
      removefromcart(productId);
    }
    savetolocalstorage();
  }
}

export function updateDeliveryOption(productId, deliveryOptionId) {
  let matchingitem;
  cart.forEach((cartitem) => {
    if (cartitem.productId === productId) {
      matchingitem = cartitem;
    }
  });

  if (matchingitem) {
    matchingitem.deliveryOptionId = deliveryOptionId;
    savetolocalstorage();
  }
}