const express = require('express');
const mongoose = require('mongoose');
const Customer = require("./customerSchema"); // Adjust the path if necessary
const app = express();
const PORT = 3000;

require('dotenv').config(); // Load environment variables from .env file

app.use(express.json()); // Ensure this is included to parse JSON bodies

// Use the MongoDB URI from environment variables
const uri = process.env.MONGODB_URI;

mongoose.connect(uri)
    .then(() => console.log('Connected to MongoDB Atlas'))
    .catch(err => console.error('Could not connect to MongoDB Atlas', err));

// POST endpoint for saving data
app.post('/db-save', async (req, res) => {
    try {
        const { customer_name, dob, monthly_income } = req.body;

        console.log('Request body:', req.body);

        if (!customer_name || !dob || !monthly_income) {
            return res.status(400).json({ error: 'All parameters are required.' });
        }

        const birthDate = new Date(dob);
        const age = Math.floor((Date.now() - birthDate) / 31557600000);

        if (age <= 15) {
            return res.status(400).json({ error: 'Age must be above 15.' });
        }

        // Save to database
        const customer = new Customer({ customer_name, dob, monthly_income });
        await customer.save();

        res.status(200).json({ message: 'Data saved successfully!' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
