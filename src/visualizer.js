/*
	The purpose of this file is to take in the analyser node and a <canvas> element: 
	  - the module will create a drawing context that points at the <canvas> 
	  - it will store the reference to the analyser node
	  - in draw(), it will loop through the data in the analyser node
	  - and then draw something representative on the canvas
	  - maybe a better name for this file/module would be *visualizer.js* ?
*/

import * as utils from './utils.js';

let ctx, canvasWidth, canvasHeight, gradient, analyserNode, audioData, noiseValue, waveData;

// 	window.addEventListener("load",init);
function loadImagesWithCallback(imagePath, images) {
    //loadImagesWithCallback(imagePath,function(images){
    imageArray = images;
    currentImage = imageArray.randomElement();
    console.log("** images all pre-loaded **");
    console.log("imageArray=" + imageArray);
    init();
}

function setupCanvas(canvasElement, analyserNodeRef) {
    // create drawing context
    ctx = canvasElement.getContext("2d");
    canvasWidth = canvasElement.width;
    canvasHeight = canvasElement.height;
    // create a gradient that runs top to bottom
    /* Yellow gradient */
    gradient = utils.getLinearGradient(ctx, 0, 0, 0, canvasHeight, [{ percent: 0, color: "blue" }, { percent: .25, color: "#0080ff" }, { percent: .46, color: "#1a8dff" }, { percent: .70, color: "#3399ff" }, { percent: .90, color: "#4da6ff" }, { percent: 1, color: "white" }]);
    // keep a reference to the analyser node
    analyserNode = analyserNodeRef;
    // this is the array where the analyser data will be stored
    audioData = new Uint8Array(analyserNode.fftSize / 2);
    waveData = new Uint8Array(analyserNode.fftSize / 2);
}



function draw(params = {}) {

    // 1 - populate the audioData array with the frequency data from the analyserNode
    // notice these arrays are passed "by reference" 
    analyserNode.getByteFrequencyData(audioData);
    analyserNode.getByteTimeDomainData(waveData); //waveform

    // 2 - draw background
    ctx.save();
    ctx.fillStyle = "black";
    ctx.globalAlpha = .1;
    ctx.fillRect(0, 0, canvasWidth, canvasHeight);
    ctx.restore();

    // 3 - draw gradient
    if (params.showGradient) {
        ctx.save();
        ctx.fillStyle = gradient;
        ctx.globalAlpha = .3;
        ctx.fillRect(0, 0, canvasWidth, canvasHeight);
        ctx.restore();
    }

    // 4 - draw bars
    if (params.showBars) {
        let drawData = audioData;
        let barSpacing = 4;
        let margin = 5;
        let screenWidthForBars = canvasWidth - (drawData.length * barSpacing) - margin * 2;
        let barWidth = screenWidthForBars / drawData.length;
        let barHeight = 200;
        let topSpacing = 100;

        ctx.save();
        ctx.fillStyle = 'rgba(255,255,255,0.50)';
        ctx.strokeStyle = 'rgba(0,0,255,0.5)';

        //loop through the data and draw
        for (let i = 0; i < drawData.length; i++) {
            ctx.fillRect(margin + i * (barWidth + barSpacing), topSpacing + 256 - drawData[i], barWidth, barHeight);
            ctx.strokeRect(margin + i * (barWidth + barSpacing), topSpacing + 256 - drawData[i], barWidth, barHeight);
        }
        ctx.restore();
    }
    //show waves
    if (params.showWave) {
        let drawData = waveData;
        let barSpacing = 3;
        let margin = 5;
        let screenWidthForBars = canvasWidth - (drawData.length * barSpacing) - margin * 2;
        let barWidth = screenWidthForBars / drawData.length;
        let barHeight = 200;
        let topSpacing = 50;

        ctx.save();
        ctx.fillStyle = 'rgba(128,0,128,0.80)';
        ctx.strokeStyle = 'rgba(0,0,0,.3)';

        //loop through the data and draw
        for (let i = 0; i < drawData.length; i++) {
            ctx.fillRect(margin + i * (barWidth + barSpacing), topSpacing + 256 - drawData[i], barWidth, barHeight);
            ctx.strokeRect(margin + i * (barWidth + barSpacing), topSpacing + 256 - drawData[i], barWidth, barHeight);
        }
        ctx.restore();
    }
    // 5 - draw blue circles
    if (params.showCirclesBlue) {
        let maxRadius = canvasHeight / 4;
        ctx.save();
        ctx.globalAlpha = 0.5;
        for (let i = 0; i < audioData.length; i++) {
            //red ish circles
            let percent = audioData[i] / 255;

            let circleRadius = percent * maxRadius;
            ctx.beginPath();
            ctx.fillStyle = utils.makeColor(255, 255, 177, .34 - percent / 3.0);
            ctx.arc(canvasWidth / 2, canvasHeight / 2, circleRadius, 0, 2 * Math.PI, false);
            ctx.fill();
            ctx.closePath();

            //bigger, more transparent
            ctx.beginPath();
            ctx.fillStyle = utils.makeColor(255, 255, 118, .10 - percent / 10.0);
            ctx.arc(canvasWidth / 2, canvasHeight / 2, circleRadius * 1.5, 0, 2 * Math.PI, false);
            ctx.fill();
            ctx.closePath();

            //smaller circles
            ctx.save();
            ctx.beginPath();
            ctx.fillStyle = utils.makeColor(255, 255, 228, 0.5 - percent / 5, 0);
            ctx.arc(canvasWidth / 2, canvasHeight / 2, circleRadius * .5, 0, 2 * Math.PI, false);
            ctx.fill();
            ctx.closePath();
            ctx.restore();

        }


    }

    // 6 - bitmap manipulation
    // TODO: right now. we are looping though every pixel of the canvas (320,000 of them!), 
    // regardless of whether or not we are applying a pixel effect
    // At some point, refactor this code so that we are looping though the image data only if
    // it is necessary

    // A) grab all of the pixels on the canvas and put them in the `data` array
    // `imageData.data` is a `Uint8ClampedArray()` typed array that has 1.28 million elements!
    // the variable `data` below is a reference to that array 
    let imageData = ctx.getImageData(0, 0, canvasWidth, canvasHeight);
    let data = imageData.data;
    let length = data.length;
    let width = imageData.width; //not using here
    // B) Iterate through each pixel, stepping 4 elements at a time (which is the RGBA for 1 pixel)
    for (let i = 0; i < length; i++) {
        // C) randomly change every 20th pixel to red
        if (params.showNoise && Math.random() < noiseValue) {
            // data[i] is the red channel
            // data[i+1] is the green channel
            // data[i+2] is the blue channel
            // data[i+3] is the alpha channel
            data[i] = data[i + 1] = data[i + 2] = 0;// zero out the red and green and blue channels
            data[i] = 255; // make the red channel 100% red
            // end if
        }
        //for show invert
        if (params.showInvert) {
            let red = data[i], green = data[i + 1], blue = data[i + 2];
            data[i] = 255 - red;// set red value
            data[i + 1] = 255 - green;// set blue value
            data[i + 2] = 255 - blue;// set green value
            // data[i+3] is the alpha channel but were leaving that alone
        }
    }
    // end for

    //emboss effect
    //note we are stepping through *each* sub-pixel
    if (params.showEmboss) {
        for (let i = 0; i < length; i++) {
            if (i % 4 == 3) continue; //skip alpha channel
            data[i] = 127 + 2 * data[i] - data[i + 4] - data[i + width * 4];
        }
    }

    // D) copy image data back to canvas
    ctx.putImageData(imageData, 0, 0);
}


function setNoiseValue(val) {
    noiseValue = val;
}

export { setupCanvas, draw, loadImagesWithCallback, setNoiseValue };