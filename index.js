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
            const lastHit= rateLimitMap.get(customer_name);

            if(time-lastHit<12000){
                return res.status(429).json({error:'maximum limit exceeded'});
            }
        }
        
        rateLimitMap.set(customer_name,time);

        globalRateLimit=globalRateLimit.filter(timestamp=> time-timestamp < 300000);

        if(globalRateLimit.length >=2){
            return res.status(429).json({
                error: 'limit of 2 req per five min exceeded'
            });
        }

        globalRateLimit.push(time);


        // Save to database
        const customer = new Customer({ customer_name, dob, monthly_income });
        await customer.save();

        res.status(200).json({ message: 'Data saved successfully!' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.post('/time-based-api',async(req,res)=>{
    try{
        const { customer_name, dob, monthly_income } = req.body;

        if(!customer_name || !dob || !monthly_income){
            return res.status(400).json({error:' all parameters are required'});
        }

        const now= new Date();
        const day=now.getDay(); // this will 0 for sunday 1 for monday and so on
        
        console.log(day);

        const hour=now.getHours();
        console.log(hour);

        if(day===1){
            return res.status(403).json({ message: "Please don't use this API on Monday"});
        }

        if(hour>=8 && hour<15){
            return res.status(403).json({message: "Please try after 3pm"});
        }

        // Save to database
        const customer = new Customer({ customer_name, dob, monthly_income });
        await customer.save();

        res.status(200).json({ message: 'Data saved successfully!' });

    }
    catch(error){
        res.status(500).json({ error: error.message});
    }
});

app.get('/db-search',async(req,res)=>{

    const startTime = process.hrtime();

    try{
        const currentDate=new Date();

        const minDate = new Date(currentDate);
        minDate.setFullYear(minDate.getFullYear() - 25); // 25 years ago
        const maxDate = new Date(currentDate);
        maxDate.setFullYear(maxDate.getFullYear() - 10); // 10 years ago

        // Find customers whose dob is between minDate and maxDate
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
    }
    catch(error){
        res.status(500).json({ error: error.message});
    }
});


app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
