// Html5-qrcode 掃描功能
const qrResult = document.getElementById('qr-result');
const html5QrCode = new Html5Qrcode("reader");

function onScanSuccess(decodedText, decodedResult) {
    qrResult.value = decodedText;
    document.getElementById('searchInput').value = decodedText;
    html5QrCode.stop();
}

document.getElementById('scanBarcodeBtn').addEventListener('click', function() {
    html5QrCode.start(
        { facingMode: "environment" },
        {
            fps: 10,
            qrbox: 250
        },
        onScanSuccess
    );
});

function showError(message) {
    const errorDiv = document.getElementById('error');
    errorDiv.textContent = message;
    errorDiv.style.display = 'block';
    setTimeout(() => {
        errorDiv.style.display = 'none';
    }, 5000);
} 
