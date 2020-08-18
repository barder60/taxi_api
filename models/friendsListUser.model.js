'use strict';
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const friendsListUserSchema = new Schema({
    name: String,
    users: [{
        type: Schema.Types.ObjectId,
        ref: 'User'
    }],
    creator: {type: Schema.Types.ObjectId, ref: 'User'},
    create_at: { type: Date, default: Date.now(), index: true}
});

module.exports = mongoose.model('FriendsListUser', friendsListUserSchema);
