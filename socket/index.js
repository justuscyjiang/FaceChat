const Messages = require('../models/Messages');
const moment = require('moment');
class SocketHander {

    constructor() {
        this.db;
    }

    connect() {
        this.db = require('mongoose').connect('mongodb://140.112.214.144:27017/nchat');
        this.db.Promise = global.Promise;
        console.log('???')
    }

    getMessages() {
        return Messages.find();
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
}

module.exports = SocketHander;