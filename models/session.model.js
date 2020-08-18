'use strict';
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const sessionSchema = new Schema({
    token: String,
    createdAt: {
        type: Date,
        default: Date.now
    },
    deletedAt: Date,
    user: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    }
});

module.exports = mongoose.model('Session', sessionSchema);
