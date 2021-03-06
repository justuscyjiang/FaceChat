let width = 700;
let height = 0;

let streaming = false;
let vc = null;

let src = null;
let dstC1 = null;
let dstC3 = null;
let dstC4 = null;



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

function processVideo() {

    try {
        vc.read(src); // 這裡有可能錯誤
    } catch (err) {
        swal({
            title: 'OpenCV Error',
            text: err.toString() + '\nOpenCV functions have been disabled.',
            icon: 'error',
            buttons: [false, true],
            closeOnClickOutside: false,
            closeOnEsc: false,
        });
        document.getElementById('large').setAttribute('style', 'display: block; z-index: 100;')
        document.getElementById('canvasOutput').setAttribute('style', 'display: none;')
        document.getElementById("pass").disabled = true;
        document.getElementById("gray").disabled = true;
        document.getElementById("erosion").disabled = true;
    }

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