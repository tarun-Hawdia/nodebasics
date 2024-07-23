const express = require('express');
const path = require('path');
const session = require('express-session');
const mongoose = require('mongoose');
const Customer = require('./customerSchema');
const { router: authRouter, checkAuth } = require('./auth');  
const aggregateRouter = require('./aggregate');  // Import the new route
require('dotenv').config();

const app = express();
const PORT = 5000;

// Connect to MongoDB
const uri = process.env.MONGODB_URI;
mongoose.connect(uri)
    .then(() => console.log('Connected to MongoDB Atlas'))
    .catch(err => console.error('Could not connect to MongoDB Atlas', err));

// Middleware
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
}));

// Use the auth routes
app.use('/', authRouter);

// Use the aggregate route
app.use('/', aggregateRouter);

// Route to serve login page
app.get('/', (req, res) => {
    if (req.session.accessToken) {
        res.redirect('/api-calls');
    } else {
        res.sendFile(path.join(__dirname, 'public', 'index.html'));
    }
});

// API Calls Page
app.get('/api-calls', checkAuth, (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'api-calls.html'));
});

// POST endpoint for saving data
app.post('/db-save', checkAuth, async (req, res) => {
    try {
        const { customer_name, dob, monthly_income } = req.body;

        if (!customer_name || !dob || !monthly_income) {
            return res.status(400).json({ error: 'All parameters are required.' });
        }

        const birthDate = new Date(dob);
        const age = Math.floor((Date.now() - birthDate) / 31557600000);

        if (age <= 15) {
            return res.status(400).json({ error: 'Age must be above 15.' });
        }

        const customer = new Customer({ customer_name, dob, monthly_income });
        await customer.save();

        res.status(200).json({ message: 'Data saved successfully!' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// POST endpoint for time-based data
app.post('/time-based-api', checkAuth, async (req, res) => {
    try {
        const { customer_name, dob, monthly_income } = req.body;

        if (!customer_name || !dob || !monthly_income) {
            return res.status(400).json({ error: 'All parameters are required.' });
        }

        const now = new Date();
        const day = now.getDay();
        const hour = now.getHours();

        if (day === 1) {
            return res.status(403).json({ message: "Please don't use this API on Monday" });
        }

        if (hour >= 8 && hour < 15) {
            return res.status(403).json({ message: "Please try after 3pm" });
        }

        const customer = new Customer({ customer_name, dob, monthly_income });
        await customer.save();

        res.status(200).json({ message: 'Data saved successfully!' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// GET endpoint for searching customers
app.get('/db-search', checkAuth, async (req, res) => {
    const startTime = process.hrtime();

    try {
        const currentDate = new Date();
        const minDate = new Date(currentDate);
        minDate.setFullYear(minDate.getFullYear() - 25);
        const maxDate = new Date(currentDate);
        maxDate.setFullYear(maxDate.getFullYear() - 10);

        const customers = await Customer.find({
            dob: { $gte: minDate, $lte: maxDate }
        }).select('customer_name -_id');

        const customerNames = customers.map(customer => customer.customer_name);

        const endTime = process.hrtime(startTime);
        const timeTaken = (endTime[0] * 1e9 + endTime[1]) / 1e9;

        res.status(200).json({
            customer_names: customerNames,
            time_taken: timeTaken.toFixed(3)
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
