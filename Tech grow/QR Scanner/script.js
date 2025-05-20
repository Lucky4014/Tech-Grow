const video = document.getElementById('video');
const canvas = document.getElementById('canvas');
const output = document.getElementById('output');
const startBtn = document.getElementById('startBtn');
const scanBox = document.getElementById('scanBox');
let scanning = false;
let stream;

startBtn.addEventListener('click', async () => {
    if (scanning) {
        stopScan();
        return;
    }
    try {
        stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
        video.srcObject = stream;
        video.setAttribute('playsinline', true);
        await video.play();
        scanning = true;
        startBtn.textContent = 'Stop Scan';
        video.style.display = 'block';
        scanBox.style.display = 'block';
        tick();
    } catch (err) {
        output.textContent = 'Camera access denied.';
        console.error(err);
    }
});

function stopScan() {
    scanning = false;
    startBtn.textContent = 'Start Scan';
    scanBox.style.display = 'none';
    video.style.display = 'none';
    if (stream) {
        stream.getTracks().forEach(t => t.stop());
    }
}

function tick() {
    if (!scanning) return;
    if (video.readyState === video.HAVE_ENOUGH_DATA) {
        canvas.height = video.videoHeight;
        canvas.width = video.videoWidth;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const code = jsQR(imageData.data, imageData.width, imageData.height, { inversionAttempts: 'dontInvert' });
        if (code) {
            drawBox(ctx, code.location);
            output.textContent = code.data;
            stopScan();
            return;
        }
    }
    requestAnimationFrame(tick);
}

function drawBox(ctx, loc) {
    ctx.beginPath();
    ctx.moveTo(loc.topLeftCorner.x, loc.topLeftCorner.y);
    ctx.lineTo(loc.topRightCorner.x, loc.topRightCorner.y);
    ctx.lineTo(loc.bottomRightCorner.x, loc.bottomRightCorner.y);
    ctx.lineTo(loc.bottomLeftCorner.x, loc.bottomLeftCorner.y);
    ctx.closePath();
    ctx.lineWidth = 4;
    ctx.strokeStyle = '#00c6ff';
    ctx.stroke();
}