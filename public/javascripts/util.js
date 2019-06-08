var Peer = window.SimplePeer;
var socket = io.connect();
var to_global = ''
var peer
var stunServerConfig = ''
var anchors = document.getElementsByClassName('emoji')
const strip = document.querySelector('.strip');
var mom = document.getElementById('mother')

function doo(stream2) {
    // if (err) return console.error(err)
    var username = account
    socket.emit('new', username);

    socket.on('reqTo', function(mes) {
        var from = mes.split("^")[0]
        var id = mes.split("^")[1]
        swal({
            title: '',
            text: from + ' wants to speak to you!',
            type: 'success',
            showCancelButton: true,
            confirmButtonText: 'Accept',
            cencelButton: 'Decline',
        }, function(answer) {
            if (!answer) {
                socket.emit('backFrom', from + '^' + "decline")
            } else {
                document.getElementById('p2id2').value = id
                to_global = from
                peer2.signal(JSON.parse(id))
            }
        });
    })

    socket.on('backTo', function(mes) {
        var from = mes.split("^")[0]
        var id = mes.split("^")[1]
        if (id == "decline") {
            swal({
                title: '',
                text: from + ' has decline your request.',
                type: 'error'
            })
        } else {
            document.getElementById('p1id2').value = id
            peer1.signal(JSON.parse(id))
        }

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

    Array.prototype.forEach.call(anchors, function(anchor) {
        anchor.addEventListener('click', function() {
            peer.send("#" + anchor.id)
        })
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

    function transStream(stream1) {
        // var video = document.querySelector('video');
        // video.srcObject = stream1;
        // video.play();
        var video1 = document.createElement('video')
        mom.appendChild(video1)
        video1.className = "bgphoto"
        video1.id = "large"
        video1.srcObject = stream1

        var video2 = document.createElement('video')
        mom.appendChild(video2)
        video2.className = "player"
        video2.id = "small"
        video2.srcObject = stream2

        video2.play()
        video1.play()


        document.getElementById('pause').addEventListener('click', function() {
            // video1.pause()
            video2.pause()
            peer.send("#pause")
        })

        document.getElementById('play').addEventListener('click', function() {
            // video1.play()
            video2.play()
            peer.send("#play")
        })

        document.getElementById('snap').addEventListener('click', function() {
            const canvas = document.getElementById("canvasOutput");
            const data = canvas.toDataURL('image/png', 1);
            const link = document.createElement('a');
            link.href = data;
            link.setAttribute('download', 'image.png');
            link.innerHTML = `<img src="${data}" alt="image" />`;
            strip.insertBefore(link, strip.firstChild);

        })
    }

    peer1.on('stream', transStream)

    peer2.on('stream', transStream)




}

if (account) {
    navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true
    }).then(doo);
}