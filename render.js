const Render = () => {
    if (!Validate()) { return; }
    Start();
    Rive({
        locateFile: (file) => 'https://unpkg.com/rive-canvas@0.6.7/' + file,
    }).then((rive) => 
        FileToUint8Array(rive)
    ).then((res) => {
        // load animation
        let rive = res.rive;
        let file = rive.load(res.array);
        let artboard = file.defaultArtboard();
        let animationName = document.getElementById("animationName").value;
        let anim = artboard.animation(animationName);
        let Instance = new rive.LinearAnimationInstance(anim);
        let canvas = document.getElementById('riveCanvas');
        let dim = artboard.bounds;
        let resMult = parseFloat(document.getElementById('size').value);
        canvas.width = dim.maxX * resMult;
        canvas.height = dim.maxY * resMult;
        let ctx = canvas.getContext('2d');
        let renderer = new rive.CanvasRenderer(ctx);
        // loop through animation and save to zip
        let duration = anim.duration;
        let digit = Math.ceil(Math.log10(duration));
        let zip = new JSZip();
        let imgseq = zip.folder("imgseq");
        // sacrifice a little performance for user friendliness
        let i = 0;
        var forLoop = setInterval(()=>{
            i++
            if (i < duration + 1){
                Progress(i + 1, duration + 1)
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
            else{
                clearInterval(forLoop);
                // callback
                Zipping();
                zip.generateAsync({type:"blob"})
                .then(function(content) {
                    saveAs(content, "render.zip");
                    Done();
                });
            }
        },1);
    });
};

const Validate = () => {
    return true;
}

const FileToUint8Array = (rive) => new Promise((res, rej) => {
    // a code from stack overflow idk what does it do
    let reader = new FileReader();
    let rivFile = document.getElementById("rivFile").files[0];
    reader.onerror = function(event) {
        reader.abort();
        rej(reader.error);
    }; 
    reader.readAsArrayBuffer(rivFile);
    reader.onloadend = (evt) => {
        if (evt.target.readyState == FileReader.DONE) {
            let arrayBuffer = evt.target.result
            res({rive, array: new Uint8Array(arrayBuffer)});
        }
    }
});

const Pad = (number, digit) => {
    let stringOut = number.toString();
    while(stringOut.length <= digit){
        stringOut = "0"+stringOut;
    }
    return stringOut;
}

const Start = () => {
    document.getElementById("status").textContent = "Initializing...";
    document.getElementById("renderButton").style.display = "none";
}

const Progress = (current, total) => {
    let text = `${current}/${total} Done; ${Math.round(100 * current/total)} %`;
    document.getElementById("status").textContent = text;
}

const Zipping = () => {
    document.getElementById("status").textContent = "Zipping...";
}

const Done = () => {
    document.getElementById("status").textContent = "";
    document.getElementById("renderButton").style.display = "block";
}