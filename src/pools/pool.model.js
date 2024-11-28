const mongoose = require('mongoose');

const poolSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    options: [{
        type: String,
        required: true
    }],
    isPrivate: {
        type: Boolean,
        default: false
    },
    creator: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    // Store investments as part of the vote (investment is considered as vote weight)
    votes: [{
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true
        },
        investments: [{
            option: {
                type: String,
                required: true
            },
            amount: {
                type: Number,  // Investment amount in USDT or another currency
                required: true
            }
        }]
    }],
    winner: {
        type: String,  // Stores the winner option based on total investments
        default: null
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Pool', poolSchema);
