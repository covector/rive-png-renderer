# Rive PNG Sequence Renderer
## ** MP4 Rendering is now supported. But it is a lot slower than PNG Rendering**
This is a website for rendering Rive animation as PNG Image Sequence and MP4. This can act as a temporary replacement for the Cloud Render feature, which allows you to export Rive animation as video.

## Steps to use
1. Go to the website: [https://covector.github.io/rive-png-renderer/](https://covector.github.io/rive-png-renderer/)

![step 1](README_images/step1.png)

2. Select one or more .riv files

![step 2](README_images/step2.png)

3. Select the format to export (mp4 is only supported by Chrome)

![step 3](README_images/step3.png)

4. Type the animation names. This must match the ones specified in the Rive animation mode timeline

![step 4](README_images/step4.png)

5. Type the resolution multiplier E.g. if the original artboard is set to 800x800 and the resolution mutiplier is set to 2, the output resolution will be 1600x1600

![step 5](README_images/step5.png)

6. Type the frame per second for the output render E.g. if the original animation is set to 60fps in Rive and the fps here is set to 120, the output will have twice the number of frames while keeping the same duration

![step 6](README_images/step6.png)

7. Press the Render button

![step 7](README_images/step7.png)

8. Download will start automatically after rendering. The browser may ask you whether you would allow multiple files download, this is because a zip file will be generated for each .riv file

![step 8a](README_images/step8a.png)
![step 8b](README_images/step8b.png)

## Credit
Library used:<br />
[Rive Runtime](https://github.com/rive-app/rive-wasm)<br />
[JSZip](https://github.com/Stuk/jszip)<br />
[FileSaver.js](https://github.com/eligrey/FileSaver.js)<br />
[FFmpeg wasm](https://github.com/ffmpegwasm/ffmpeg.wasm)