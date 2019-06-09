var express = require('express');
var path = require('path');
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

// added by 江 ↓
var ID = {}
var online = {}
var name = {}
var L = 0
    // added by 江 ↑

io.on('connection', async(socket) => {
    console.log('a user connected');
    // const clients = await io.engine.clientsCount;

    const socketid = socket.id;
    socketHander = new SocketHander();
    socketHander.connect();

    const history = await socketHander.getMessages();

    io.to(socketid).emit('history', history);
    io.to(socketid).emit('clients', {
        clients: L,
    });

    socket.on("member", () => {
        var arr = []
        console.log("send online member list");
        for (i in name) {
            arr.push({
                name: i,
                status: online[i]
            })
        }
        console.log(socket.id)
        io.to(socket.id).emit("test", '456'); // 可以不用廣播
        io.emit("member", arr);
    });

    socket.on('error', (error) => {
        console.log(error)
    });

    socket.on("disconnect", () => {
        console.log("a user go out");
        delete ID[socket.username]
        delete online[socket.username]
        delete name[socket.username]
        countUser()
        io.emit("clients", {
            clients: L,
        });

    });

    socket.on("message", (obj) => {
        socketHander.storeMessages(obj);
        io.emit("message", obj);
    });

    socket.on('clients', (obj) => {

        io.emit("clients", {
            clients: L,
            user: obj,
        });
    });

    // added by 江 ↓

    socket.on('new', function(username) {
        socket.username = username;
        ID[username] = socket.id
        online[username] = 'free'
        name[username] = username
        countUser()
        io.emit("clients", {
            clients: L,
        });
    });


    socket.on('reqFrom', function(mes) {
        var from = socket.username
        var to = mes.split("^")[0]
        var id = mes.split("^")[1]
        console.log(from + ' is trying to speak to ' + to + '.');
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
        }
        info()

    })

    // added by 江 ↑

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
    extended: false
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
    // console.log(ID)
    console.log(L + ' online.    ' + JSON.stringify(online))
        // console.log(L)
}


module.exports = app;