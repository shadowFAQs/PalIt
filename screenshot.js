var colorcapture_active = true;

chrome.extension.onMessage.addListener(function(msg, sender, sendResponse) {
    updateImgSrc(msg.url);
});

function getCursorPosition(canvas, event) {
    const rect = canvas.getBoundingClientRect()
    const x = event.clientX - rect.left
    const y = event.clientY - rect.top
    return [x, y];
}

function rgbToHex(r, g, b) {
    if (r > 255 || g > 255 || b > 255)
        throw "Invalid color component";
    return ((r << 16) | (g << 8) | b).toString(16);
}

function updateImgSrc(url) {

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
    }

    image.src = url;

    document.body.addEventListener("mousemove", (e) => {
        if (colorcapture_active) {
            mouse_pos = getCursorPosition(canvas, e);
            var imgData = window.ctx.getImageData(mouse_pos[0], mouse_pos[1], 1, 1).data;
            var hex = "#" + ("000000" + rgbToHex(imgData[0], imgData[1], imgData[2])).slice(-6);
            document.getElementById("color-preview").style.backgroundColor = hex;
            document.getElementById("color-preview-hex").textContent = hex;
        }
    });
}