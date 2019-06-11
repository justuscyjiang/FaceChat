const mongoose = require('mongoose');

const messagesSchema = mongoose.Schema({
    type: String,
    from: String,
    to: String,
});

module.exports = mongoose.model('Controls', messagesSchema);