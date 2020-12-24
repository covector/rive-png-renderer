const Render = () => {
    Rive({
        locateFile: (file) => 'https://unpkg.com/rive-canvas@0.6.7/' + file,
    }).then((rive) => {
        // a code from stack overflow idk what does it do
        let reader = new FileReader();
        let rivFile = document.getElementById("rivFile").files[0];
        reader.readAsArrayBuffer(rivFile);
        reader.onloadend = function (evt) {
            if (evt.target.readyState == FileReader.DONE) {
                let arrayBuffer = evt.target.result
                let array = new Uint8Array(arrayBuffer);
                // directly copy from the rive doc
                let file = rive.load(array);
                let artboard = file.defaultArtboard();
                let animationName = document.getElementById("animationName").value;
                let anim = artboard.animation(animationName);
                let Instance = new rive.LinearAnimationInstance(anim);
                let canvas = document.getElementById('riveCanvas');
                let ctx = canvas.getContext('2d');
                let renderer = new rive.CanvasRenderer(ctx);
                // loop through animation and save to zip
                let duration = anim.duration;
                let digit = Math.ceil(Math.log10(duration));
                let zip = new JSZip();
                let imgseq = zip.folder("imgseq");
                for (let i = 0; i < duration + 1; i++){
                    // update canvas
                    let elapsedTime = i == 0 ? 0 : 1 / 60;
                    Instance.advance(elapsedTime);
                    Instance.apply(artboard, 1.0);
                    artboard.advance(elapsedTime);
                    ctx.clearRect(0, 0, canvas.width, canvas.height);
                    ctx.save();
                    renderer.align(rive.Fit.contain, rive.Alignment.center, {
                        minX: 0,
                        minY: 0,
                        maxX: canvas.width,
                        maxY: canvas.height
                    }, artboard.bounds);
                    artboard.draw(renderer);
                    ctx.restore();
                    // save image
                    let imgData = canvas.toDataURL("image/png");
                    img = imgData.match(/(?<=base64,)..*/)[0];
                    imgseq.file(Pad(i, digit)+".png", img, {base64: true}); 
                }
                zip.generateAsync({type:"blob"})
                .then(function(content) {
                    saveAs(content, "render.zip");
                });
            }
        }  
    });
};

const Pad = (number, digit) => {
    let stringOut = number.toString();
    while(stringOut.length <= digit){
        stringOut = "0"+stringOut;
    }
    return stringOut;
}