let isCameraActive = false;

// 初始化相機
async function initCamera() {
    try {
        const stream = await navigator.mediaDevices.getUserMedia({ 
            video: { 
                facingMode: "environment",
                width: { ideal: 1280 },
                height: { ideal: 720 }
            } 
        });
        const video = document.getElementById('camera-preview');
        video.srcObject = stream;
        video.play();
        return true;
    } catch (error) {
        console.error('相機初始化錯誤:', error);
        showError('無法啟動相機，請確認相機權限');
        return false;
    }
}

// 啟動條碼掃描
function startBarcodeScan() {
    if (!isCameraActive) {
        const container = document.getElementById('camera-preview');
        container.style.display = 'block';
        Quagga.init({
            inputStream: {
                name: "Live",
                type: "LiveStream",
                target: '#camera-preview',
                constraints: {
                    facingMode: "environment",
                    width: { ideal: 1280 },
                    height: { ideal: 720 }
                },
            },
            decoder: {
                readers: ["ean_reader", "ean_8_reader", "upc_reader", "upc_e_reader"]
            }
        }, function(err) {
            if (err) {
                console.error('Quagga 初始化錯誤:', err);
                showError('條碼掃描器初始化失敗');
                return;
            }
            Quagga.start();
            isCameraActive = true;
        });

        Quagga.onDetected(function(result) {
            const code = result.codeResult.code;
            document.getElementById('searchInput').value = code;
            stopBarcodeScan();
            document.getElementById('searchButton').click();
        });
    }
}

// 停止條碼掃描
function stopBarcodeScan() {
    if (isCameraActive) {
        Quagga.stop();
        const container = document.getElementById('camera-preview');
        container.style.display = 'none';
        isCameraActive = false;
    }
}

// 相機按鈕事件監聽器
document.getElementById('scanBarcodeBtn').addEventListener('click', function() {
    alert('button clicked');
    if (!isCameraActive) {
        startBarcodeScan();
    } else {
        stopBarcodeScan();
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
