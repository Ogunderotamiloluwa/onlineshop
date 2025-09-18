export let cart = JSON.parse(localStorage.getItem('cart'));
if(!cart){
  cart = [];
}

function savetolocalstorage(){
  localStorage.setItem('cart',JSON.stringify(cart))
}

export function addtocart(productid) {
  let matchingitem;
  cart.forEach((cartitem) => {
    if (productid === cartitem.productId) {
      matchingitem = cartitem;
    }
  });
  
  if (matchingitem) {
    matchingitem.quantity += 1;
  } else {
    cart.push({
      productId: productid,
      quantity: 1
    });
  }
savetolocalstorage()
}

export function removefromcart(productId){
let newcart =[];
  cart.forEach((cartitem)=>{
    if (cartitem.productId !== productId){
     newcart.push(cartitem)
    }
  })
cart=newcart;
savetolocalstorage()
}




