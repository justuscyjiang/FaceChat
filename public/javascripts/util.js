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

// foreground trb
var min = 30
var max = 60
var init_angle = Math.floor(Math.random() * (max - min + 1)) + min;
var init_V = 8
var vx = Math.floor(init_V * Math.cos(init_angle * Math.PI / 180))
var vy = Math.floor(init_V * Math.sin(init_angle * Math.PI / 180))
var x = 100
var y = 100
var fgTimer

var callTimer

var theOther

var peerError = false

var CWB

var password

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
            fgTimer = setInterval(trb, 40)
        }
    } else {
        if (foreground == 'trb') {
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

    if (x < 600 - 190 && x > 0) {
        vx = vx
    } else {
        vx = -vx
    }
    if (y < 450 - 130 && y > 0) {
        vy = vy
    } else {
        vy = -vy
    }
    x += vx
    y += vy
    document.documentElement.style.setProperty('--left', x);
    document.documentElement.style.setProperty('--top', y);
}

function pmscrollWindow() {
    let h = document.querySelector('.secret');
    h.scrollTo(0, h.scrollHeight);
}

function doo(stream2) {
    var username = account
    var init = false
    var t1
    socket.emit('new', username);
    socket.emit('clients', account);

    socket.on('reqTo', function(mes) {
        var from = mes.split("^")[0]
        var id = mes.split("^")[1]
        callTimer = setTimeout(() => {
            socket.emit('notice', from + '^' + "timeout")
        }, 10000)
        swal({
                title: '',
                text: from + ' wants to speak to you!',
                icon: 'success',
                buttons: ['Decline', 'Accept'],
                closeOnClickOutside: false,
                closeOnEsc: false,
            })
            .then((ans) => {
                if (ans) {
                    document.getElementById("poke").disabled = true;
                    clearTimeout(callTimer)
                    document.getElementById('p2id2').value = id
                    to_global = from
                    peer2.signal(JSON.parse(id))

                    /**
                     * private messages by socket.io
                     */
                    // document.querySelector('.speeches').innerHTML = '' // remove messages
                    // privateMessages = true // change messages to private messages
                    // socket.emit('historyP')
                    // theOther = from
                } else {
                    socket.emit('notice', from + '^' + "decline")
                    clearTimeout(callTimer)
                }
            })
    })


    socket.on('backTo', function(mes) {
        clearTimeout(callTimer)
        var from = mes.split("^")[0]
        var id = mes.split("^")[1]
        document.getElementById('p1id2').value = id
        peer1.signal(JSON.parse(id))
        init = true
        swal.close()

        /**
         * private messages by socket.io
         */
        // document.querySelector('.speeches').innerHTML = '' // remove messages
        // privateMessages = true // change messages to private messages
        // socket.emit('historyP')
        // theOther = from
    })

    document.getElementById('poke').addEventListener('click', function() {
        document.getElementById("poke").disabled = true;
        var to = document.getElementById('to').value
        var id = document.getElementById('p1id1').value
        socket.emit('reqFrom', to + "^" + id);
        peer = peer1

        swal({
                title: '',
                text: 'Waiting...',
                icon: 'info',
                buttons: [false, 'Cancel'],
                closeOnClickOutside: false,
                closeOnEsc: false,
            })
            .then((cancel) => {
                if (cancel) {
                    socket.emit('notice', to + "^" + 'cancel')
                    document.getElementById("poke").disabled = false;
                }
            })
    })


    socket.on('notice', (mes) => {
        var from = mes.split('^')[0]
        var type = mes.split('^')[1]
        switch (type) {
            case 'cancel':
                document.getElementById("poke").disabled = false;
                clearTimeout(callTimer)
                swal({
                    text: 'You have got a missed call from ' + from + '!',
                    icon: 'warning',
                    buttons: [false, true],
                    closeOnClickOutside: false,
                    closeOnEsc: false,
                })
                break
            case 'decline':
                document.getElementById("poke").disabled = false;
                swal({
                    title: '',
                    text: from + ' has declined your request.',
                    icon: 'error',
                    buttons: false,
                    timer: 3000,
                })
                break
            case 'offline':
                document.getElementById("poke").disabled = false;
                swal({
                    title: '',
                    text: from + ' is offline now.',
                    icon: 'warning',
                    buttons: false,
                    timer: 3000,
                })
                break
            case 'busy':
                document.getElementById("poke").disabled = false;
                swal({
                    title: '',
                    text: from + ' is busy now.',
                    icon: 'warning',
                    buttons: false,
                    timer: 3000,
                })
                break
            case 'timeout':
                document.getElementById("poke").disabled = false;
                swal({
                    text: 'No reply.',
                    icon: 'warning',
                    buttons: false,
                    timer: 3000,
                })
                break
            case 'duplicate':
                swal({
                    text: 'Duplicate username: ' + username + ' !',
                    icon: 'error',
                    buttons: [false, true],
                    closeOnClickOutside: false,
                    closeOnEsc: false,
                }).then(() => {
                    sessionStorage.clear();
                    location.reload();
                })
                break
            case 'password':
                swal({
                        title: "請輸入密碼: ",
                        icon: "info",
                        content: "input",
                        closeOnClickOutside: false,
                        closeOnEsc: false,
                    })
                    .then((value) => {
                        password = mes.split('^')[2]
                        if (value != mes.split('^')[2]) {
                            swal({
                                    text: 'Your password is incorrect!',
                                    icon: 'error',
                                    buttons: [false, 'Restart'],
                                    closeOnClickOutside: false,
                                    closeOnEsc: false,
                                })
                                .then(() => {
                                    sessionStorage.clear();
                                    location.reload();
                                })
                        }
                    })
                break
            case "CWB":
                CWB = mes.split('^')[2]
                break



        }
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
            case '#pause':
                document.getElementById('large').pause()
                break;
            case '#play':
                document.getElementById('large').play()
                break;
            case '#time':
                peer.send('#time2')
                break
            case '#timeInit':
                peer.send('#timeInit2')
                break
            case '#time2':
                t2 = Date.now()
                dt = t2 - t1
                console.log(dt)
                break
            case '#timeInit2':
                t2 = Date.now()
                dt = t2 - t1
                console.log(dt)
                break
            default:
                let el = document.getElementById('pmmsg');
                let html = el.innerHTML;
                html +=
                    `<div class="left speech">
                              <div class="content">${data}</div>
                            </div>`
                el.innerHTML = html.trim();
                pmscrollWindow();
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


        var timeDelay = setInterval(() => {
            if (init) {
                t1 = Date.now()
                peer1.send('#timeInit')
            } else {
                t1 = Date.now()
                peer2.send('#time')
            }
        }, 3000);



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

        document.getElementById('pmsend').addEventListener('click', function() {
            var yourMessage = document.getElementById('yourMessage').value
            peer.send(yourMessage);
            document.getElementById('yourMessage').value = ""
                /*let self = document.querySelector('pmspeeches');
                let h = self.innerHTML;
                h =`<div class = "content" align = "right">
                    <div class="text">${yourMessage}</div>
                  </div>`;*/
            let el = document.getElementById('pmmsg');
            let html = el.innerHTML;
            html +=
                `<div class="right speech">
                  <div class="content">${yourMessage}</div>
              </div>
              `
            el.innerHTML = html.trim();
            pmscrollWindow();
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

    peer1.on('error', (err) => {
        peerError = true
        swal({
            title: 'Peer Error',
            text: err.toString(),
            icon: 'error',
            buttons: ['Cancel', 'Restart'],
            closeOnClickOutside: false,
            closeOnEsc: false,
        }).then((ans) => {
            if (ans) {
                sessionStorage.clear();
                location.reload();
            }
        })
    })
    peer2.on('error', (err) => {
        peerError = true
        swal({
            title: 'Peer Error',
            text: err.toString(),
            icon: 'error',
            buttons: ['Cancel', 'Restart'],
            closeOnClickOutside: false,
            closeOnEsc: false,
        }).then((ans) => {
            if (ans) {
                sessionStorage.clear();
                location.reload();
            }
        })
    })

    peer1.on('close', () => {
        if (peerError) { return }
        swal({
            title: '',
            text: 'The connection has closed!',
            icon: 'warning',
            buttons: ['Cancel', 'Restart'],
            closeOnClickOutside: false,
            closeOnEsc: false,
        }).then((ans) => {
            if (ans) {
                sessionStorage.clear();
                location.reload();
            }
        })
    })

    peer2.on('close', () => {
        if (peerError) { return }
        swal({
            title: '',
            text: 'The connection has closed!',
            icon: 'warning',
            buttons: ['Cancel', 'Restart'],
            closeOnClickOutside: false,
            closeOnEsc: false,
        }).then((ans) => {
            if (ans) {
                sessionStorage.clear();
                location.reload();
            }
        })
    })

}

if (account) {
    navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true
    }).then(doo, (err) => {
        swal({
            title: 'Camera Access Denied',
            text: 'Check your permission setting, or use Firefox.',
            icon: 'error',
            buttons: [false, true],
            closeOnClickOutside: false,
            closeOnEsc: false,
        })
    });
}