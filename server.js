require('dotenv').config();
const express = require('express');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const cors = require('cors');
const path = require('path');

const app = express();

// Middleware
app.use(express.json());
app.use(cors({
    origin: ['https://nexira-site.onrender.com', 'http://localhost:3000'],
    credentials: true
}));

// Serve static files
app.use(express.static('public'));

// Create checkout session endpoint
app.post('/create-checkout-session', async (req, res) => {
    try {
        if (!req.body.items || !Array.isArray(req.body.items)) {
            return res.status(400).json({ error: 'Invalid request body' });
        }

        const lineItems = req.body.items.map(item => ({
            price_data: {
                currency: 'gbp',
                product_data: {
                    name: `T-Shirt (${item.size}) - ${item.shirtColor} with ${item.threadColor} embroidery`,
                    description: 'Custom Embroidered T-Shirt'
                },
                unit_amount: Math.round(item.price * 100),
            },
            quantity: item.quantity || 1,
        }));

        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items: lineItems,
            mode: 'payment',
            allow_promotion_codes: true, // Make sure this is enabled
            success_url: 'https://nexira-site.onrender.com?success=true',
            cancel_url: 'https://nexira-site.onrender.com?canceled=true',
            shipping_address_collection: {
                allowed_countries: ['GB']
            },
            shipping_options: [
                {
                    shipping_rate_data: {
                        type: 'fixed_amount',
                        fixed_amount: {
                            amount: 500,
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
        
        res.json({ url: session.url });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: error.message });
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

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Something broke!' });
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


const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
