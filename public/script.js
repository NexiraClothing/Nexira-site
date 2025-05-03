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

function checkout() {
    // Get cart items
    const cartItems = JSON.parse(localStorage.getItem('cartItems')) || [];
    
    if (cartItems.length === 0) {
        alert('Your cart is empty');
        return;
    }

    // Calculate total
    const total = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);

    // Create order summary
    const orderSummary = cartItems.map(item => {
        return `${item.productName} (${item.shirtColor}) - Size: ${item.size.toUpperCase()} - Quantity: ${item.quantity}`;
    }).join('\n');

    // Show order confirmation
    const confirmMessage = `Order Summary:\n\n${orderSummary}\n\nTotal: £${total.toFixed(2)}\n\nProceed to checkout?`;
    
    if (confirm(confirmMessage)) {
        // Here you would typically redirect to your payment processing page
        alert('This is where you would be redirected to the payment gateway.\nFor now, this is just a demonstration.');
        
        // Clear cart after successful order
        localStorage.removeItem('cartItems');
        cartItems = [];
        updateCartDisplay();
        updateCartCount();
        closeCartModal();
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
// MAIN EVENT LISTENERS
// ===============================
document.addEventListener('DOMContentLoaded', () => {
    // Initialize cart
    updateCartCount();
    updateCartDisplay();
    initScrollAnimation();

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
                alert('Thread button clicked: ' + this.getAttribute('data-thread'));
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
