const mongoose = require('mongoose');
const Comment = require('../models').Comment;

const Schema = mongoose.Schema;

const TicketSchema = new Schema({
    author: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    title: { type: String, default: '' },
    message: { type: String, default: '' },
    status: {
        type: String,
        default: 'created',
        enum: ['created', 'pending', 'done', 'standby'],
    },
    type: {
        type: String,
        default: 'request',
        enum: ['bug', 'request', 'newRestaurant'],
    },
    emergency: { type: Number, default: 0 }, // relevant for Java back office
    restaurant: { type: mongoose.Schema.Types.ObjectId, ref: 'Restaurant' },
    users: {
        type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
        default: [],
    }, // user in charge of the ticket =>  relevant for Java back office
    comments: { type: [Comment], default: [] },
    created_at: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Ticket', TicketSchema);
