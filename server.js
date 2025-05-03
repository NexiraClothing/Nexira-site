require('dotenv').config();
const express = require('express');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const cors = require('cors');
const path = require('path');

const app = express();

// Middleware
const corsOptions = {
    origin: function (origin, callback) {
        const allowedOrigins = [
            'https://nexira-site.onrender.com',
            'http://127.0.0.1:5500',
            'http://localhost:3000'
        ];
        
        // Allow requests with no origin (like mobile apps or curl requests)
        if (!origin) return callback(null, true);
        
        if (allowedOrigins.indexOf(origin) !== -1) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    methods: ['GET', 'POST', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Accept', 'Origin'],
    credentials: true
};

// CORS Preflight middleware
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', req.headers.origin);
    res.header('Access-Control-Allow-Credentials', true);
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
    
    // Handle preflight
    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }
    
    next();
});

app.use(express.json());
app.use(cors(corsOptions));

// Add preflight handler
app.options('*', cors(corsOptions));

// Rest of your routes and middleware remain the same...

// Serve static files
app.use(express.static('public'));

// Create checkout session endpoint
app.post('/create-checkout-session', async (req, res) => {
    try {
        // Log the received request body
        console.log('Received checkout request:', req.body);

        if (!req.body.items || !Array.isArray(req.body.items)) {
            console.log('Invalid request body structure:', req.body);
            return res.status(400).json({ error: 'Invalid request body - items array required' });
        }

        const lineItems = req.body.items.map(item => {
            console.log('Processing item:', item);
            return {
                price_data: {
                    currency: 'gbp',
                    product_data: {
                        name: `${item.productName || 'Product'} (${item.size}) - ${item.shirtColor}`,
                        description: `Size: ${item.size}`
                    },
                    unit_amount: Math.round(parseFloat(item.price) * 100),
                },
                quantity: item.quantity || 1,
            };
        });

        console.log('Created line items:', lineItems);

        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items: lineItems,
            mode: 'payment',
            allow_promotion_codes: true,
            success_url: 'https://nexira-site.onrender.com/success.html?session_id={CHECKOUT_SESSION_ID}',
            cancel_url: 'https://nexira-site.onrender.com?canceled=true',
            shipping_address_collection: {
                allowed_countries: ['GB']
            },
            shipping_options: [
                {
                    shipping_rate_data: {
                        type: 'fixed_amount',
                        fixed_amount: {
                            amount: 199,
                            currency: 'gbp',
                        },
                        display_name: 'Standard Shipping',
                        delivery_estimate: {
                            minimum: {
                                unit: 'business_day',
                                value: 5,
                            },
                            maximum: {
                                unit: 'business_day',
                                value: 7,
                            },
                        },
                    },
                }
            ]
        });
        
        console.log('Stripe session created:', session);
        res.json({ url: session.url });
        
    } catch (error) {
        console.error('Detailed error in checkout:', error);
        res.status(500).json({ 
            error: error.message,
            details: error.stack
        });
    }
});

// Health check endpoint
app.get('/health', (req, res) => {
    res.status(200).json({ status: 'healthy' });
});

// Root route
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Verify session endpoint
app.get('/verify-session', async (req, res) => {
    try {
        const session = await stripe.checkout.sessions.retrieve(req.query.session_id);
        res.json({
            status: session.payment_status,
            customer_email: session.customer_details.email
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Add this new endpoint to create a free shipping coupon
app.post('/create-free-shipping-coupon', async (req, res) => {
    try {
        // First create a coupon for free shipping
        const coupon = await stripe.coupons.create({
            name: 'Free Shipping',
            amount_off: 199, // £1.99 in pence
            currency: 'gbp',
            duration: 'once'
        });

        // Create a promotion code that uses this coupon
        const promotionCode = await stripe.promotionCodes.create({
            coupon: coupon.id,
            code: process.env.PRIV_SHIPPING, // Your custom code for customers to enter
            max_redemptions: 999999, // Maximum number of times this code can be used
            expires_at: Math.floor(Date.now() / 1000) + (90 * 24 * 60 * 60) // Expires in 90 days
        });

        res.json({
            message: 'Free shipping promotion code created successfully',
            promotionCode: promotionCode
        });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: error.message });
    }
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Something broke!' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
