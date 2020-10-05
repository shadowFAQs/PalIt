var colorCaptureActive = true;
var imgData = null;
var hexColor = null;

var colorPreview = null;
var colorPreviewHex = null;
var sliderR = null;
var sliderB = null;
var sliderG = null;
var btnPickNew = null;
var paletteContainer = null;
var paletteBlocks = [];

chrome.extension.onMessage.addListener (function(msg, sender, sendResponse) {
    updateImgSrc(msg.url);
});

function getCursorPosition (canvas, event) {
    const rect = canvas.getBoundingClientRect()
    const x = event.clientX - rect.left
    const y = event.clientY - rect.top
    return [x, y];
}

function loadPalette () {
    let colors = ['red', 'blue', 'yellow', 'green', 'orange', 'red', 'blue', 'yellow', 'green', 'orange'];
    for (const color of colors) {
        let block = document.createElement('div');
        console.log(color);
        block.style.backgroundColor = color;
        paletteContainer.appendChild(block);
    }
}

function pickColor () {
    colorCaptureActive = false;
    updateEyeDropper();
}

function rgbToHex (r, g, b) {
    if (r > 255 || g > 255 || b > 255)
        throw "Invalid color component";
    return ((r << 16) | (g << 8) | b).toString(16);
}

function updateColor (captureOff=false) {
    if (captureOff == true) {
        colorCaptureActive = false;
        btnPickNew.disabled = false;
    }
    r = parseInt(sliderR.value)
    g = parseInt(sliderG.value)
    b = parseInt(sliderB.value)
    hexColor = "#" + ("000000" + rgbToHex(r, g, b)).slice(-6);
    colorPreview.style.backgroundColor = hexColor;
    colorPreviewHex.textContent = hexColor;
}

function updateEyeDropper() {
    if (colorCaptureActive == true) {
        btnPickNew.className = 'btn btn-tooltip btn-active';
    }else{
        btnPickNew.className = 'btn btn-tooltip';
    }
}

function updateImgSrc (url) {

    var image = document.getElementById("temp");
    var canvas = document.getElementById("main-canvas");
    
    image.onload = function () {
        ctx = canvas.getContext("2d");

        canvas.height = document.getElementById('toolbar-right').getBoundingClientRect()['height'];
        canvas.width = document.getElementById('imgbox').getBoundingClientRect()['width'];

        var hRatio = canvas.width / image.width;
        var vRatio = canvas.height / image.height;
        var ratio  = Math.min(hRatio, vRatio);

        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.imageSmoothingEnabled = false;
        ctx.drawImage(image, 0, 0, image.width, image.height, 0, 0, image.width * ratio, image.height * ratio);

        image.remove();

        canvas.addEventListener('click', pickColor);
        colorPreview = document.getElementById('color-preview');
        colorPreviewHex = document.getElementById('color-preview-hex');
        sliderR = document.getElementById('range-red');
        sliderR.oninput = function () { updateColor(captureOff=true) }
        sliderG = document.getElementById('range-green');
        sliderG.oninput = function () { updateColor(captureOff=true) }
        sliderB = document.getElementById('range-blue');
        sliderB.oninput = function () { updateColor(captureOff=true) }
        btnPickNew = document.getElementById('btn-eye_dropper');
        btnPickNew.onclick = function () {
            colorCaptureActive = !colorCaptureActive;
            updateEyeDropper();
        }
        paletteContainer = document.getElementById('palette-container')
        loadPalette();
    }

    image.src = url;

    document.body.addEventListener('mousemove', (e) => {
        if (colorCaptureActive) {
            mouse_pos = getCursorPosition(canvas, e);
            if (mouse_pos[0] > 0 && mouse_pos[1] > 0) {
                imgData = window.ctx.getImageData(mouse_pos[0], mouse_pos[1], 1, 1).data;                
                sliderR.value = imgData[0].toString();
                sliderG.value = imgData[1].toString();
                sliderB.value = imgData[2].toString();

                updateColor();
            }
        }
    });
}