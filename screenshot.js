var colorCaptureActive = true;
var imgData = null;
var hexColor = null;

var colorPreview = null;
var colorName = null;
var sliderR = null;
var sliderB = null;
var sliderG = null;
var textR = null;
var textG = null;
var textB = null;
var btnAdd = null;
var btnPickNew = null;
var btnSavePalette = null;
var palettePreview = null;
var paletteBlocks = [];
var currentPalette = {
    name: '',
    colors: []
}

chrome.extension.onMessage.addListener (function(msg, sender, sendResponse) {
    updateImgSrc(msg.url);
});

function addColorToPalette () {
    // Check if color is already in the current palette
    color = getHexColor();
    if (currentPalette.colors.length) {
        let colors = currentPalette.colors.map(c => c.hex);
        if (colors.includes(color)){
            alert(`This palette already contains the color ${color.toUpperCase()}`)
            return;
        }
    }

    let newColorName = '';
    if (colorName.value !== '') {
        newColorName = colorName.value;
        colorName.value = '';
    }else{
        newColorName = color.toUpperCase();
    }

    let newColor = {
        name: newColorName,
        hex: color
    }
    currentPalette.colors.push(newColor);

    // TODO: Move the below to its own fn 'showPalette'
    let block = document.createElement('div');
    // console.log(color);
    block.style.backgroundColor = color;
    let label = document.createElement('div');
    label.textContent = newColorName;
    label.className = 'palette-color-label';
    block.appendChild(label);

    palettePreview.appendChild(block);
}

function getCursorPosition (canvas, event) {
    const rect = canvas.getBoundingClientRect()
    const x = event.clientX - rect.left
    const y = event.clientY - rect.top
    return [x, y];
}

function getHexColor (r=parseInt(sliderR.value), g=parseInt(sliderG.value), b=parseInt(sliderB.value)) {
    return "#" + ("000000" + rgbToHex(r, g, b)).slice(-6);
}

function loadPalette () {
    let colors = ['red', 'blue', 'yellow', 'green', 'orange', 'red', 'blue', 'yellow', 'green', 'orange'];
    for (const color of colors) {
        addColorToPalette(color);
    }
}

function pickColor () {
    colorCaptureActive = false;
    updateEyeDropper();
    colorName.select();
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
    
    colorPreview.style.backgroundColor = getHexColor();
    colorName.value = getHexColor().toUpperCase();
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

        canvas.height = image.height;
        canvas.width = image.width;

        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.imageSmoothingEnabled = false;
        ctx.drawImage(image, 0, 0);

        image.remove();

        canvas.addEventListener('click', pickColor);
        colorPreview = document.getElementById('color-preview');
        colorName = document.getElementById('color-name');
        sliderR = document.getElementById('range-red');
        sliderR.oninput = function () { updateTextFromSliders() }
        sliderG = document.getElementById('range-green');
        sliderG.oninput = function () { updateTextFromSliders() }
        sliderB = document.getElementById('range-blue');
        sliderB.oninput = function () { updateTextFromSliders() }
        textR = document.getElementById('text-red');
        textR.oninput = function () { updateSlidersFromText() }
        textG = document.getElementById('text-green');
        textG.oninput = function () { updateSlidersFromText() }
        textB = document.getElementById('text-blue');
        textB.oninput = function () { updateSlidersFromText() }
        btnPickNew = document.getElementById('btn-eye-dropper');
        btnPickNew.onclick = function () {
            colorCaptureActive = !colorCaptureActive;
            updateEyeDropper();
        }
        btnAdd = document.getElementById('btn-add');
        btnAdd.onclick = function () {
            addColorToPalette();
        }
        btnSavePalette = document.getElementById('btn-save-palette');

        palettePreview = document.getElementById('palette-preview');
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

function updateSlidersFromText () {
    // TODO: Validate input
    sliderR.value = textR.value;
    sliderG.value = textG.value;
    sliderB.value = textB.value;
    updateColor(captureOff=true);
}

function updateTextFromSliders () {
    textR.value = sliderR.value;
    textG.value = sliderG.value;
    textB.value = sliderB.value;
    updateColor(captureOff=true);
}