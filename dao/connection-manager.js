'use strict';
const mongoose = require('mongoose');

module.exports = async function () {
    await mongoose.connect(process.env.MONGODB_ADDON_URI, {
        useNewUrlParser: true,
        useCreateIndex: true,
        useUnifiedTopology: true,
        useFindAndModify: false,
        auth: {
            user: process.env.MONGO_USER,
            password: process.env.MONGO_PASS
        },
        authSource: process.env.MONGO_AUTH_SOURCE
    });
    console.log('The connection with MongoDB is established...');
};
