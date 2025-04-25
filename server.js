require('dotenv').config();
const express = require('express');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const cors = require('cors');
const path = require('path');

const app = express();

// Middleware
app.use(express.json());
app.use(cors());

// Serve static files - this line is crucial
app.use(express.static('public'));

// Create checkout session endpoint
app.post('/create-checkout-session', async (req, res) => {
    try {
        const lineItems = req.body.items.map(item => ({
            price_data: {
                currency: 'gbp',
                product_data: {
                    name: `T-Shirt (${item.size}) - ${item.shirtColor} with ${item.threadColor} embroidery`,
                },
                unit_amount: Math.round(item.price * 100),
            },
            quantity: item.quantity || 1,
        }));

        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items: lineItems,
            mode: 'payment',
            success_url: 'http://localhost:3000?success=true',
            cancel_url: 'http://localhost:3000?canceled=true'
        });
        
        res.json({ url: session.url });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: error.message });
    }
});

// Root route
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
