require('dotenv').config();
const express = require('express');
if (!process.env.STRIPE_SECRET_KEY) {
    console.error('STRIPE_SECRET_KEY is not set!');
    process.exit(1);
}
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const cors = require('cors');
const path = require('path');

const app = express();

// Middleware
const corsOptions = {
    origin: function (origin, callback) {
        const allowedOrigins = [
            'https://nexira-site.onrender.com',
            'https://www.nexiraclothing.net',
            'http://127.0.0.1:5500',
            'http://localhost:3000'
        ];
        
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
    
    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }
    next();
});

app.use(express.json());
app.use(cors(corsOptions));
app.use(express.static('public'));
app.options('*', cors(corsOptions));

// Single create-checkout-session endpoint
app.post('/create-checkout-session', async (req, res) => {
    try {
        console.log('Request received:', {
            body: req.body,
            headers: req.headers
        });

        if (!req.body.items || !Array.isArray(req.body.items)) {
            console.log('Invalid request body structure:', req.body);
            return res.status(400).json({ error: 'Invalid request body - items array required' });
        }

        const lineItems = req.body.items.map((item, index) => {
            if (!item.productName || !item.price || !item.size) {
                throw new Error(`Invalid item at index ${index}: ${JSON.stringify(item)}`);
            }

            const unitAmount = Math.round(parseFloat(item.price) * 100);
            if (isNaN(unitAmount)) {
                throw new Error(`Invalid price for item ${item.productName}: ${item.price}`);
            }

            return {
                price_data: {
                    currency: 'gbp',
                    product_data: {
                        name: `${item.productName} (${item.size}) - ${item.shirtColor}`,
                        description: `Size: ${item.size}, Color: ${item.shirtColor}${item.threadColor ? `, Thread: ${item.threadColor}` : ''}`
                    },
                    unit_amount: unitAmount
                },
                quantity: item.quantity || 1
            };
        });

        console.log('Created line items:', lineItems);

        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items: lineItems,
            mode: 'payment',
            allow_promotion_codes: true,
            success_url: 'https://www.nexiraclothing.net/success.html?session_id={CHECKOUT_SESSION_ID}',
            cancel_url: 'https://www.nexiraclothing.net?canceled=true',
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

        console.log('Session created successfully:', session.id);
        res.json({ url: session.url });

    } catch (error) {
        console.error('Detailed server error:', {
            message: error.message,
            stack: error.stack,
            type: error.type,
            code: error.code
        });

        res.status(500).json({
            error: error.message,
            type: error.type,
            code: error.code
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

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Something broke!' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
