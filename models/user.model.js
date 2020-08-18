'use strict';
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const userSchema = new Schema({
    lastName: String,
    firstName: String,
    address: String,
    phone: String,
    town: String,
    email: String,
    postalCode: String,
    password: String,
    type: String,
    hasCompletedSituation: Boolean,
    sessions: [{
        type: Schema.Types.ObjectId,
        ref: 'Session'
    }],
    allergens: [{
        type: Schema.Types.ObjectId,
        ref: 'Allergen'
    }],
    characteristics: [{
        type: Schema.Types.ObjectId,
        ref: 'Characteristic'
    }]
});

module.exports = mongoose.model('User', userSchema);
