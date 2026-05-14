// 1. Handle Intro Animation

window.addEventListener('DOMContentLoaded', () => {

    setTimeout(() => {

        const overlay = document.getElementById('intro-overlay');

        const mainContent = document.getElementById('main-content');

       

        overlay.style.opacity = '0';

        setTimeout(() => {

            overlay.style.display = 'none';

            mainContent.classList.add('show-content');

        }, 1000);

    }, 3000); // 3 seconds welcome

});

/* --- SECTION 2: SMART DATA LOAD (Admin Control) --- */

// A. Check karein ke kya humne pehli baar setup kar liya hai?
let savedProducts = JSON.parse(localStorage.getItem('envirve_products'));

if (savedProducts === null) {
    // Agar Storage bilkul khali hai (First time load), toh default products set karo
    const initialDefaults = [
        { 
            name: "Hair Balance Shampoo", 
            price: "Rs 650", 
            desc: "A powerful blend of Amla, Reetha, Shikakai, and Rosemary.", 
            img: "images/shampoo.jpeg" 
        },
        { 
            name: "Beetroot Glow Soap", 
            price: "Rs 450", 
            desc: "Hand-pressed with organic beetroot extract and calming essential oils.", 
            img: "images/soap.png" 
        }
    ];
    // Inhe hamesha ke liye Storage mein daal do
    localStorage.setItem('envirve_products', JSON.stringify(initialDefaults));
    savedProducts = initialDefaults;
}

// B. Final list jo screen par dikhegi (Ab ye hamesha Storage se aayegi)
const allProducts = savedProducts;

// --- SECTION 3: DISPLAY ---
const display = document.getElementById('product-display');
if (display) {
    display.innerHTML = ''; 
    allProducts.forEach(item => {
        display.innerHTML += `
            <div class="product-card">
                <img src="${item.img}" alt="${item.name}" class="product-image">
                <h3>${item.name}</h3>
                <p>${item.desc}</p>
                <p><strong>${item.price}</strong></p>
                <div class="card-buttons">
                    <button class="buy-btn" onclick="goToProduct('${item.name}', '${item.price}', '${item.img}', '${item.desc}')">View Details</button>
                </div>
            </div>
        `;
    });
}


// --- SECTION 6 & 7: DATA HANDLING ---

function goToProduct(name, price, img, desc) {
    const cleanPrice = price.toString().replace(/Rs\.?/g, '').trim();
    const url = `product-detail.html?name=${encodeURIComponent(name)}&price=${encodeURIComponent(cleanPrice)}&img=${encodeURIComponent(img)}&desc=${encodeURIComponent(desc)}`;
    window.location.href = url;
}

function updateCartUI() {
    const cartCountElement = document.getElementById('cart-count');
    if(cartCountElement) {
        let cart = JSON.parse(localStorage.getItem('envirveCart')) || [];
        // Sum up all quantities
        const count = cart.reduce((total, item) => total + (item.quantity || 1), 0);
        cartCountElement.innerText = count;
    }
}

window.addEventListener('load', updateCartUI);

// THE FIX: Professional Add To Cart
// --- UPDATED ADD TO CART (Bulletproof) ---
function addToCart(name, price, img) {
    // Initialize cart from localStorage
    let cart = JSON.parse(localStorage.getItem('envirveCart')) || [];

    // Safety: Ensure cart is an array
    if (!Array.isArray(cart)) { cart = []; }

    // Check if item already exists in cart
    let existingItem = cart.find(item => item.name === name);

    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        // Add new item with quantity 1
        cart.push({
            name: name,
            price: price,
            img: img,
            quantity: 1
        });
    }

    // Save back to storage
    localStorage.setItem('envirveCart', JSON.stringify(cart));
    
    // Update the Navbar counter and open the side drawer
    updateCartUI();
    openCart(); 
}

/* --- SECTION 8: SIDE DRAWER RENDERER --- */

function openCart() {
    renderCartItems(); 
    document.getElementById('cart-drawer').classList.add('open');
    document.getElementById('cart-overlay').style.display = 'block';
}

function closeCart() {
    document.getElementById('cart-drawer').classList.remove('open');
    document.getElementById('cart-overlay').style.display = 'none';
}

function renderCartItems() {
    const container = document.getElementById('cart-items-container');
    const totalElement = document.getElementById('cart-total-amount');
    
    let cart = JSON.parse(localStorage.getItem('envirveCart')) || [];
    
    if (cart.length === 0) {
        container.innerHTML = '<p style="text-align:center; padding:40px; color:#999;">Your basket is empty</p>';
        totalElement.innerText = "Rs 0";
        return;
    }

    let cartHTML = '';
    let total = 0;

    cart.forEach((item, index) => {
        let priceNum = parseInt(item.price.toString().replace(/Rs\.?/g, '').trim());
        let itemTotal = priceNum * item.quantity;
        total += itemTotal;

        cartHTML += `
            <div class="cart-item" style="display: flex; align-items: center; gap: 10px; padding: 10px 0; border-bottom: 1px solid #eee;">
                <img src="${item.img}" style="width: 50px; height: 50px; object-fit: cover; border-radius: 5px;">
                <div style="flex: 1;">
                    <h4 style="margin:0; font-size: 0.9rem;">${item.name}</h4>
                    <p style="margin:0; font-size: 0.8rem; font-weight: bold;">Rs ${priceNum} x ${item.quantity}</p>
                </div>
                <button onclick="removeFromCart(${index})" style="background:none; border:none; color:red; cursor:pointer;"><i class="fas fa-trash"></i></button>
            </div>
        `;
    });

    container.innerHTML = cartHTML;
    totalElement.innerText = "Rs " + total;
}

function removeFromCart(index) {
    let cart = JSON.parse(localStorage.getItem('envirveCart')) || [];
    cart.splice(index, 1);
    localStorage.setItem('envirveCart', JSON.stringify(cart));
    updateCartUI();
    renderCartItems();
}
/* --- STEP 2: AUTOMATIC CART OPENER (Redirect Fix) --- */

// Jab index.html load hoga, ye check karega ke kya piche se "openCart" ka signal aaya hai?
window.addEventListener('load', () => {
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('openCart') === 'true') {
        // 500ms ka delay taaki intro animation khatam ho jaye, phir drawer khule
        setTimeout(() => {
            openCart(); 
        }, 3500); // Agar intro 3s ka hai, toh ise 3500 (3.5s) rakhein
    }
});
/* --- STEP 1 LOGIC: CHECKOUT & FORM --- */

// 1. Form dikhane ke liye
function proceedToCheckout() {
    let cart = JSON.parse(localStorage.getItem('envirveCart')) || [];
    if (cart.length === 0) {
        alert("Cart is empty");
        return;
    }
    // Items wala section chota karo aur form dikhao
    document.getElementById('checkout-section').style.display = 'block';
    document.getElementById('main-checkout-btn').style.display = 'none'; // Purana button hide kar do
}

// 2. Order confirm karne ke liye
function confirmOrder(event) {
    event.preventDefault();

    // 1. Form se data uthao
    const cart = JSON.parse(localStorage.getItem('envirveCart')) || [];
    const name = document.getElementById('cust-name').value;
    const phone = document.getElementById('cust-phone').value;
    const address = document.getElementById('cust-address').value;
    const total = document.getElementById('cart-total-amount').innerText;

    // 2. Items ki list banayein
    let itemsList = cart.map(item => `${item.name} (x${item.quantity})`).join(", ");

    // 3. EmailJS ko bhejne wala data
    const templateParams = {
        cust_name: name,
        cust_phone: phone,
        cust_address: address,
        order_items: itemsList,
        total_price: total
    };

    // 4. Email Bhejna
    // "YOUR_SERVICE_ID" aur "YOUR_TEMPLATE_ID" ko replace karein
    emailjs.send('service_bzd851n', 'template_fzql75p', templateParams)
        .then(function() {
          const toast = document.createElement('div');
        
        // 2. Iski styling (Direct JS se takay CSS file ka chakkar hi khatam)
        toast.innerHTML = "Order Successful! Thank you for choosing us.";
        Object.assign(toast.style, {
            position: "fixed",
            top: "20px",
            right: "20px",
            backgroundColor: "#28a745",
            color: "white",
            padding: "16px 30px",
            borderRadius: "8px",
            boxShadow: "0 4px 15px rgba(0,0,0,0.2)",
            zIndex: "10000",
            fontSize: "16px",
            fontWeight: "bold",
            transition: "opacity 0.5s ease"
        });

        // 3. Body mein add karein
        document.body.appendChild(toast);

        // 4. Cart khali karein
        localStorage.removeItem('envirveCart');

        // 5. 5 seconds baad gayab karein aur page reload karein
        setTimeout(() => {
            toast.style.opacity = "0";
            setTimeout(() => {
                toast.remove();
                window.location.reload(); 
            }, 500);
        }, 5000);

    }, function(error) {
        alert("Error: " + JSON.stringify(error));
    });
}
    
    // 3 second baad sab reset karna
    setTimeout(() => {
        successBox.style.display = 'none';
        closeCart();
        window.location.reload(); // Page refresh taaki cart khali dikhe
    }, 3000);

window.addEventListener('load', () => {
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('openCart') === 'true') {
        // Humne 3500ms (3.5 seconds) ka delay diya hai taaki 
        // pehle Intro Animation khatam ho, phir cart khule.
        setTimeout(() => {
            openCart(); 
        }, 3500); 
    }
});
