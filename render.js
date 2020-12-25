const Render = () => {
    Start();
    Rive({
        locateFile: (file) => 'https://unpkg.com/rive-canvas@0.6.7/' + file,
    }).then((rive) =>{
        for (let i = 0; i < fileNames.length; i++){
            RenderIndie(rive, fileNames[i]).then((fileName)=>{
                Done(fileName);
            }, (fileName) =>{
                Invalid(fileName);
            });
        }
    });
};

const RenderIndie = (rive, fileName) => new Promise((res, rej) => {
    StartIndie(fileName);
    // load animation
    FileToUint8Array(files[fileName]).then((byte) => {
        let file = rive.load(byte);
        let artboard = file.defaultArtboard();
        let animationName = document.getElementById("animationName_"+fileName).value;
        let anim = artboard.animation(animationName);
        if (!anim){
            document.getElementById("status_"+fileName).textContent = "Invalid animation name"
            rej(fileName);
            return;
        }
        let Instance = new rive.LinearAnimationInstance(anim);
        let dim = artboard.bounds;
        let resMult = parseFloat(document.getElementById("size_"+fileName).value);
        if (!resMult){
            document.getElementById("status_"+fileName).textContent = "Invalid resolution multiplier"
            rej(fileName);
            return;
        }
        let canvas = document.createElement("CANVAS");
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
            if (i < duration + 1){
                Progress(fileName, i + 1, duration + 1)
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
                canvas.remove();
                // callback
                Zipping(fileName);
                zip.generateAsync({type:"blob"})
                .then(function(content) {
                    saveAs(content, fileName+"_render.zip");
                    res(fileName);
                    return;
                });
            }
            i++
        },1);
    });
});

const FileToUint8Array = (file) => new Promise((res, rej) => {
    // a code from stack overflow idk what does it do
    let reader = new FileReader();
    reader.onerror = function(event) {
        reader.abort();
        console.log(reader.error);
    }; 
    reader.readAsArrayBuffer(file);
    reader.onloadend = (evt) => {
        if (evt.target.readyState == FileReader.DONE) {
            let arrayBuffer = evt.target.result
            res(new Uint8Array(arrayBuffer));
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

var files = [];
var fileNames = [];

const ChoseFiles = (fileList) => {
    for (let i = 0; i < fileList.length; i++){
        let fileNameMatch = fileList[i].name.match(/.*.(?=.riv)/);
        let fileName = fileNameMatch ? fileNameMatch[0] : null;
        if (fileName && !files[fileName]){
            files[fileName] = fileList[i];
            fileNames.push(fileName);
            AddFile(fileName);
        }
    }
    RenderButtonVisibility();
}

const AddFile = (fileName) => {
    // create section
    let container = document.createElement("DIV");
    container.id = "container_"+fileName;

    let header = document.createElement("H2");
    header.textContent = fileName;

    let form = document.createElement("FORM");

    let animationName = "animationName_"+fileName;
    let animationNameLabel = document.createElement("LABEL");
    animationNameLabel.textContent = "Type in animation name (e.g. idle): "; 
    animationNameLabel.for = animationName;
    let animationNameInput = document.createElement("INPUT");
    animationNameInput.type = "text";
    animationNameInput.id = animationName;
    animationNameInput.value = "Untitled 1";

    let size = "size_"+fileName;
    let sizeLabel = document.createElement("LABEL");
    sizeLabel.textContent = "Resolution multiplier of the render. This number is multiplied with the artboard resolution you chose. (e.g. 1.5): "; 
    sizeLabel.for = size;
    let sizeInput = document.createElement("INPUT");
    sizeInput.type = "text";
    sizeInput.id = size;
    sizeInput.value = "1";

    let br = () => document.createElement("BR");
    let hr = document.createElement("HR");

    let status = document.createElement("div");
    status.id = "status_"+fileName;

    let button = document.createElement("BUTTON");
    button.id = "button_"+fileName;
    button.textContent = "Remove";
    button.onclick = () => {RemoveFile(`${fileName}`);}

    form.append(animationNameLabel, br(), animationNameInput, br(), br(), sizeLabel, br(), sizeInput, br(), br());
    container.append(header, form, status, button, hr);

    document.getElementById("fileList").append(container);
}

const RemoveFile = (fileName) => {
    files[fileName] = null;
    fileNames.splice(fileNames.indexOf(fileName), 1);
    document.getElementById("container_"+fileName).remove();
    RenderButtonVisibility();
}

const RenderButtonVisibility = () => {
    if (fileNames.length == 0){
        document.getElementById("renderButton").style.display = "none";
    }
    else{
        document.getElementById("renderButton").style.display = "block";
    }
}

var finished = 0;
var total = 1;
var invalidTotal = 0;

const Start = () => {
    document.getElementById("status").textContent = "Rendering...";
    document.getElementById("renderButton").style.display = "none";
    finished = 0;
    total = fileNames.length;
    invalidTotal = 0;
}

const StartIndie = (fileName) => {
    document.getElementById("status_"+fileName).textContent = "Initializing...";
    document.getElementById("button_"+fileName).style.display = "none";
}

const Progress = (fileName, current, total) => {
    let text = `${current}/${total} frame done; ${Math.round(100 * current/total)} %`;
    document.getElementById("status_"+fileName).textContent = text;
}

const Zipping = (fileName) => {
    document.getElementById("status_"+fileName).textContent = "Zipping...";
}

const Done = (fileName) => {
    document.getElementById("status_"+fileName).textContent = "Finished";
    finished++;
    document.getElementById("status").textContent = `${finished}/${total} file done`;
    if (finished == total) {
        AllDone();
    }
    document.getElementById("button_"+fileName).style.display = "block";
}

const Invalid = (fileName) => {
    invalidTotal++;
    total--;
    if (finished == total) {
        AllDone();
    }
    document.getElementById("button_"+fileName).style.display = "block";
}

const AllDone = () => {
    document.getElementById("renderButton").style.display = "block";
    document.getElementById("status").textContent = `All files have finished rendering. ${invalidTotal} error occurred`;
}