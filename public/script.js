function openSizeGuide(productType) {
    // Get the event object safely
    const evt = window.event || arguments.callee.caller.arguments[0];
    if (evt) {
        evt.stopPropagation();
    }
    
    // Close any open modals
    document.querySelectorAll('.size-guide-modal').forEach(modal => {
        modal.style.display = 'none';
    });
    
    // Show the overlay with a different class for size guides
    const overlay = document.getElementById('overlay');
    if (overlay) {
        overlay.style.display = 'block';
        overlay.classList.add('size-guide-overlay'); // Add a special class for size guide overlays
    }
    
    // Show the appropriate size guide
    const sizeGuideModal = document.getElementById(productType + 'SizeGuideModal');
    if (sizeGuideModal) {
        sizeGuideModal.style.display = 'block';
        
        // Add click event to close when clicking outside the modal
        sizeGuideModal.addEventListener('click', function(e) {
            if (e.target === sizeGuideModal) {
                closeSizeGuide(productType);
            }
        }, { once: true });
    }
    
    // Don't prevent scrolling for size guides
    document.body.style.overflow = '';
}

function closeSizeGuide(productType) {
    // Hide the size guide
    const sizeGuideModal = document.getElementById(productType + 'SizeGuideModal');
    if (sizeGuideModal) {
        sizeGuideModal.style.display = 'none';
    }
    
    // Hide the overlay if no other modals are open
    const overlay = document.getElementById('overlay');
    if (overlay) {
        overlay.classList.remove('size-guide-overlay'); // Remove the special class
        
        if (!document.querySelector('.modal[style*="display: block"]') && 
            !document.querySelector('.cart-modal[style*="display: block"]')) {
            overlay.style.display = 'none';
        }
    }
}

function selectShirtColor(element, color) {
    event.stopPropagation();
    console.log('Shirt color selected:', color); // Debug log
    
    // Get the parent container (either modal or product card)
    const container = element.closest('.product-card') || element.closest('#customizeModal');
    
    if (container.id === 'customizeModal') {
        // We're in the customize modal
        currentShirtColor = color;
        
        // Remove selected class from all color squares
        const squares = container.querySelectorAll('.shirt-color-square');
        squares.forEach(square => square.classList.remove('selected'));
        
        // Add selected class to clicked square
        element.classList.add('selected');
        
        // Update modal image
        updateImage();
    } else {
        // We're in the product card
        selectedColor = color;
        
        // Remove selected class from all color squares in this container
        const squares = container.querySelectorAll('.shirt-color-square');
        squares.forEach(square => square.classList.remove('selected'));
        
        // Add selected class to clicked square
        element.classList.add('selected');
        
        // Get the product image
        const productImage = container.querySelector('.product-image');
        if (productImage) {
            // Construct the image path dynamically
            const imagePath = `Nexira-Images/Nexira-zipup-${color}.png`;
            productImage.src = imagePath;
            console.log('Updated image source:', imagePath); // Debug log
        }
    }
}

// Keep track of the currently expanded card
let expandedCard = null;

// Add this function to your JavaScript
function toggleProductCard(card) {
    // If clicking the same card that's already expanded, close it
    if (expandedCard === card) {
        card.classList.remove('expanded');
        expandedCard = null;
        return;
    }

    // If another card is expanded, close it first
    if (expandedCard) {
        expandedCard.classList.remove('expanded');
    }

    // Expand the clicked card
    card.classList.add('expanded');
    expandedCard = card;
}

// Add event listeners to all product cards
document.addEventListener('DOMContentLoaded', function() {
    const productCards = document.querySelectorAll('.product-card');
    productCards.forEach(card => {
        card.addEventListener('click', function(e) {
            // Prevent the click from triggering if clicking on buttons or color squares
            if (e.target.closest('.size-button') || 
                e.target.closest('.shirt-color-square') || 
                e.target.closest('button')) {
                return;
            }
            toggleProductCard(this);
        });
    });
});



function selectSize(size, event) {
    event.stopPropagation();
    console.log('Size selection triggered with size:', size); // Debug log
    
    // Get the parent container (either modal or product card)
    const container = event.target.closest('.product-card') || event.target.closest('#customizeModal');
    
    // Remove selected class from all size buttons in this container
    const sizeButtons = container.getElementsByClassName('size-button');
    Array.from(sizeButtons).forEach(button => {
        button.classList.remove('selected');
    });
    
    // Add selected class to clicked button
    event.target.classList.add('selected');
    
    // Update the appropriate size variable
    if (container.classList.contains('product-card')) {
        selectedSize = size;
        console.log('selectedSize updated to:', selectedSize); // Debug log
    } else {
        currentSize = size;
        console.log('currentSize updated to:', currentSize); // Debug log
    }
}



function selectThreadColor(element, color) {
    console.log('Thread color selected:', color); // Debug log
    currentThreadColor = color;
    
    // Remove selected class from all thread color buttons
    const buttons = document.querySelectorAll('.thread-color-button');
    buttons.forEach(button => button.classList.remove('selected'));
    
    // Add selected class to clicked button
    element.classList.add('selected');
    console.log('Selected class added to element:', element.classList.contains('selected')); // Debug log
    
    updateImage();
}


// ===============================
// GLOBAL VARIABLES
// ===============================
let cartItems = JSON.parse(localStorage.getItem('cartItems')) || [];
let currentSize = null;
let currentShirtColor = 'black';
let currentThreadColor = 'gold';
let selectedSize = null;
let selectedColor = 'black';

// ===============================
// PRODUCT TYPES
// ===============================
const PRODUCT_TYPES = {
    TSHIRT: {
        name: 'Custom T-Shirt',
        price: 17.99,
        hasThreadColor: true
    },
    ZIPUP: {
        name: 'Zip-up Hoodie',
        price: 32.99,
        hasThreadColor: false
    }
};

// ===============================
// MENU FUNCTIONS
// ===============================
function toggleMenu() {
    const menuContent = document.querySelector('.menu-content');
    if (menuContent) {
        menuContent.style.display = menuContent.style.display === 'block' ? 'none' : 'block';
    }
}


// ===============================
// MODAL FUNCTIONS
// ===============================
function openModal() {
    const modal = document.getElementById('customizeModal');
    const overlay = document.getElementById('overlay');
    
    if (modal && overlay) {
        modal.style.display = 'block';
        overlay.style.display = 'block';
        document.body.style.overflow = 'hidden'; // Prevent scrolling
    }
}

function closeModal() {
    const modal = document.getElementById('customizeModal');
    const overlay = document.getElementById('overlay');
    if (modal && overlay) {
        modal.style.display = 'none';
        overlay.style.display = 'none';
        document.body.style.overflow = ''; // Restore scrolling
    }
}

function openCartModal() {
    const cartModal = document.getElementById('cartModal');
    const overlay = document.getElementById('overlay');
    if (cartModal && overlay) {
        cartModal.style.display = 'block';
        overlay.style.display = 'block';
        updateCartDisplay(); // Update cart contents when opening
    }
}

function closeCartModal() {
    const cartModal = document.getElementById('cartModal');
    const overlay = document.getElementById('overlay');
    if (cartModal && overlay) {
        cartModal.style.display = 'none';
        overlay.style.display = 'none';
    }
}
function closeCartModal() {
    const cartModal = document.getElementById('cartModal');
    const overlay = document.getElementById('overlay');
    if (cartModal && overlay) {
        cartModal.style.display = 'none';
        overlay.style.display = 'none';
    }
}

// ADD THE NEW FUNCTIONS HERE
// Product Info Modal Functions
function openProductInfo(productType, event) {
    event.stopPropagation(); // Prevent event bubbling
    
    // Show the overlay
    const overlay = document.getElementById('overlay');
    if (overlay) {
        overlay.style.display = 'block';
    }
    
    // Show the product info modal
    const infoModal = document.getElementById(productType + 'InfoModal');
    if (infoModal) {
        infoModal.style.display = 'block';
    }
}

function closeProductInfo(productType) {
    // Hide the product info modal
    const infoModal = document.getElementById(productType + 'InfoModal');
    if (infoModal) {
        infoModal.style.display = 'none';
    }
    
    // Hide the overlay if no other modals are open
    const overlay = document.getElementById('overlay');
    if (overlay && !document.querySelector('.modal[style*="display: block"]') && 
        !document.querySelector('.cart-modal[style*="display: block"]')) {
        overlay.style.display = 'none';
    }
}

function openTab(productType, tabName, event) {
    // Hide all tab contents
    const tabContents = document.querySelectorAll(`[id^="${productType}-"]`);
    tabContents.forEach(tab => {
        tab.classList.remove('active');
    });
    
    // Show the selected tab content
    const selectedTab = document.getElementById(`${productType}-${tabName}`);
    if (selectedTab) {
        selectedTab.classList.add('active');
    }
    
    // Update tab button active states
    const tabButtons = document.querySelectorAll('.tab-button');
    tabButtons.forEach(button => {
        button.classList.remove('active');
    });
    
    // Set the clicked tab button as active
    event.target.classList.add('active');
}

// ===============================
// CUSTOMIZATION FUNCTIONS
// ===============================
function createCartItem(productType, size, color, threadColor = null) {
    const product = PRODUCT_TYPES[productType];
    
    return {
        productName: product.name,
        size: size,
        shirtColor: color,
        threadColor: threadColor,
        hasThreadColor: product.hasThreadColor,
        price: product.price,
        quantity: 1,
        image: product.hasThreadColor 
            ? `Nexira-Images/Nexira-tshirt-${color}-embroidery-${threadColor}.png`
            : `Nexira-Images/Nexira-${productType.toLowerCase()}-${color}.png`
    };
}

function updateImage() {
    const modalImage = document.getElementById('modalImage');
    if (modalImage) {
        const imagePath = `Nexira-Images/Nexira-tshirt-${currentShirtColor}-embroidery-${currentThreadColor}.png`;
        modalImage.src = imagePath;
    }
}

function initColorSelection() {
    const colorButtons = document.querySelectorAll('.color-squares');
    
    colorButtons.forEach(button => {
        button.addEventListener('click', (e) => {
            e.stopPropagation();
            
            const productCard = e.target.closest('.product-card');
            const selectedColor = button.dataset.color;
            
            productCard.querySelectorAll('.color-squares').forEach(btn => {
                btn.classList.remove('selected');
            });
            
            button.classList.add('selected');
            
            productCard.querySelectorAll('.product-image').forEach(img => {
                img.style.display = 'none';
            });
            
            const selectedImage = productCard.querySelector(`.product-image[data-color="${selectedColor}"]`);
            if (selectedImage) {
                selectedImage.style.display = 'block';
            }
            
            productCard.setAttribute('data-selected-color', selectedColor);
        });
    });
}

// ===============================
// CART FUNCTIONS
// ===============================
function saveCartToStorage() {
    localStorage.setItem('cartItems', JSON.stringify(cartItems));
}

function addProductToCart(productType, size, color, threadColor = null) {
    console.log('Starting addProductToCart with:', { productType, size, color, threadColor });

    if (!size) {
        alert('Please select a size');
        return;
    }

    try {
        if (!PRODUCT_TYPES[productType]) {
            console.error('Invalid product type:', productType);
            throw new Error('Invalid product type');
        }

        const existingItemIndex = cartItems.findIndex(item => {
            let match = item.size === size && item.shirtColor === color;
            if (PRODUCT_TYPES[productType].hasThreadColor) {
                match = match && item.threadColor === threadColor;
            }
            return match;
        });

        if (existingItemIndex !== -1) {
            cartItems[existingItemIndex].quantity += 1;
        } else {
            const newItem = createCartItem(productType, size, color, threadColor);
            console.log('New item being added:', newItem);
            cartItems.push(newItem);
        }
        saveCartToStorage();

        // Get reference to cart icon
        const cart = document.querySelector('.cart-icon');
        
        if (!cart) {
            console.error('Could not find cart element');
            throw new Error('Missing required elements');
        }

        // Create flying image
        const flyingImage = document.createElement('img');
        const imagePath = PRODUCT_TYPES[productType].hasThreadColor 
            ? `Nexira-Images/Nexira-tshirt-${color}-embroidery-${threadColor}.png`
            : `Nexira-Images/Nexira-${productType.toLowerCase()}-${color}.png`;
        
        console.log('Image path:', imagePath);
        flyingImage.src = imagePath;
        flyingImage.classList.add('cart-animation');
        
        // Get the clicked button's position
        const clickedButton = event.target;
        const buttonRect = clickedButton.getBoundingClientRect();
        const cartRect = cart.getBoundingClientRect();
        
        flyingImage.style.top = buttonRect.top + 'px';
        flyingImage.style.left = buttonRect.left + 'px';
        
        document.body.appendChild(flyingImage);
        
        // Animate flying image
        setTimeout(() => {
            flyingImage.style.top = cartRect.top + 'px';
            flyingImage.style.left = cartRect.left + 'px';
            flyingImage.style.width = '50px';
            flyingImage.style.height = '50px';
            flyingImage.style.opacity = '0';
        }, 0);

        // Remove flying image and update cart
        setTimeout(() => {
            flyingImage.remove();
            updateCartDisplay();
            updateCartCount();
        }, 1000);

        // Show toast notification
        const popup = document.getElementById('cartPopup');
        popup.style.display = 'block';
        popup.style.animation = 'slideUp 0.3s ease-out';

        // Hide toast notification
        setTimeout(() => {
            popup.style.animation = 'fadeOut 0.3s ease-out';
            setTimeout(() => {
                popup.style.display = 'none';
                popup.style.animation = 'slideUp 0.3s ease-out';
            }, 300);
        }, 2000);

    } catch (error) {
        console.error('Error adding to cart:', error);
        console.error('Error details:', error.message);
        console.error('Stack trace:', error.stack);
        alert('There was a problem adding the item to cart. Please try again.');
    }
}

function updateCartCount() {
    const cartCount = document.querySelector('.cart-count');
    if (!cartCount) return;

    cartItems = JSON.parse(localStorage.getItem('cartItems')) || [];
    const totalItems = cartItems.reduce((sum, item) => sum + (item.quantity || 1), 0);
    cartCount.textContent = totalItems;
    cartCount.style.display = totalItems > 0 ? 'block' : 'none';
}

function updateCartDisplay() {
    const cartContainer = document.getElementById('cartItems');
    if (!cartContainer) return;

    cartItems = JSON.parse(localStorage.getItem('cartItems')) || [];
    
    cartContainer.innerHTML = '';
    let total = 0;

    cartItems.forEach((item, index) => {
        const itemElement = document.createElement('div');
        itemElement.className = 'cart-item';
        
        const capitalizedShirtColor = item.shirtColor.charAt(0).toUpperCase() + item.shirtColor.slice(1);
        const capitalizedThreadColor = item.threadColor ? 
            item.threadColor.charAt(0).toUpperCase() + item.threadColor.slice(1) : '';
        
        itemElement.innerHTML = `
            <img src="${item.image}" alt="${item.productName}">
            <div class="cart-item-details">
                <p>Size: ${item.size.toUpperCase()}</p>
                <p>Color: ${capitalizedShirtColor}</p>
                ${item.hasThreadColor && item.threadColor ? `<p>Thread: ${capitalizedThreadColor}</p>` : ''}
                <p>Quantity: ${item.quantity}</p>
                <p>£${item.price}</p>
            </div>
            <button onclick="removeFromCart(${index})" class="remove-item">×</button>
        `;
        
        cartContainer.appendChild(itemElement);
        total += item.price * item.quantity;
    });

    const totalElement = document.getElementById('cartTotal');
    if (totalElement) {
        totalElement.textContent = `Total: £${total.toFixed(2)}`;
    }
}

// ===============================
// CART PREVIEW FUNCTIONS
// ===============================

function removeFromCart(index) {
    cartItems = JSON.parse(localStorage.getItem('cartItems')) || [];
    
    if (cartItems[index].quantity > 1) {
        cartItems[index].quantity -= 1;
    } else {
        cartItems.splice(index, 1);
    }
    
    localStorage.setItem('cartItems', JSON.stringify(cartItems));
    updateCartDisplay();
    updateCartCount();
}

async function checkout() {
    try {
        const cartItems = JSON.parse(localStorage.getItem('cartItems')) || [];
        
        if (cartItems.length === 0) {
            // Show toast notification instead of alert
            const popup = document.getElementById('cartPopup');
            const popupContent = popup.querySelector('.cart-popup-content');
            
            // Change the content to show empty cart message
            popupContent.textContent = "Cannot checkout - your cart is empty";
            
            // Show the popup
            popup.style.display = 'block';
            popup.style.animation = 'slideUp 0.3s ease-out';
            
            // Hide the popup after a delay
            setTimeout(() => {
                popup.style.animation = 'fadeOut 0.3s ease-out';
                setTimeout(() => {
                    popup.style.display = 'none';
                    popup.style.animation = 'slideUp 0.3s ease-out';
                    // Reset the content back to the original message
                    popupContent.textContent = "✓ Added to Cart";
                }, 300);
            }, 2000);
            
            return;
        }

        // Rest of your checkout code...
        console.log('Cart items being sent:', cartItems);

        // Disable checkout button
        const checkoutBtn = document.getElementById('checkoutBtn');
        if (checkoutBtn) {
            checkoutBtn.disabled = true;
            checkoutBtn.textContent = 'Processing...';
        }

        // Format items for the server
        const formattedItems = cartItems.map(item => ({
            productName: item.productName,
            size: item.size,
            shirtColor: item.shirtColor,
            threadColor: item.threadColor,
            price: parseFloat(item.price),
            quantity: item.quantity || 1
        }));

        console.log('Formatted items:', formattedItems);

        const response = await fetch('https://nexira-site.onrender.com/create-checkout-session', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            mode: 'cors',
            body: JSON.stringify({
                items: formattedItems
            })
        });

        console.log('Response status:', response.status);
        const responseData = await response.json();
        console.log('Response data:', responseData);

        if (!response.ok) {
            throw new Error(responseData.error || 'Server error');
        }

        if (responseData.url) {
            window.location.href = responseData.url;
        } else {
            throw new Error('No checkout URL received');
        }

    } catch (error) {
        console.error('Checkout error details:', {
            message: error.message,
            stack: error.stack
        });
        
        // Show toast notification for errors
        const popup = document.getElementById('cartPopup');
        const popupContent = popup.querySelector('.cart-popup-content');
        
        // Change the content to show error message
        popupContent.textContent = `Checkout error: ${error.message}. Please try again.`;
        
        // Show the popup
        popup.style.display = 'block';
        popup.style.animation = 'slideUp 0.3s ease-out';
        
        // Hide the popup after a delay
        setTimeout(() => {
            popup.style.animation = 'fadeOut 0.3s ease-out';
            setTimeout(() => {
                popup.style.display = 'none';
                popup.style.animation = 'slideUp 0.3s ease-out';
                // Reset the content back to the original message
                popupContent.textContent = "✓ Added to Cart";
            }, 300);
        }, 2000);
        
        // Re-enable checkout button
        const checkoutBtn = document.getElementById('checkoutBtn');
        if (checkoutBtn) {
            checkoutBtn.disabled = false;
            checkoutBtn.textContent = 'Checkout';
        }
    }
}



// Create a function for the scroll animation
function initScrollAnimation() {
    const productSection = document.getElementById('productInfo1');
    if (productSection) {
        const onScroll = () => {
            const rect = productSection.getBoundingClientRect();
            if (rect.top < window.innerHeight - 100) {
                productSection.classList.add('visible');
                window.removeEventListener('scroll', onScroll);
            }
        };
        
        // Initial check in case the element is already in view
        onScroll();
        
        // Add scroll listener
        window.addEventListener('scroll', onScroll);
    }
}

// Call it outside DOMContentLoaded
initScrollAnimation();

// ===============================
// SEARCH FUNCTIONS
// ===============================
function initializeSearch() {
    // Get both search inputs
    const navbarSearch = document.getElementById('searchInput');
    const mainSearch = document.getElementById('productSearch');
    
    // Set up the search icon toggle functionality
    const searchIcon = document.querySelector('.search-icon');
    
    if (searchIcon && navbarSearch) {
        // Toggle search input visibility when icon is clicked
        searchIcon.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            
            navbarSearch.classList.toggle('active');
            
            // If we're showing the search input, focus it
            if (navbarSearch.classList.contains('active')) {
                navbarSearch.focus();
            } else {
                // If we're hiding it, clear the input and reset product visibility
                navbarSearch.value = '';
                filterProducts('');
            }
        });
        
        // Hide search when clicking outside
        document.addEventListener('click', function(e) {
            if (!e.target.closest('.search-wrapper')) {
                navbarSearch.classList.remove('active');
                // Clear the input and reset product visibility
                navbarSearch.value = '';
                filterProducts('');
            }
        });
    }
    
    // Add event listeners to both search inputs
    if (navbarSearch) {
        navbarSearch.addEventListener('input', function() {
            filterProducts(this.value);
        });
        
        // Add enter key functionality
        navbarSearch.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                filterProducts(this.value);
            }
        });
    }
    
    if (mainSearch) {
        mainSearch.addEventListener('input', function() {
            filterProducts(this.value);
        });
        
        // Add enter key functionality
        mainSearch.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                filterProducts(this.value);
            }
        });
    }
}

function filterProducts(query) {
    query = query.toLowerCase().trim();
    const productCards = document.querySelectorAll('.product-card');
    
    productCards.forEach(card => {
        const title = card.querySelector('.product-title').textContent.toLowerCase();
        
        // Check if product title contains the search query
        if (title.includes(query)) {
            card.style.display = 'block';
        } else {
            card.style.display = 'none';
        }
    });
}



// ===============================
// MAIN EVENT LISTENERS
// ===============================
document.addEventListener('DOMContentLoaded', () => {
    // Initialize cart
    updateCartCount();
    updateCartDisplay();
    initScrollAnimation();
    
    // Initialize search functionality
    initializeSearch();

    // Color button handlers for catalog
    const catalogColorButtons = document.querySelectorAll('.color-button');
    catalogColorButtons.forEach(button => {
        button.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            
            // Remove selected class from all color buttons in this product card
            const productCard = button.closest('.product-card');
            productCard.querySelectorAll('.color-button').forEach(btn => {
                btn.classList.remove('selected');
            });
            
            // Add selected class to clicked button
            button.classList.add('selected');
            selectedColor = button.dataset.color;
            
            // Update product image
            const selectedImage = productCard.querySelector(`.product-image[data-color="${selectedColor}"]`);
            if (selectedImage) {
                productCard.querySelectorAll('.product-image').forEach(img => {
                    img.style.display = 'none';
                });
                selectedImage.style.display = 'block';
            }
        });
    });

    // Menu functionality
    const menuIcon = document.querySelector('.menu-icon');
    const menuContent = document.querySelector('.menu-content');
    // ... rest of your existing code

    if (menuIcon && menuContent) {
        menuIcon.addEventListener('click', (e) => {
            e.stopPropagation();
            menuContent.classList.toggle('show');
        });

        document.addEventListener('click', (e) => {
            if (!menuIcon.contains(e.target) && !menuContent.contains(e.target)) {
                menuContent.classList.remove('show');
            }
        });
    }

    // Cart modal trigger
    const cartIcon = document.querySelector('.cart-icon');
    if (cartIcon) {
        cartIcon.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            openCartModal();
        });
    }

    // Close buttons for modals
    const closeModalButtons = document.querySelectorAll('.close-modal');
    closeModalButtons.forEach(button => {
        button.addEventListener('click', () => {
            closeModal();
        });
    });

    const closeCartButtons = document.querySelectorAll('.close-cart');
    closeCartButtons.forEach(button => {
        button.addEventListener('click', () => {
            closeCartModal();
        });
    });

    // Overlay click handling
    const overlay = document.getElementById('overlay');
    if (overlay) {
        overlay.addEventListener('click', () => {
            closeModal();
            closeCartModal();
        });
    }

    // Initialize color selection
    initColorSelection();

    // Size selection buttons
    const sizeButtons = document.querySelectorAll('.size-button');
    sizeButtons.forEach(button => {
        button.addEventListener('click', (e) => {
            selectSize(button.getAttribute('data-size'), e);
        });
    });

    // Add to cart buttons
    const addToCartButton = document.querySelector('.add-to-cart-button');
    if (addToCartButton) {
        addToCartButton.addEventListener('click', () => {
            addProductToCart('TSHIRT', currentSize, currentShirtColor, currentThreadColor);
        });
    }

    const zipUpButton = document.querySelector('.zipup-add-button');
    if (zipUpButton) {
        zipUpButton.addEventListener('click', () => {
            addProductToCart('ZIPUP', selectedSize, selectedColor);
        });
    }
     const threadButtons = document.querySelectorAll('.thread-color-button');
        console.log('Number of thread buttons found:', threadButtons.length);
        
        threadButtons.forEach(button => {
            button.style.cursor = 'pointer'; // Make it obvious they're clickable
            button.onclick = function() {
                console.log('Thread button clicked');
                currentThreadColor = this.getAttribute('data-thread');
                threadButtons.forEach(b => b.classList.remove('selected'));
                this.classList.add('selected');
                updateImage();
            };
        });
});
    
// ESC key handling for modals
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        closeModal();
        closeCartModal();
    }
});

const customizeButtons = document.querySelectorAll('.customize-button');
customizeButtons.forEach(button => {
    button.addEventListener('click', (e) => {
        console.log('Customize button clicked'); // Debug log
        e.preventDefault();
        e.stopPropagation();
        openModal();
    });
});

document.addEventListener('DOMContentLoaded', function() {
    // Overlay click handler for both modals
    const overlay = document.getElementById('overlay');
    if (overlay) {
        overlay.addEventListener('click', function(event) {
            // Only close if clicking directly on the overlay
            if (event.target === overlay) {
                closeModal();
                closeCartModal();
            }
        });
    }

    // Close customize modal when clicking outside
    const customizeModal = document.getElementById('customizeModal');
    if (customizeModal) {
        customizeModal.addEventListener('click', function(event) {
            // Only close if clicking directly on the modal background, not its contents
            if (event.target === customizeModal) {
                closeModal();
            }
        });
    }

    // Close cart modal when clicking outside
    const cartModal = document.getElementById('cartModal');
    if (cartModal) {
        cartModal.addEventListener('click', function(event) {
            // Only close if clicking directly on the modal background, not its contents
            if (event.target === cartModal) {
                closeCartModal();
            }
        });
    }

    // Close buttons for modals
    const closeModalButtons = document.querySelectorAll('.close-modal');
    closeModalButtons.forEach(button => {
        button.addEventListener('click', closeModal);
    });

    const closeCartButtons = document.querySelectorAll('.close-cart');
    closeCartButtons.forEach(button => {
        button.addEventListener('click', closeCartModal);
    });

    // ESC key to close modals
    document.addEventListener('keydown', function(event) {
        if (event.key === 'Escape') {
            closeModal();
            closeCartModal();
        }
    });
});

const submenuToggles = document.querySelectorAll('.submenu-toggle');

submenuToggles.forEach(toggle => {
    toggle.addEventListener('click', function(e) {
        e.preventDefault();
        e.stopPropagation();

        // Get the parent dropdown-item and its submenu
        const dropdownItem = this.closest('.dropdown-item');
        const submenu = dropdownItem.querySelector('.submenu');

        // Close all other submenus first
        document.querySelectorAll('.submenu').forEach(menu => {
            if (menu !== submenu) {
                menu.classList.remove('active');
            }
        });

        // Reset all other arrows
        document.querySelectorAll('.submenu-toggle').forEach(arrow => {
            if (arrow !== this) {
                arrow.style.transform = 'rotate(0deg)';
            }
        });

        // Toggle the clicked submenu
        submenu.classList.toggle('active');

        // Rotate the arrow
        this.style.transform = submenu.classList.contains('active') 
            ? 'rotate(90deg)' 
            : 'rotate(0deg)';
    });
});

// Close submenus when clicking outside
document.addEventListener('click', function(e) {
    if (!e.target.closest('.dropdown-item')) {
        // Close all submenus
        document.querySelectorAll('.submenu').forEach(submenu => {
            submenu.classList.remove('active');
        });
        
        // Reset all arrows
        document.querySelectorAll('.submenu-toggle').forEach(arrow => {
            arrow.style.transform = 'rotate(0deg)';
        });
    }
});

// Add click handlers for product containers
const productContainers = document.querySelectorAll('.product-container');
productContainers.forEach(container => {
    container.addEventListener('click', function(event) {
        // Don't expand if clicking on interactive elements
        if (!event.target.closest('.size-button') && 
            !event.target.closest('.color-button') && 
            !event.target.closest('.product-add-to-cart')) {
            expandProductCard(this);
        }
    });
});

function expandProductCard(element) {
    const card = element.closest('.product-card');
    const details = element.querySelector('.product-details');
    
    if (card.classList.contains('expanded')) {
        card.classList.remove('expanded');
        details.style.maxHeight = '0';
        details.style.opacity = '0';
        details.style.visibility = 'hidden';
    } else {
        card.classList.add('expanded');
        details.style.maxHeight = '1000px';
        details.style.opacity = '1';
        details.style.visibility = 'visible';
    }
}

// Detect if device supports touch
const isTouchDevice = ('ontouchstart' in window) || (navigator.maxTouchPoints > 0);

const dropdownItems = document.querySelectorAll('.dropdown-item');

dropdownItems.forEach(item => {
    const mainLink = item.querySelector('.main-link');
    const arrow = item.querySelector('.fas.fa-chevron-right');
    const submenu = item.querySelector('.submenu');
    
    if (isTouchDevice) {
        // For touch devices: prevent main link from triggering on first touch
        mainLink.addEventListener('click', function(e) {
            if (!submenu.classList.contains('active')) {
                e.preventDefault();
            }
        });
        
        // Make arrow clickable on touch devices
        arrow.style.padding = '10px'; // Make touch target bigger
        arrow.style.cursor = 'pointer';
        
        arrow.addEventListener('touchend', function(e) {
            e.preventDefault();
            e.stopPropagation();
            
            // Close other submenus
            dropdownItems.forEach(otherItem => {
                if (otherItem !== item) {
                    const otherSubmenu = otherItem.querySelector('.submenu');
                    const otherArrow = otherItem.querySelector('.fas.fa-chevron-right');
                    otherSubmenu.classList.remove('active');
                    otherArrow.style.transform = 'rotate(0deg)';
                }
            });
            
            // Toggle current submenu
            submenu.classList.toggle('active');
            arrow.style.transform = submenu.classList.contains('active') ? 'rotate(90deg)' : 'rotate(0deg)';
        });
    } else {
        // For desktop: show submenu on hover
        item.addEventListener('mouseenter', () => {
            submenu.classList.add('active');
        });
        
        item.addEventListener('mouseleave', () => {
            submenu.classList.remove('active');
        });
    }
});
