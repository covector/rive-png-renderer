# Rive PNG Sequence Renderer
This is a temporary replacement for the Cloud Render feature, which allows you to export Rive animation as video.
## Steps to use
1. Go to the [webpage](https://covector.github.io/rive-png-renderer/)

![step 1](README_images/step1.png)

2. Select one or more .riv files

![step 2](README_images/step2.png)

3. Type the animation names. These must match the ones specified in the Rive animation mode timeline

![step 3](README_images/step3.png)

4. Type the resolution multiplier E.g. if the original artboard is set to 800x800 and the resolution mutiplier is set to 2, the output resolution will be 1600x1600

![step 4](README_images/step4.png)

5. Press the Render button

![step 5](README_images/step5.png)

6. Download will start automatically after rendering. The browser may ask you whether you would allow multiple files download, this is because a zip file will be generated for each .riv file

![step 6a](README_images/step6a.png)
![step 6b](README_images/step6b.png)

## Dependencies
[Rive Runtime](https://github.com/rive-app/rive-wasm)<br />
[JSZip](https://github.com/Stuk/jszip)<br />
[FileSaver.js](https://github.com/eligrey/FileSaver.js)
