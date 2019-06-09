const mongoose = require('mongoose');

const messagesSchema = mongoose.Schema({
    name: String,
    msg: String,
    time: Number,
});

module.exports = mongoose.model('PrivateMessages', messagesSchema); // collection: privatemessages