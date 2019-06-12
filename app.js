var express = require('express');
var path = require('path');
const fs = require('fs');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

var index = require('./routes/index');
var users = require('./routes/users');

const SocketHander = require('./socket/index');

//require('dotenv').config();

var app = express();

const server = require('http').Server(app);
const io = require('socket.io')(server);

var ID = {}
var online = {}
var name = {}
var existIMG = {}
var profileLookup = {}
var L = 0

var blockList = []
    // var passwordList = []

var control = new SocketHander();

async function asyncBlock() { // block
    blockList = await control.getBlocks();
    console.log(blockList)
}

asyncBlock()



io.on('connection', async(socket) => {
    console.log('a user connected');
    // const clients = await io.engine.clientsCount;

    const socketid = socket.id;

    socketHander = new SocketHander();

    socketHander.connect();


    var history = await socketHander.getMessages(); // messages
    var historyP = await socketHander.getMessagesP(); // private messages

    io.to(socketid).emit('history', history); // messages by default

    io.to(socketid).emit('clients', {
        clients: L,
    });

    socket.on("member", () => {
        io.to(socket.id).emit("member"); // 可以不用廣播
    });

    socket.on('error', (error) => {
        console.log(error)
    });

    socket.on("disconnect", () => {
        username = socket.username
        console.log(username + " has left.");
        delete ID[username]
        delete online[username]
        delete name[username]
        countUser()
        io.emit("clients", {
            clients: L,
        });
        info()
    });

    socket.on("message", (obj) => {
        socketHander.storeMessages(obj); // messages
        io.emit("message", obj);
    });

    socket.on("messageP", (obj) => {
        socketHander.storeMessagesP(obj); // private messages
        io.emit("messageP", obj); // 
    });

    async function asyncPassword(username) {
        var password = await control.getPasswords(username);
        return password
    }

    socket.on("history", () => {
        async function asyncHistory() { // history
            var history = await socketHander.getMessages();
            io.to(socketid).emit('history', history);
        }
        asyncHistory()
    });

    socket.on("historyP", () => {
        // io.to(socketid).emit('historyP', historyP); 
        async function asyncHistoryP() { // private history
            var historyP = await socketHander.getMessagesP();
            io.to(socketid).emit('historyP', historyP);
        }
        asyncHistoryP()
    });

    socket.on('clients', (obj) => {
        io.emit("clients", {
            clients: L,
            user: obj,
        });
    });

    socket.on('profile', (obj) => {
        console.log(existIMG)
        if (existIMG[obj] == 'false') {
            existIMG[obj] = 'true'
            filename = getLatestFile('./public/images')
            console.log(obj + '_profile: ' + filename)
            profileLookup[obj] = filename
            io.emit('profile', {
                user: obj,
                userImg: filename,
                table: profileLookup
            });
        }
    });

    socket.on('new', function(username) {
        socket.username = username;
        if (username in ID) {
            socket.username = "^duplicate^"
            io.to(socket.id).emit('notice', " " + '^' + 'duplicate');
            return
        }
        // if (typeof(asyncPassword(username)) == 'String') {
        //     console.log(asyncPassword(username))
        //     io.to(socket.id).emit('notice', " " + '^' + 'password');
        // }

        if (username == 'spy') { io.to(socket.id).emit('notice', " " + '^' + 'password'); }
        // ...............tmp ↑
        console.log(username + " has come in.");
        ID[username] = socket.id
        online[username] = 'free'
        name[username] = username
        existIMG[username] = 'false'
        countUser()
        io.emit("clients", {
            clients: L,
        });
        info()

    });


    socket.on('reqFrom', function(mes) {
        var block = false
        var from = socket.username
        var to = mes.split("^")[0]
        var id = mes.split("^")[1]
        console.log(from + ' is trying to speak to ' + to + '.');
        blockList.forEach(data => {
            if (data['from'] == to && data['to'] == from) {
                io.to(ID[from]).emit('notice', to + '^' + 'decline');
                online[from] = 'free'
                console.log(from + ' has been blocked by ' + to + ' previously.')
                block = true
            }
        })
        if (block) { return }
        if (!(to in ID)) {
            io.to(ID[from]).emit('notice', to + '^' + 'offline');
            online[from] = 'free'
            console.log(to + ' is offline now.')
        } else if (online[to] == 'busy') {
            io.to(ID[from]).emit('notice', to + '^' + 'busy');
            online[from] = 'free'
            console.log(to + ' is busy now.')
        } else {
            io.to(ID[to]).emit('reqTo', from + '^' + id)
            online[from] = 'busy'
            online[to] = 'busy'
        }
        info()
    });

    socket.on('backFrom', function(mes) {
        var from = socket.username
        var to = mes.split("^")[0]
        var id = mes.split("^")[1]
        console.log(from + ' is replying to ' + to + ': accept.');
        io.to(ID[to]).emit('backTo', from + '^' + id)
        info()
    });

    socket.on('notice', (mes) => {
        var from = socket.username
        var to = mes.split('^')[0]
        var type = mes.split('^')[1]

        switch (type) {
            case 'cancel':
                io.to(ID[to]).emit('notice', from + '^' + type)
                online[from] = 'free'
                online[to] = 'free'
                console.log(from + ' has cancelled the call to ' + to + '.');
                break
            case 'timeout':
                io.to(ID[to]).emit('notice', from + '^' + type)
                io.to(ID[from]).emit('notice', to + '^' + 'cancel')
                online[from] = 'free'
                online[to] = 'free'
                console.log(from + ' has not replied to ' + to + ' within 10 seconds.');
                break
            case 'decline':
                if (online[to] == 'busy') {
                    io.to(ID[to]).emit('notice', from + '^' + type)
                    online[from] = 'free'
                    online[to] = 'free'
                    console.log(from + ' is replying to ' + to + ': decline.');
                }
                break
            case 'block':
                let obj = {
                    from: from,
                    type: type,
                    to: to,
                };
                control.storeBlocks(obj);
                blockList.push(obj);
                console.log(from + ' has blocked the call from ' + to + '.');
                break
            case 'unblock':
                control.deleteBlocks(from, to);
                asyncBlock()
                console.log(blockList)
                console.log(from + ' has unblocked the call from ' + to + '.');
                break
        }
        info()

    })

});

server.listen(process.env.PORT || 3001);

// app.use(function (req, res, next) {
//   res.io = io;
//   next();
// });

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.all('*', function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header('Access-Control-Allow-Methods', 'PUT, GET, POST, DELETE, OPTIONS');
    res.header("Access-Control-Allow-Headers", "X-Requested-With");
    res.header('Access-Control-Allow-Headers', 'Content-Type');
    next();
});

app.use('/', index);
app.use('/upload', index);
app.use('/users', users);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// error handler
app.use(function(err, req, res, next) {
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};

    // render the error page
    res.status(err.status || 500);
    res.render('error');
});

function countUser() {
    var count = 0;
    var i;
    for (i in ID) {
        if (ID.hasOwnProperty(i)) {
            count++;
        }
    }
    L = count
}

function info() {
    console.log(L + ' online.    ' + JSON.stringify(online))
    var arr = []
    for (i in name) {
        arr.push({
            name: i,
            status: online[i]
        })
    }
    io.emit('refresh', arr)
}


module.exports = app;


function getLatestFile(dirpath) {

    // Check if dirpath exist or not right here

    let latest;

    const files = fs.readdirSync(dirpath);
    files.forEach(filename => {
        // Get the stat
        const stat = fs.lstatSync(path.join(dirpath, filename));
        // Pass if it is a directory
        if (stat.isDirectory())
            return;

        // latest default to first file
        if (!latest) {
            latest = { filename, mtime: stat.mtime };
            return;
        }
        // update latest if mtime is greater than the current latest
        if (stat.mtime > latest.mtime) {
            latest.filename = filename;
            latest.mtime = stat.mtime;
        }
    });

    return latest.filename;
}