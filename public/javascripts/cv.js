let width = 600;
let height = 0;

let streaming = false;
let vc = null;

let src = null;
let dstC1 = null;
let dstC3 = null;
let dstC4 = null;

var tr
var min = 25
var max = 65
var init_angle = Math.floor(Math.random() * (max - min + 1)) + min;
var init_V = 8
var Vx = Math.floor(init_V * Math.cos(init_angle * 2 * Math.PI / 180))
var Vy = Math.floor(init_V * Math.sin(init_angle * 2 * Math.PI / 180))
var x = 100
var y = 100
var pd = false

function startVideoProcessing() {
    if (!streaming) { console.warn("Please startup your webcam"); return; }
    stopVideoProcessing();
    src = new cv.Mat(height, width, cv.CV_8UC4);
    dstC1 = new cv.Mat(height, width, cv.CV_8UC1);
    dstC3 = new cv.Mat(height, width, cv.CV_8UC3);
    dstC4 = new cv.Mat(height, width, cv.CV_8UC4);
    requestAnimationFrame(processVideo);
}

function gray(src) {
    cv.cvtColor(src, dstC1, cv.COLOR_RGBA2GRAY);
    return dstC1;
}

function erosion(src) {
    let kernelSize = 15;
    let kernel = cv.Mat.ones(kernelSize, kernelSize, cv.CV_8U);
    cv.erode(src, dstC4, kernel, { x: -1, y: -1 }, 1);
    kernel.delete();
    return dstC4;
}

function preprocess() {
    tr = cv.imread('idtrb');
    dst = new cv.Mat();
    dsize = new cv.Size(190, 130);
    // You can try more different parameters
    cv.resize(tr, dst, dsize, 0, 0, cv.INTER_AREA);
    // tr = cv.resize(tr, (190, 130), interpolation = cv.INTER_AREA)
    tr = dst
    pixel = tr.ucharPtr(129, 189);
    console.log(pixel)
    pixel = tr.ucharPtr(0, 0);
    console.log(pixel)
}

function trb(src) {
    if (!pd) {
        preprocess()
        pd = true
    }

    if (x + 130 + Vx >= 449 || x + Vx <= 0) {
        Vx = -Vx
    }
    if (y + 190 + Vy >= 599 || y + Vy <= 0) {
        Vy = -Vy
    }

    x += Vx
    y += Vy

    for (var col = 1; col < 599; col++) {
        for (var row = 1; col < 449; row++) {
            for (var c = 0; c < 4; c++) {
                if (tr.ucharPtr(row, col)[3] == 255) {
                    // src[i + x, j + y, k] = tr[i, j, k]
                    src.ucharPtr(row + y, col + x)[c] = tr.ucharPtr(row, col)[c]
                }
            }
        }
    }

    return src
}

function processVideo() {
    vc.read(src);
    let result;
    switch (filterUse) {
        case 'gray':
            result = gray(src);
            break;
        case 'pass':
            result = src;
            break;
        case 'erosion':
            result = erosion(src);
            break;
        case 'trb':
            result = trb(src)
            break;
        default:
            result = src;
    }
    cv.imshow("canvasOutput", result);
    requestAnimationFrame(processVideo);
}

function stopVideoProcessing() {
    if (src != null && !src.isDeleted()) src.delete();
    if (dstC1 != null && !dstC1.isDeleted()) dstC1.delete();
    if (dstC3 != null && !dstC3.isDeleted()) dstC3.delete();
    if (dstC4 != null && !dstC4.isDeleted()) dstC4.delete();
}