const mongoose = require('mongoose');

const voteSchema = new mongoose.Schema({
    pool: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Pool',
        required: true
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    option: {
        type: String,
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Vote', voteSchema);
