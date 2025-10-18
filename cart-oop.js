function Cart(){
  const cart = {
    cartItems: undefined,

    loadfromstorage() {
        // ❌ ERROR LINE CORRECTION:
        // You were trying to do 'this = ...' which is an Invalid LHS.
        // You intended to assign the parsed data to a property, like 'this.cartItems'.
        this.cartItems = JSON.parse(localStorage.getItem('cart-oop'));

        // ❌ ERROR CORRECTION: Comma (,) should be a dot (.) for property access
        if (!this.cartItems) {
            this.cartItems = [];
        }
    },

    savetolocalstorage() {
        localStorage.setItem('cart-oop', JSON.stringify(this.cartItems));
    },

    addtocart(productid) {
        let matchingitem;
        this.cartItems.forEach((cartitem) => {
            if (productid === cartitem.productId) {
                matchingitem = cartitem;
            }
        });

        const defaultDeliveryOptionId = '1';

        if (matchingitem) {
            matchingitem.quantity += 1;
        } else {
            this.cartItems.push({
                productId: productid,
                quantity: 1,
                deliveryOptionId: defaultDeliveryOptionId
            });
        }
        // ❌ ERROR CORRECTION: Removed space before .savetolocalstorage()
        this.savetolocalstorage();
    },

    removefromcart(productId) {
        let newcart = [];
        this.cartItems.forEach((cartitem) => {
            if (cartitem.productId !== productId) {
                newcart.push(cartitem);
            }
        });
        this.cartItems = newcart;
        // ❌ ERROR CORRECTION: Removed space before .savetolocalstorage()
        this.savetolocalstorage();
    },

    updateCartQuantity(productId, newQuantity) {
        let itemFound = false;
        this.cartItems.forEach((cartitem) => {
            if (cartitem.productId === productId) {
                cartitem.quantity = Number(newQuantity);
                itemFound = true;
            }
        });
        if (itemFound) {
            if (Number(newQuantity) <= 0) {
                // ❌ ERROR CORRECTION: Must call the method using 'this.'
                this.removefromcart(productId);
            }
            // ❌ ERROR CORRECTION: Removed space before .savetolocalstorage()
            this.savetolocalstorage();
        }
    },

    updateDeliveryOption(productId, deliveryOptionId) {
        let matchingitem;
        this.cartItems.forEach((cartitem) => {
            if (cartitem.productId === productId) {
                matchingitem = cartitem;
            }
        });

        if (matchingitem) {
            matchingitem.deliveryOptionId = deliveryOptionId;
            // ❌ ERROR CORRECTION: Removed space before .savetolocalstorage()
            this.savetolocalstorage();
        }
    }
};
return cart;
}


const cart= Cart()
const businesscart=Cart()
cart.loadfromstorage();
console.log(cart);
console.log(businesscart)