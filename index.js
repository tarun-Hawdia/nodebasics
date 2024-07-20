const express = require('express');
const mongoose = require('mongoose');
const Customer = require("./customerSchema"); 
const app = express();
const PORT = 5000;

require('dotenv').config(); 

app.use(express.json()); 

const uri = process.env.MONGODB_URI;

mongoose.connect(uri)
    .then(() => console.log('Connected to MongoDB Atlas'))
    .catch(err => console.error('Could not connect to MongoDB Atlas', err));

const rateLimitMap = new Map();
let globalRateLimit = [];


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


        const time=Date.now();

        if(rateLimitMap.has(customer_name)){
            const lastHit= rateLimitMap.get(customer_map);

            if(now-lastHit<12000){
                return res.status(429).json({error:'maximum limit exceeded'});
            }
        }
        
        rateLimitMap.set(customer_name,now);

        globalRateLimit=globalRateLimit.filter(timestamp=> now-timestamp < 300000);

        if(globalRateLimit.length >=2){
            return res.status(429).json({
                error: 'limit of 2 req per min exceeded'
            });
        }

        globalRateLimit.push(now);
        

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
