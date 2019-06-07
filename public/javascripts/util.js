var Peer = window.SimplePeer;
var socket = io.connect();
var to_global = ''
var peer
var stunServerConfig = ''

function doo(stream2) {
    // if (err) return console.error(err)
    var username = prompt('What\'s your username?');
    socket.emit('new', username);

    socket.on('reqTo', function(mes) {
        var from = mes.split("^")[0]
        var id = mes.split("^")[1]
        alert(from + ' wants to speak to you!')
        document.getElementById('p2id2').value = id
        to_global = from
        peer2.signal(JSON.parse(id))
    })

    socket.on('backTo', function(mes) {
        var from = mes.split("^")[0]
        var id = mes.split("^")[1]
        document.getElementById('p1id2').value = id
        peer1.signal(JSON.parse(id))
    })

    document.getElementById('poke').addEventListener('click', function() {
        var to = document.getElementById('to').value
        var id = document.getElementById('p1id1').value
        socket.emit('reqFrom', to + "^" + id);
        peer = peer1
    })

    const peer1 = new Peer({
        initiator: true,
        stream: stream2,
        trickle: false,
        config: stunServerConfig
    });
    const peer2 = new Peer({
        initiator: false,
        stream: stream2,
        trickle: false,
        config: stunServerConfig
    });

    peer1.on('signal', function(data) {
        document.getElementById('p1id1').value = JSON.stringify(data)
    })

    peer2.on('signal', function(data) {
        if (JSON.stringify(data) == "{\"renegotiate\":true}") {
            return
        }
        peer = peer2
        document.getElementById('p2id1').value = JSON.stringify(data)
        id = document.getElementById('p2id1').value
        socket.emit('backFrom', to_global + '^' + id)
    })

    document.getElementById('bsend').addEventListener('click', function() {
        var yourMessage = document.getElementById('send').value
        peer.send(yourMessage)
        document.getElementById('send').value = ""
    })

    function transData(data) {
        switch (data.toString()) {
            case '#circle':
                explode('circle')
                console.log('rec circle')
                break;
            case '#heart':
                explode('heart')
                console.log('rec heart')
                break;
            case '#star':
                explode('star')
                console.log('rec star')
                break;
            case '#?':
                explode('?')
                console.log('rec ?')
                break;
            case '#pause':
                document.getElementById('large').pause()
                break;
            case '#play':
                document.getElementById('large').play()
                break;
            default:
                document.getElementById('rec').textContent += data + '\n'
        }
    }

    peer1.on('data', transData)

    peer2.on('data', transData)

    peer1.on('stream', function(stream1) {
        var video = document.querySelector('video');
        video.srcObject = stream1;
        video.play();
    })

    peer2.on('stream', function(stream1) {
        var video = document.querySelector('video');
        video.srcObject = stream1;
        video.play();
    })
}

navigator.mediaDevices.getUserMedia({
    video: true,
    audio: true
}).then(doo);