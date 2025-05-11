const html5QrCode = new Html5Qrcode("reader");
let isScanning = false;

function onScanSuccess(decodedText, decodedResult) {
    const searchInput = document.getElementById('searchInput');
    const currentValue = searchInput.value.trim();
    searchInput.value = currentValue ? `${currentValue} ${decodedText}` : decodedText;
    html5QrCode.stop();
    document.getElementById('reader').style.display = 'none';
    isScanning = false;
}

document.getElementById('scanBarcodeBtn').addEventListener('click', function() {
    const reader = document.getElementById('reader');
    
    if (isScanning) {
        html5QrCode.stop();
        reader.style.display = 'none';
        isScanning = false;
    } else {
        reader.style.display = 'block';
        html5QrCode.start(
            { facingMode: "environment" },
            {
                fps: 10,
                qrbox: 250,
                formatsToSupport: [
                    Html5QrcodeSupportedFormats.QR_CODE,
                    Html5QrcodeSupportedFormats.EAN_13,
                    Html5QrcodeSupportedFormats.EAN_8,
                    Html5QrcodeSupportedFormats.UPC_A,
                    Html5QrcodeSupportedFormats.UPC_E,
                    Html5QrcodeSupportedFormats.CODE_128
                ]
            },
            onScanSuccess
        ).catch(err => {
            console.error("相機啟動失敗", err);
            document.getElementById('error').textContent = '相機啟動失敗，請檢查權限或瀏覽器支援度';
            reader.style.display = 'none';
            isScanning = false;
        });
        isScanning = true;
    }
});

function showError(message) {
    const errorDiv = document.getElementById('error');
    errorDiv.textContent = message;
    errorDiv.style.display = 'block';
    setTimeout(() => {
        errorDiv.style.display = 'none';
    }, 5000);
}
