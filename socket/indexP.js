const Messages = require('../models/MessagesP');
const moment = require('moment');
class SocketHanderP {

    constructor() {
        this.db;
    }

    connect() {
        this.db = require('mongoose').connect('mongodb://140.112.214.144:27017/nchat');
        this.db.Promise = global.Promise;
    }

    getMessages() {
        return Messages.find();
    }

    // getMessages() {
    //     var onedayago = moment().add(-1, 'day');
    //     return Messages.find({ time: { $gte: onedayago } });
    // }

    storeMessages(data) {

        console.log(data);
        const newMessages = new Messages({
            name: data.name,
            msg: data.msg,
            time: moment().valueOf(),
        });

        const doc = newMessages.save();
    }
}

module.exports = SocketHanderP;