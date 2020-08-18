'use strict';
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const restaurantListSchema = new Schema({
    name: String,
    restaurants: [{
        type: Schema.Types.ObjectId,
        ref: 'Restaurant'
    }],
    creator: {type: Schema.Types.ObjectId, ref: 'User'},
    create_at: { type: Date, default: Date.now(), index: true}
});

module.exports = mongoose.model('RestaurantList', restaurantListSchema);
