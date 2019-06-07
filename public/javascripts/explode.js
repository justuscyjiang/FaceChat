function explode(shape) {
    var c = document.createElement('canvas')
    var ctx = c.getContext('2d')
    var ratio = window.devicePixelRatio
    var particles = []

    document.getElementById('mother').appendChild(c)

    c.style.position = 'absolute'
        // c.style.left = (x - 200) + 'px' // (100)
        // c.style.top = (y - 200) + 'px' // (100)
    c.style.left = 0
    c.style.top = 0
    c.style.pointerEvents = 'none'
    c.style.width = 400 + 'px' // (200)
    c.style.height = 400 + 'px' // (200)
    c.width = 400 * ratio // (200)
    c.height = 400 * ratio // (200)

    function Particle() {
        return {
            x: c.width / 2,
            y: c.height / 2,
            radius: r(20, 30),
            color: 'rgb(' + [r(0, 255), r(0, 255), r(0, 255)].join(',') + ')',
            rotation: r(0, 360, true),
            speed: r(2, 3), // (8, 12)
            friction: 1.0, // (0.9)
            opacity: r(0, 0.5, true),
            yVel: 0,
            gravity: 0.01 // (0.1)
        }
    }

    for (var i = 0; ++i < 12;) {
        particles.push(Particle())
    }

    console.log(particles[0])

    function render() {
        ctx.clearRect(0, 0, c.width, c.height)

        particles.forEach(function(p, i) {

            angleTools.moveOnAngle(p, p.speed)

            p.opacity -= 0.01 // (0.01)
            p.speed *= p.friction
            p.radius *= p.friction

            p.yVel += p.gravity
            p.y += p.yVel

            if (p.opacity < 0) return
            if (p.radius < 0) return
            if (shape == 'circle') {
                ctx.beginPath()
                ctx.globalAlpha = p.opacity
                ctx.fillStyle = p.color
                ctx.arc(p.x, p.y, p.radius, 0, 2 * Math.PI, false)
                ctx.fill()
            } else if (shape == 'heart') {
                ctx.beginPath()
                ctx.globalAlpha = p.opacity
                ctx.fillStyle = p.color
                ctx.moveTo(p.x, p.y)
                ctx.lineTo(p.x - p.radius, p.y - p.radius)
                ctx.arc(p.x - 0.5 * p.radius, p.y - 1.5 * p.radius, 0.5 * 1.4142 * p.radius, 0.75 * Math.PI, 1.75 * Math.PI, false)
                ctx.arc(p.x + 0.5 * p.radius, p.y - 1.5 * p.radius, 0.5 * 1.4142 * p.radius, 1.25 * Math.PI, 0.25 * Math.PI, false)
                ctx.lineTo(p.x, p.y)
                ctx.fill()
            } else if (shape == 'star') {
                ctx.beginPath()
                ctx.globalAlpha = p.opacity
                ctx.fillStyle = p.color
                ctx.moveTo(p.x + 0 * p.radius, p.y + 0.382 * p.radius)
                ctx.lineTo(p.x + 0.951 * p.radius, p.y - 0.309 * p.radius)
                ctx.lineTo(p.x + 0.225 * p.radius, p.y - 0.309 * p.radius)
                ctx.lineTo(p.x - 0.951 * p.radius, p.y - 0.309 * p.radius)
                ctx.lineTo(p.x - 0.363 * p.radius, p.y + 0.118 * p.radius)
                ctx.lineTo(p.x + 0.588 * p.radius, p.y + 0.809 * p.radius)
                ctx.lineTo(p.x + 0.363 * p.radius, p.y + 0.118 * p.radius)
                ctx.lineTo(p.x + 0 * p.radius, p.y - 1 * p.radius)
                ctx.lineTo(p.x - 0.225 * p.radius, p.y - 0.309 * p.radius)
                ctx.lineTo(p.x - 0.588 * p.radius, p.y + 0.809 * p.radius)
                ctx.lineTo(p.x + 0 * p.radius, p.y + 0.382 * p.radius)
                ctx.fill()
            } else if (shape == '?') {
                ctx.drawImage(document.getElementById("source"), p.x, p.y);
            }
        })
    }

    ;
    (function renderLoop() {
        requestAnimationFrame(renderLoop)
        render()
    })()

    setTimeout(function() {
        document.body.removeChild(c)
    }, 8000)
} // (3000)

var angleTools = {
    getAngle: function(t, n) {
        var a = n.x - t.x,
            e = n.y - t.y;
        return Math.atan2(e, a) / Math.PI * 180
    },
    getDistance: function(t, n) {
        var a = t.x - n.x,
            e = t.y - n.y;
        return Math.sqrt(a * a + e * e)
    },
    moveOnAngle: function(t, n) {
        var a = this.getOneFrameDistance(t, n);
        t.x += a.x, t.y += a.y
    },
    getOneFrameDistance: function(t, n) { return { x: n * Math.cos(t.rotation * Math.PI / 180), y: n * Math.sin(t.rotation * Math.PI / 180) } }
};

function r(a, b, c) { return parseFloat((Math.random() * ((a ? a : 1) - (b ? b : 0)) + (b ? b : 0)).toFixed(c ? c : 0)); }