let currentSize = null;
let currentShirtColor = 'black';
let currentThreadColor = 'black';
let cartItems = [];

// Modal functions
function openModal() {
    document.getElementById('sizeModal').style.display = 'block';
}

function closeModal() {
    document.getElementById('sizeModal').style.display = 'none';
}

// Cart functions
function toggleCart() {
    const cartModal = document.getElementById('cartModal');
    if (cartModal.style.display === 'block') {
        cartModal.style.display = 'none';
    } else {
        cartModal.style.display = 'block';
    }
}

function selectSize(size, event) {
    if (!event) return; // Guard clause
    currentSize = size;
    const sizeButtons = document.getElementsByClassName('size-button');
    Array.from(sizeButtons).forEach(button => {
        button.classList.remove('selected');
    });
    event.target.classList.add('selected');
}

function selectColor(element, color, isShirtColor) {
    const squares = element.parentElement.getElementsByClassName('color-square');
    Array.from(squares).forEach(square => square.classList.remove('selected'));
    element.classList.add('selected');
    
    if (isShirtColor) {
        currentShirtColor = color;
    } else {
        currentThreadColor = color;
    }
    
    updateModalImage();
}

function updateModalImage() {
    const imagePath = `/Nexira-Images/Nexira-tshirt-${currentShirtColor}-embroidery-${currentThreadColor}.png`;
    document.getElementById('modalImage').src = imagePath;
}

async function addToCart() {
    if (!currentSize) {
        alert('Please select a size');
        return;
    }

    const addToCartBtn = document.querySelector('.add-to-cart-button');
    if (addToCartBtn) addToCartBtn.disabled = true;

    try {
        const item = {
            size: currentSize,
            shirtColor: currentShirtColor,
            threadColor: currentThreadColor,
            price: 17.99,
            image: `/Nexira-Images/Nexira-tshirt-${currentShirtColor}-embroidery-${currentThreadColor}.png`
        };

        // Check if identical item exists
        const existingItemIndex = cartItems.findIndex(cartItem => 
            cartItem.size === item.size && 
            cartItem.shirtColor === item.shirtColor && 
            cartItem.threadColor === item.threadColor
        );

        if (existingItemIndex !== -1) {
            if (!cartItems[existingItemIndex].quantity) {
                cartItems[existingItemIndex].quantity = 1;
            }
            cartItems[existingItemIndex].quantity++;
        } else {
            item.quantity = 1;
            cartItems.push(item);
        }

        updateCartDisplay();
        updateCartCount();
        closeModal();
    } catch (error) {
        console.error('Error:', error);
        alert('There was a problem adding the item to cart. Please try again.');
    } finally {
        if (addToCartBtn) addToCartBtn.disabled = false;
    }
}

function updateCartCount() {
    const cartCount = document.querySelector('.cart-count');
    if (cartCount) {
        // Calculate total quantity
        const totalQuantity = cartItems.reduce((sum, item) => sum + (item.quantity || 1), 0);
        cartCount.textContent = totalQuantity;
        
        if (totalQuantity === 0) {
            cartCount.style.display = 'none';
        } else {
            cartCount.style.display = 'flex';
        }
    }
}

function updateCartDisplay() {
    const cartItemsDiv = document.getElementById('cartItems');
    const cartTotalDiv = document.getElementById('cartTotal');
    let total = 0;

    cartItemsDiv.innerHTML = '';
    cartItems.forEach((item, index) => {
        // Capitalize first letter of colors
        const capitalizedShirtColor = item.shirtColor.charAt(0).toUpperCase() + item.shirtColor.slice(1);
        const capitalizedThreadColor = item.threadColor.charAt(0).toUpperCase() + item.threadColor.slice(1);

        const itemDiv = document.createElement('div');
        itemDiv.classList.add('cart-item');
        itemDiv.innerHTML = `
            <img src="${item.image}" alt="T-shirt preview" style="width: 50px; height: 50px; object-fit: contain;">
            <div class="cart-item-details">
                <span>Shirt Colour: ${capitalizedShirtColor}</span>
                <span>Embroidery Colour: ${capitalizedThreadColor}</span>
                <span>Size: ${item.size}</span>
                <div class="quantity-price-row">
                    <div class="quantity-selector">
                        <span>Qty: </span>
                        <select onchange="updateQuantity(${index}, this.value)">
                            ${generateQuantityOptions(item.quantity)}
                        </select>
                    </div>
                    <span class="item-price">£${(item.price * item.quantity).toFixed(2)}</span>
                </div>
            </div>
            <button onclick="removeFromCart(${index})">Remove</button>
        `;
        cartItemsDiv.appendChild(itemDiv);
        total += item.price * item.quantity;
    });

    cartTotalDiv.textContent = `Total: £${total.toFixed(2)}`;
    
    // Show/hide checkout button
    const checkoutBtn = document.getElementById('checkoutBtn');
    if (checkoutBtn) {
        checkoutBtn.style.display = cartItems.length > 0 ? 'block' : 'none';
    }
}


// Function to generate quantity dropdown options
function generateQuantityOptions(currentQuantity) {
    let options = '';
    for (let i = 1; i <= 10; i++) {
        options += `<option value="${i}" ${i === currentQuantity ? 'selected' : ''}>${i}</option>`;
    }
    return options;
}

// Function to update quantity
function updateQuantity(index, newQuantity) {
    cartItems[index].quantity = parseInt(newQuantity);
    updateCartDisplay();
    updateCartCount();
}


function removeFromCart(index) {
    if (cartItems[index].quantity > 1) {
        cartItems[index].quantity--;
    } else {
        const item = cartItems[index];
        const confirmRemove = confirm(`Remove ${item.size} ${item.shirtColor} shirt from cart?`);
        if (confirmRemove) {
            cartItems.splice(index, 1);
        } else {
            return;
        }
    }
    updateCartDisplay();
    updateCartCount();
}

async function checkout() {
    if (cartItems.length === 0) {
        alert('Your cart is empty!');
        return;
    }
    
    const checkoutBtn = document.getElementById('checkoutBtn');
    if (checkoutBtn) checkoutBtn.disabled = true;
    
    try {
        const response = await fetch('https://nexira-site.onrender.com/create-checkout-session', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ 
                items: cartItems.map(item => ({
                    ...item,
                    quantity: item.quantity || 1
                }))
            })
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const { url } = await response.json();
        window.location.href = url;
    } catch (error) {
        console.error('Error:', error);
        alert('There was a problem with the checkout process. Please try again.');
    } finally {
        if (checkoutBtn) checkoutBtn.disabled = false;
    }
}



// Initialize cart and handle success/cancel redirects
document.addEventListener('DOMContentLoaded', () => {
    const urlParams = new URLSearchParams(window.location.search);
    
    if (urlParams.get('success')) {
        cartItems = []; // Clear the cart
        updateCartDisplay();
        updateCartCount();
        alert('Thank you for your purchase!');
        // Clean up the URL
        window.history.replaceState({}, document.title, window.location.pathname);
    }
    
    if (urlParams.get('canceled')) {
        alert('Order canceled -- continue to shop around and checkout when you\'re ready.');
        // Clean up the URL
        window.history.replaceState({}, document.title, window.location.pathname);
    }
});

document.addEventListener('mousedown', function(event) {
    const sizeModal = document.getElementById('sizeModal');
    const cartModal = document.getElementById('cartModal');
    const modalContent = document.querySelector('.modal-content');
    const cartModalContent = document.querySelector('.cart-modal-content');
    const buyNowButton = document.querySelector('.buy-now-button');
    const cartIcon = document.querySelector('.cart-icon');

    // For size modal
    if (sizeModal && sizeModal.style.display === 'block') {
        if (!modalContent.contains(event.target) && event.target !== buyNowButton) {
            closeModal();
        }
    }

    // For cart modal
    if (cartModal && cartModal.style.display === 'block') {
        if (!cartModalContent.contains(event.target) && event.target !== cartIcon) {
            cartModal.style.display = 'none';
        }
    }
});

function toggleMenu() {
    const menuContent = document.querySelector('.menu-content');
    menuContent.classList.toggle('active');
}

// Close menu when clicking outside
document.addEventListener('click', function(event) {
    const menu = document.querySelector('.hamburger-menu');
    const menuContent = document.querySelector('.menu-content');
    
    if (!menu.contains(event.target) && menuContent.classList.contains('active')) {
        menuContent.classList.remove('active');
    }
});


