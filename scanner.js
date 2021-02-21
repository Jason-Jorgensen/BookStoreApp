var _scannerIsRunning = false;
var scanNum = 0;

function startScanner() {
    scanNum = 0;
    Quagga.init({
        inputStream: {
            name: "Live",
            type: "LiveStream",
            target: document.querySelector('#scanner-container'),
            constraints: {
                width: 400,
                height: 480,
                facingMode: "environment"
            },
        },
        decoder: {
            readers: [
                "code_128_reader",
                "ean_reader",
                "ean_8_reader",
                "code_39_reader",
                "code_39_vin_reader",
                "codabar_reader",
                "upc_reader",
                "upc_e_reader",
                "i2of5_reader"
            ],
            debug: {
                showCanvas: true,
                showPatches: true,
                showFoundPatches: true,
                showSkeleton: true,
                showLabels: true,
                showPatchLabels: true,
                showRemainingPatchLabels: true,
                boxFromPatches: {
                    showTransformed: true,
                    showTransformedBox: true,
                    showBB: true
                }
            }
        },

    }, function (err) {
        if (err) {
            console.log(err);
            return
        }

        console.log("Initialization finished. Ready to start");
        Quagga.start();

        // Set flag to is running
        _scannerIsRunning = true;
    });

    Quagga.onProcessed(function (result) {
        var drawingCtx = Quagga.canvas.ctx.overlay,
            drawingCanvas = Quagga.canvas.dom.overlay;

        if (result) {
            if (result.boxes) {
                drawingCtx.clearRect(0, 0, parseInt(drawingCanvas.getAttribute("width")), parseInt(drawingCanvas.getAttribute("height")));
                result.boxes.filter(function (box) {
                    return box !== result.box;
                }).forEach(function (box) {
                    Quagga.ImageDebug.drawPath(box, {
                        x: 0,
                        y: 1
                    }, drawingCtx, {
                        color: "green",
                        lineWidth: 2
                    });
                });
            }

            if (result.box) {
                Quagga.ImageDebug.drawPath(result.box, {
                    x: 0,
                    y: 1
                }, drawingCtx, {
                    color: "#00F",
                    lineWidth: 2
                });
            }

            if (result.codeResult && result.codeResult.code) {
                Quagga.ImageDebug.drawPath(result.line, {
                    x: 'x',
                    y: 'y'
                }, drawingCtx, {
                    color: 'red',
                    lineWidth: 3
                });
            }
        }
    });


    Quagga.onDetected(function (result) {
        while (scanNum == 0) {

        var bookISBN= result.codeResult.code;
        var url = "http://openlibrary.org/api/books?bibkeys=ISBN:"+bookISBN+"&jscmd=details&format=json"
        $.ajax({
            url: url,
            method:"GET"
        }).then(function(response){
            isbn = `ISBN:${bookISBN}`;
            $(".bookTitle").text(response[isbn].details.full_title);
            console.log(isbn);
        })
        // $(".bookTitle").text(response.details.full_title);
        $(".bookISBN").text(bookISBN);
       
        console.log("Barcode detected and processed : [" + result.codeResult.code + "]", result);
              scanNum = scanNum + 1;
        if (scanNum == 1){
            Quagga.stop();
        }

        
        // console.log(response.detail.full_title)
        }

        
    });
}


// Start/stop scanner
document.getElementById("scanBtn").addEventListener("click", function () {
    if (_scannerIsRunning) {
        Quagga.stop();
        window.location.reload();
    } else {
        startScanner();
    }
}, false);

//Start Scanner when scanner.html is opened
document.onload = startScanner();
