const Messages = require('../models/Messages');
const MessagesP = require('../models/MessagesP');
const moment = require('moment');
class SocketHander {

    constructor() {
        this.db;
    }

    connect() {
        // this.db = require('mongoose').connect('mongodb://140.112.214.144:27017/nchat');
        // this.db = require('mongoose').connect('mongodb://localhost:27017/nchat');
        this.db = require('mongoose').connect('mongodb://10.122.238.175:27017/nchat');
        this.db.Promise = global.Promise;
    }

    getMessages() {
        var onedayago = moment().add(-1, 'day');
        return Messages.find({ time: { $gte: onedayago } });

    }

    getMessagesP() {
        return MessagesP.find();
    }


    storeMessages(data) {

        console.log(data);
        const newMessages = new Messages({
            name: data.name,
            msg: data.msg,
            time: moment().valueOf(),
        });

        const doc = newMessages.save();
    }

    storeMessagesP(data) {

        console.log(data);
        const newMessages = new MessagesP({
            name: data.name,
            msg: data.msg,
            time: moment().valueOf(),
            to: data.to
        });

        const doc = newMessages.save();
    }
}

module.exports = SocketHander;