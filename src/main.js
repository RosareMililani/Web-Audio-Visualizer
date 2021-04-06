/*
	main.js is primarily responsible for hooking up the UI to the rest of the application 
	and setting up the main event loop
*/

// We will write the functions in this file in the traditional ES5 way
// In this instance, we feel the code is more readable if written this way
// If you want to re-write these as ES6 arrow functions, to be consistent with the other files, go ahead!

import * as utils from './utils.js';
import * as audio from './audio.js';
import * as visualizer from './visualizer.js';

const drawParams = {
  showGradient: true,
  showBars: true,
  showNoise: false,
  showCirclesBlue: true,
  showEmboss: true,
  showInvert: true,
  showWave: false
};

// 1 - here we are faking an enumeration
const DEFAULTS = Object.freeze({
  sound1: "media/interlude shadow.mp3"
});

function init() {
  audio.setupWebaudio(DEFAULTS.sound1);
  console.log("init called");
  console.log(`Testing utils.getRandomColor() import: ${utils.getRandomColor()}`);
  let canvasElement = document.querySelector("canvas"); // hookup <canvas> element
  setupUI(canvasElement);
  visualizer.setupCanvas(canvasElement, audio.analyserNode);
  loop();
}

function setupUI(canvasElement) {
  // A - hookup fullscreen button
  const fsButton = document.querySelector("#fsButton");

  // add .onclick event to button
  fsButton.onclick = e => {
    console.log("init called");
    utils.goFullscreen(canvasElement);
  };

  //C - hookup all slider and label
  let volumeSlider = document.querySelector("#volumeSlider");
  let volumeLabel = document.querySelector("#volumeLabel");

  //add .oninput event to slider
  volumeSlider.oninput = e => {
    //set the gain
    audio.setVolume(e.target.value);
    //update value of label to match value of slider
    volumeLabel.innerHTML = Math.round((e.target.value / 2 * 100));
  };

  //set value of label to match intitial value of slider
  volumeSlider.dispatchEvent(new Event("input"));

  //for noise slider
  let noiseSlider = document.querySelector("#noiseSlider");
  let noiseLabel = document.querySelector("#noiseLabel");
  noiseSlider.onchange = e => {
    if (noiseSlider.value > 0) {
      drawParams.showNoise = true;
      visualizer.setNoiseValue(noiseSlider.value);
      noiseLabel.innerHTML = noiseSlider.value;
    } else {
      drawParams.showNoise = false;
      noiseLabel.innerHTML = 0;
    }
  }

  //for speed slider
  let speedSlider = document.querySelector("#speedSlider");
  let speedLabel = document.querySelector("#speedLabel");

  speedSlider.oninput = e => {
    audio.setSpeed(e.target.value);
    speedLabel.innerHTML = e.target.value + "x";
  }

  speedSlider.dispatchEvent(new Event("input"));

  // for delay slider
  /* let delaySlider = document.querySelector("#delaySlider");
  let delayLabel = document.querySelector("#delayLabel");

  delaySlider.oninput = e => {
    
    drawParams.maxRadius = e.target.value;
    delayLabel.innerHTML = Math.round(e.target.value);
  };

  delaySlider.dispatchEvent(new Event("input")); */

  //D - hookup track<select>
  let trackSelect = document.querySelector("#trackSelect");
  //add .onchange evenet to <select>
  trackSelect.onchange = e => {
    audio.loadSoundFile(e.target.value);
    //pause the current track if it is playing
    if (playButton.dataset.playing = "yes") {
      playButton.dispatchEvent(new MouseEvent("click"));
    }
  };

} // end setupUI

function loop() {
  /* NOTE: This is temporary testing code that we will delete in Part II */
  requestAnimationFrame(loop);
  //for checked boxes options
  //gradient
  if (document.querySelector("#gradientCB").checked == true) {
    drawParams.showGradient = true;
  }
  else {
    drawParams.showGradient = false;
  }
  //bars
  if (document.querySelector("#barsCB").checked == true) {
    drawParams.showBars = true;
  }
  else {
    drawParams.showBars = false;
  }

  //waveform
  if (document.querySelector("#waveformCB").checked == true) {
    drawParams.showWave = true;
  }
  else {
    drawParams.showWave = false;
  }

  //draw circles
  if (document.querySelector("#blueCircle").checked == true) {
    drawParams.showCirclesBlue = true;
  }
  else {
    drawParams.showCirclesBlue = false;
  }

  //invert colors
  if (document.querySelector("#invertCB").checked == true) {
    drawParams.showInvert = true;
  }
  else {
    drawParams.showInvert = false;
  }

  //emboss
  if (document.querySelector("#embossCB").checked == true) {
    drawParams.showEmboss = true;
  }
  else {
    drawParams.showEmboss = false;
  }

  visualizer.draw(drawParams);
  /*   // 1) create a byte array (values of 0-255) to hold the audio data
    // normally, we do this once when the program starts up, NOT every frame
    let audioData = new Uint8Array(audio.analyserNode.fftSize / 2);
  
    // 2) populate the array of audio data *by reference* (i.e. by its address)
    audio.analyserNode.getByteFrequencyData(audioData);
  
    // 3) log out the array and the average loudness (amplitude) of all of the frequency bins
    console.log(audioData);
  
    console.log("-----Audio Stats-----");
    let totalLoudness = audioData.reduce((total, num) => total + num);
    let averageLoudness = totalLoudness / (audio.analyserNode.fftSize / 2);
    let minLoudness = Math.min(...audioData); // ooh - the ES6 spread operator is handy!
    let maxLoudness = Math.max(...audioData); // ditto!
    // Now look at loudness in a specific bin
    // 22050 kHz divided by 128 bins = 172.23 kHz per bin
    // the 12th element in array represents loudness at 2.067 kHz
    let loudnessAt2K = audioData[11];
    console.log(`averageLoudness = ${averageLoudness}`);
    console.log(`minLoudness = ${minLoudness}`);
    console.log(`maxLoudness = ${maxLoudness}`);
    console.log(`loudnessAt2K = ${loudnessAt2K}`);
    console.log("---------------------"); */
}

export { init };