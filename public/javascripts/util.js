var Peer = window.SimplePeer;
var socket = io.connect();
var to_global = ''
var peer
var stunServerConfig = ''

// Videos container
var mom = document.getElementById('mother')

// Snapshots container
const strip = document.querySelector('.strip');

// Buttons
var anchors = document.getElementsByClassName('emoji')
var filters = document.getElementsByClassName('filter')
var set_fgs = document.getElementsByClassName('set_fg')

var filterUse = null;
var foreground = false;


var min = 25
var max = 65
var init_angle = Math.floor(Math.random() * (max - min + 1)) + min;
var init_V = 8
var vx = Math.floor(init_V * Math.cos(init_angle * 2 * Math.PI / 180))
var vy = Math.floor(init_V * Math.sin(init_angle * 2 * Math.PI / 180))
var x = 100
var y = 100

Array.prototype.forEach.call(anchors, function(anchor) {
    anchor.addEventListener('click', function() {
        peer.send("#" + anchor.id)
    })
})

Array.prototype.forEach.call(filters, function(filter) {
    filter.addEventListener('click', function() {
        filterUse = filter.id;
    })
})

Array.prototype.forEach.call(set_fgs, function(set_fg) {
    set_fg.addEventListener('click', function() {
        insert_fg(set_fg.id.split("_")[1])
    })
})

function insert_fg(fg) {
    if (!foreground) {
        var section = document.createElement('section')
        mom.appendChild(section)
        section.className = "foreground"
        section.id = fg
        foreground = fg
        if (fg == 'trb') {
            var fgTimer = setInterval(trb, 40)
        }
    } else {
        if (fg == 'trb') {
            clearInterval(fgTimer)
        }
        var tmp = document.getElementById(foreground)
        tmp.parentNode.removeChild(tmp);
        delete tmp
        if (fg != foreground) {
            foreground = false
            insert_fg(fg)
        } else { foreground = false }
    }
}

function trb() {
    if (x < 300 && x > 0) {
        vx = vx
    } else {
        vx = -vx
    }
    if (y < 300 && y > 0) {
        vy = vy
    } else {
        vy = -vy
    }
    x += vx
    y += vy
    console.log('!')
    document.documentElement.style.setProperty('--left', x);
    document.documentElement.style.setProperty('--top', y);
}

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
                icon: 'success',
                buttons: ['Decline', 'Accept'],
            })
            .then((ans) => {
                if (ans) {
                    document.getElementById('p2id2').value = id
                    to_global = from
                    peer2.signal(JSON.parse(id))
                } else {
                    socket.emit('backFrom', from + '^' + "decline")
                }
            })
    })


    socket.on('backTo', function(mes) {
        var from = mes.split("^")[0]
        var id = mes.split("^")[1]
        if (id == "decline") {
            swal({
                title: '',
                text: from + ' has declined your request.',
                icon: 'error',
                buttons: false,
                timer: 2500,
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

    function transData(data) {
        switch (data.toString()) {
            case '#circle':
                explode('circle')
                break;
            case '#heart':
                explode('heart')
                break;
            case '#star':
                explode('star')
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
        }
    }

    peer1.on('data', transData)

    peer2.on('data', transData)

    function transStream(stream1) {
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

        video2.volume = 0

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
            const bbrr = document.createElement('br');
            strip.insertBefore(bbrr, strip.firstChild);
        })

        video1.addEventListener("canplay", function(ev) {
            if (!streaming) {
                height = video1.videoHeight / (video1.videoWidth / width);
                video1.setAttribute("width", width);
                video1.setAttribute("height", height);
                streaming = true;
                vc = new cv.VideoCapture(video1);
            }
            startVideoProcessing();
        }, false);
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