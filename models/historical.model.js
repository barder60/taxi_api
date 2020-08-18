'use strict';
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const historicalSchema = new Schema({
    restaurants:{
        type: Schema.Types.ObjectId,
        ref: 'Restaurant'
    },
    users: [{
        type: Schema.Types.ObjectId,
        ref: 'User'
    }],
    date_historical: { type: Date, default: Date.now(), index: true}
});

module.exports = mongoose.model('historical', historicalSchema);
