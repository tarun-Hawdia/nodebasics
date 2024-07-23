// aggregate.js
const express = require('express');
const Customer = require('./customerSchema');
const { checkAuth } = require('./auth'); 

const router = express.Router();

router.get('/api/aggregate', checkAuth, async (req, res) => {
    try {
        const aggregationPipeline = [
            {
                $match: {
                    monthly_income: { $gte: 1000 } // Example filter condition
                }
            },
            {
                $addFields: {
                    age: {
                        $round: {
                            $divide: [
                                { $subtract: [new Date(), "$dob"] },
                                1000 * 60 * 60 * 24 * 365
                            ]
                        }
                    }
                }
            },
            {
                $project: {
                    customer_name: 1,
                    age: 1,
                    monthly_income: 1,
                    _id: 0
                }
            }
        ];

        const result = await Customer.aggregate(aggregationPipeline);
        res.status(200).json(result);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
