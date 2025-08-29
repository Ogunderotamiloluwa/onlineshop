import { cart } from "./cart.js";
import { product } from "./product-data.js";

const productsGrid = document.querySelector('.products-grid'); // Replace with the correct class or ID of your container element

let CartsummaryHTML = ''; // Create an empty string to hold the HTML

cart.forEach((cartitem) => {
    const productId = cartitem.productId;

    let matchingProduct;
    product.forEach((products) => {
        if (products.id === productId) {
            matchingProduct = products;
        }
    });

    console.log(matchingProduct);

    // This is a template literal that creates the HTML string for one product
    // The syntax is correct here, as it's being assigned to a variable or passed to a function
    CartsummaryHTML += ` 
        <div class="suball1" >
            <h2 class="deleverydate" >Delevery date: Tuesday, june 21</h2> 
            <div class="suball1imgandtextdiv">
                <div class="suball1img">
                    <div style="width: 50%;object-fit: contain;height: 60%; padding-left: 1%;">
                        <img src="${matchingProduct.image}" style="width: 100%;height: 100%;object-fit: contain">
                    </div>
                    <div style="width: 50%;font-size: 1.2rem; display: flex; padding-top: 2%;flex-direction: column;gap: 0.5rem; color: rgb(179, 179, 179);">
                        ${matchingProduct.name2}<br>
                      
                        <nav style="font-size: 1rem;color: rgb(225, 195, 28);">
                        $${(matchingProduct.pricecent/100).toFixed(2)}</nav> 
                        <nav style="color: white;"> Quantity: ${cartitem.quantity}</nav> 
                        <nav style="color: rgb(150, 150, 241); cursor: pointer;" >Update delete</nav>
                    </div>
                </div>
                <div class="suball1text" style="color: black;font-size: 1rem; gap: 2rem;" >
                    Choose a delevery option:<br>
                    <nav style="color:  rgb(179, 179, 179);padding-left: 2%;font-size: 0.8rem;"> Tuesday june, 21</nav>
                    <nav style="color:rgb(225, 195, 28); padding-left: 2%;font-size: 0.8rem;">Free Shipping</nav>
                    <div style="position: relative;top: 8%;">
                        <nav style="color:  rgb(179, 179, 179);padding-left: 2%;font-size: 0.8rem;"> Tuesday june, 21</nav>
                        <nav style="color:rgb(225, 195, 28); padding-left: 2%;font-size: 0.8rem;">Free Shipping</nav>
                    </div>
                    <div style="position: relative;top: 13%;">
                        <nav style="color:  rgb(179, 179, 179);padding-left: 2%;font-size: 0.8rem;"> Tuesday june, 21</nav>
                        <nav style="color:rgb(225, 195, 28); padding-left: 2%;font-size: 0.8rem;">Free Shipping</nav>
                    </div>
                </div>
            </div>
        </div>
    `;
});

// Now, insert all the generated HTML into the DOM
document.querySelector('.js-order-summary ').innerHTML=CartsummaryHTML;
console.log(CartsummaryHTML)
productsGrid.innerHTML = productHTML;
