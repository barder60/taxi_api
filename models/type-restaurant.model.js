'use strict';
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const typeRestaurantSchema = new Schema({
    name: String,
    restaurants: [{
        type: Schema.Types.ObjectId,
        ref: 'Restaurant'
    }]
});

module.exports = mongoose.model('TypeRestaurant', typeRestaurantSchema);
