const mongoose = require('mongoose');

const investmentSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    pool: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Pool',
        required: true,
    },
    investments: [
        {
            option: {
                type: String,
                required: true,  // E.g., Option A, Option B
            },
            amount: {
                type: Number,
                required: true,  // Amount invested by the user
                min: 0,
            },
        },
    ],
    totalInvestment: {
        type: Number,
        required: true,
        min: 0,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

module.exports = mongoose.model('Investment', investmentSchema);
