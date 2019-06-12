const Messages = require('../models/Messages');
const MessagesP = require('../models/MessagesP');
const Controls = require('../models/Controls');
const moment = require('moment');
class SocketHander {

    constructor() {
        this.db;
    }

    connect() {
        this.db = require('mongoose').connect('mongodb://140.112.214.144:27017/nchat').then(
            () => { console.log('The connection has been established successfully.') },
            err => {
                console.log('Error: MongoDB');
                // this.db.dbError = global.dbError;

            }
        );
        // this.db = require('mongoose').connect('mongodb://localhost:27017/nchat');
        this.db.Promise = global.Promise;
    }

    getMessages() {
        var onedayago = moment().add(-1, 'day');
        return Messages.find({ time: { $gte: onedayago } });

    }

    getMessagesP() {
        return MessagesP.find();
    }

    getBlocks() {
        return Controls.find({ type: 'block' });
    }

    getPasswords(from) {
        return Controls.find({ type: 'password', from: from });
    }

    deleteBlocks(from, to) {
        Controls.deleteMany({ type: 'block', from: from, to: to }, function(err) { console.log(err) });
    }

    // deletePasswords(from) {
    //     Controls.deleteMany({ type: 'password', from: from }, function(err) { console.log(err) });
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

    storeMessagesP(data) {
        console.log(data);
        const newMessagesP = new MessagesP({
            name: data.name,
            msg: data.msg,
            time: moment().valueOf(),
            to: data.to
        });
        const doc = newMessagesP.save();
    }

    storeBlocks(data) {
        console.log(data);
        const newBlocks = new Controls({
            type: data.type,
            from: data.from,
            to: data.to
        });
        const doc = newBlocks.save();
    }

    storePasswords() {
        console.log(data);
        const newPasswords = new Controls({
            type: data.type,
            from: data.from,
            // to: data.to
        });
        const doc = newPasswords.save();
    }

}

module.exports = SocketHander;