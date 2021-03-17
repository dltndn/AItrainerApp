//Teachable Machine logic
// More API functions here:
// https://github.com/googlecreativelab/teachablemachine-community/tree/master/libraries/pose

// the link to your model provided by Teachable Machine export panel
let model, webcam, ctx, labelContainer, maxPredictions;

let LSCount = localStorage.getItem("target");
LSCount = Number(LSCount);
let LSSet = localStorage.getItem("set");
LSSet = Number(LSSet);
const innerCurrentCount = document.getElementById("currentCount");
const innerCurrentSet = document.getElementById("currentSet");



async function init() {
    const modelURL = URL + "model.json";
    const metadataURL = URL + "metadata.json";


    // load the model and metadata
    // Refer to tmImage.loadFromFiles() in the API to support files from a file picker
    // Note: the pose library adds a tmPose object to your window (window.tmPose)
    model = await tmPose.load(modelURL, metadataURL);
    maxPredictions = model.getTotalClasses();

    // Convenience function to setup a webcam
    const size = 200;
    const flip = true; // whether to flip the webcam
    webcam = new tmPose.Webcam(size, size, flip); // width, height, flip
    await webcam.setup(); // request access to the webcam
    await webcam.play();
    window.requestAnimationFrame(loop);

    // append/get elements to the DOM
    const canvas = document.getElementById("canvas");
    canvas.width = size; canvas.height = size;
    ctx = canvas.getContext("2d");
    labelContainer = document.getElementById("label-container");
    for (let i = 0; i < maxPredictions; i++) { // and class labels
        labelContainer.appendChild(document.createElement("div"));
    }
}

async function loop(timestamp) {
    webcam.update(); // update the webcam frame
    await predict();
    window.requestAnimationFrame(loop);
}

let state = "up"
let count = 0;
let set = 1;

async function predict() {
    // Prediction #1: run input through posenet
    // estimatePose can take in an image, video or canvas html element
    const { pose, posenetOutput } = await model.estimatePose(webcam.canvas);
    // Prediction 2: run input through teachable machine classification model
    const prediction = await model.predict(posenetOutput);
    if (prediction[0].probability.toFixed(2) == 1.00) {
        if (state == "push") {
            count += 1;
            selectedVoice(count);
            innerCurrentCount.innerHTML = "횟수: " + count;
            innerCurrentSet.innerHTML = "세트: " + set;
            refreshCount(count);
            if (count == LSCount) {
                set += 1;
                soundSetEnd();
                innerCurrentSet.innerHTML = "세트: " + set;
                refreshSet(set);
                count = 0;
                innerCurrentCount.innerHTML = "횟수: " + count;
                refreshCount(count);
            }
        }
        state = "up";
    } else if (prediction[1].probability.toFixed(2) == 1.00) {
        state = "push";
    }

    for (let i = 0; i < maxPredictions; i++) {
        const classPrediction =
            prediction[i].className + ": " + prediction[i].probability.toFixed(2);
        labelContainer.childNodes[i].innerHTML = classPrediction;
    }

    // finally draw the poses
    drawPose(pose);
}

function drawPose(pose) {
    if (webcam.canvas) {
        ctx.drawImage(webcam.canvas, 0, 0);
        // draw the keypoints and skeleton
        if (pose) {
            const minPartConfidence = 0.5;
            tmPose.drawKeypoints(pose.keypoints, minPartConfidence, ctx);
            tmPose.drawSkeleton(pose.keypoints, minPartConfidence, ctx);
        }
    }
}



function enterEvent() {
    if (localStorage.getItem("target") === null) {
        hideCamAndDial();
    } else {
        alert("error");
    }
}

enterEvent();

//function for going to main

function toMain() {
    deleteLS();
    location.href = 'index.html';
}

// delete localStorage

function deleteLS() {
    const target = "target"
    localStorage.removeItem(target);
}

// hide settingTarget and show webcam and dial

function hideSettingTarget() {
    const cam = document.getElementById("camAndDial_tog");
    const set = document.getElementById("settingTarget_tog");
    cam.style.display = "block";
    set.style.display = "none";
}

function hideCamAndDial() {
    const cam = document.getElementById("camAndDial_tog");
    const set = document.getElementById("settingTarget_tog");
    cam.style.display = "none";
    set.style.display = "block";
}




//Dial logic
//
// Library
//

var Dial = function (container) {
    this.container = container;
    // this.size = this.container.dataset.size;
    this.size = 250;
    this.strokeWidth = this.size / 8;
    this.radius = (this.size / 2) - (this.strokeWidth / 2);
    this.value = this.container.dataset.value;
    this.direction = this.container.dataset.arrow;
    this.svg;
    this.defs;
    this.slice;
    this.overlay;
    this.text;
    this.arrow;
    this.create();
}

Dial.prototype.create = function () {
    this.createSvg();
    this.createDefs();
    this.createSlice();
    this.createOverlay();
    this.createText();
    this.createArrow();
    this.container.appendChild(this.svg);
};

Dial.prototype.createSvg = function () {
    var svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.setAttribute('width', this.size + 'px');
    svg.setAttribute('height', this.size + 'px');
    this.svg = svg;
};

Dial.prototype.createDefs = function () {
    var defs = document.createElementNS("http://www.w3.org/2000/svg", "defs");
    var linearGradient = document.createElementNS("http://www.w3.org/2000/svg", "linearGradient");
    linearGradient.setAttribute('id', 'gradient');
    var stop1 = document.createElementNS("http://www.w3.org/2000/svg", "stop");
    stop1.setAttribute('stop-color', '#6E4AE2');
    stop1.setAttribute('offset', '0%');
    linearGradient.appendChild(stop1);
    var stop2 = document.createElementNS("http://www.w3.org/2000/svg", "stop");
    stop2.setAttribute('stop-color', '#78F8EC');
    stop2.setAttribute('offset', '100%');
    linearGradient.appendChild(stop2);
    var linearGradientBackground = document.createElementNS("http://www.w3.org/2000/svg", "linearGradient");
    linearGradientBackground.setAttribute('id', 'gradient-background');
    var stop1 = document.createElementNS("http://www.w3.org/2000/svg", "stop");
    stop1.setAttribute('stop-color', 'rgba(0, 0, 0, 0.2)');
    stop1.setAttribute('offset', '0%');
    linearGradientBackground.appendChild(stop1);
    var stop2 = document.createElementNS("http://www.w3.org/2000/svg", "stop");
    stop2.setAttribute('stop-color', 'rgba(0, 0, 0, 0.05)');
    stop2.setAttribute('offset', '100%');
    linearGradientBackground.appendChild(stop2);
    defs.appendChild(linearGradient);
    defs.appendChild(linearGradientBackground);
    this.svg.appendChild(defs);
    this.defs = defs;
};

Dial.prototype.createSlice = function () {
    var slice = document.createElementNS("http://www.w3.org/2000/svg", "path");
    slice.setAttribute('fill', 'none');
    slice.setAttribute('stroke', 'url(#gradient)');
    slice.setAttribute('stroke-width', this.strokeWidth);
    slice.setAttribute('transform', 'translate(' + this.strokeWidth / 2 + ',' + this.strokeWidth / 2 + ')');
    slice.setAttribute('class', 'animate-draw');
    this.svg.appendChild(slice);
    this.slice = slice;
};

Dial.prototype.createOverlay = function () {
    var r = this.size - (this.size / 2) - this.strokeWidth / 2;
    var circle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
    circle.setAttribute('cx', this.size / 2);
    circle.setAttribute('cy', this.size / 2);
    circle.setAttribute('r', r);
    circle.setAttribute('fill', 'url(#gradient-background)');
    this.svg.appendChild(circle);
    this.overlay = circle;
};

Dial.prototype.createText = function () {
    var fontSize = this.size / 3.5;
    var text = document.createElementNS("http://www.w3.org/2000/svg", "text");
    text.setAttribute('x', (this.size / 2) + fontSize / 7.5);
    text.setAttribute('y', (this.size / 2) + fontSize / 4);
    text.setAttribute('font-family', 'Century Gothic, Lato');
    text.setAttribute('font-size', fontSize);
    text.setAttribute('fill', '#78F8EC');
    text.setAttribute('text-anchor', 'middle');
    var tspanSize = fontSize / 3;
    text.innerHTML = 0 + '<tspan font-size="' + tspanSize + '" dy="' + -tspanSize * 1.2 + '">%</tspan>';
    this.svg.appendChild(text);
    this.text = text;
};

Dial.prototype.createArrow = function () {
    var arrowSize = this.size / 10;
    var arrowYOffset, m;
    if (this.direction === 'up') {
        arrowYOffset = arrowSize / 2;
        m = -1;
    }
    else if (this.direction === 'down') {
        arrowYOffset = 0;
        m = 1;
    }
    var arrowPosX = ((this.size / 2) - arrowSize / 2);
    var arrowPosY = (this.size - this.size / 3) + arrowYOffset;
    var arrowDOffset = m * (arrowSize / 1.5);
    var arrow = document.createElementNS("http://www.w3.org/2000/svg", "path");
    arrow.setAttribute('d', 'M 0 0 ' + arrowSize + ' 0 ' + arrowSize / 2 + ' ' + arrowDOffset + ' 0 0 Z');
    arrow.setAttribute('fill', '#97F8F0');
    arrow.setAttribute('opacity', '0.6');
    arrow.setAttribute('transform', 'translate(' + arrowPosX + ',' + arrowPosY + ')');
    this.svg.appendChild(arrow);
    this.arrow = arrow;
};

Dial.prototype.animateStart = function () {
    var v = 0;
    var self = this;
    var intervalOne = setInterval(function () {
        var p = +(v / self.value).toFixed(2);
        var a = (p < 0.95) ? 2 - (2 * p) : 0.05;
        v += a;
        // Stop
        if (v >= +self.value) {
            v = self.value;
            clearInterval(intervalOne);
        }
        self.setValue(v);
    }, 1);
};

Dial.prototype.animateReset = function () {
    this.setValue(0);
};

Dial.prototype.polarToCartesian = function (centerX, centerY, radius, angleInDegrees) {
    var angleInRadians = (angleInDegrees - 90) * Math.PI / 180.0;
    return {
        x: centerX + (radius * Math.cos(angleInRadians)),
        y: centerY + (radius * Math.sin(angleInRadians))
    };
}

Dial.prototype.describeArc = function (x, y, radius, startAngle, endAngle) {
    var start = this.polarToCartesian(x, y, radius, endAngle);
    var end = this.polarToCartesian(x, y, radius, startAngle);
    var largeArcFlag = endAngle - startAngle <= 180 ? "0" : "1";
    var d = [
        "M", start.x, start.y,
        "A", radius, radius, 0, largeArcFlag, 0, end.x, end.y
    ].join(" ");
    return d;
}

Dial.prototype.setValue = function (value) {
    var c = (value / 100) * 360;
    if (c === 360)
        c = 359.99;
    var xy = this.size / 2 - this.strokeWidth / 2;
    var d = this.describeArc(xy, xy, xy, 180, 180 + c);
    this.slice.setAttribute('d', d);
    var tspanSize = (this.size / 3.5) / 3;
    this.text.innerHTML = Math.floor(value) + '<tspan font-size="' + tspanSize + '" dy="' + -tspanSize * 1.2 + '">%</tspan>';
};

//
// Usage
//

// count
var containers = document.getElementsByClassName("dialCount");
var dial = new Dial(containers[0]);
function refreshCount(c) {
    let targetCount = LSCount;
    let tmCountIndex = c; //current count
    let countIndex = tmCountIndex / targetCount;
    countIndex = countIndex * 100;
    dial.value = Math.round(countIndex);
    dial.animateStart();
}

// set
var containers = document.getElementsByClassName("dialSet");
var dial = new Dial(containers[0]);
function refreshSet(s) {
    let targetSet = LSSet;
    let tmSetIndex = s; //current set
    let setIndex = tmSetIndex / targetSet;
    setIndex = setIndex * 100;
    dial.value = Math.round(setIndex);
    dial.animateStart();
}

function refreshSetFirst(s) {
    state = "up"
    count = 0;
    set = 1;
    let targetSet = localStorage.getItem("set");
    let tmSetIndex = s; //current set
    targetSet = Number(targetSet);
    let setIndex = tmSetIndex / targetSet;
    setIndex = setIndex * 100;
    dial.value = Math.round(setIndex);
    dial.animateStart();
}

function alertSetInitialization() {
    alert("현재까지 기록됐던 횟수가 초기화됩니다.");
}

function soundMan(i) {
    if (i % 10 == 0) {
        let audio = new Audio('sound/bright_man/bright_M_' + i + '.mp3');
        audio.play();
    } else {
        let audio = new Audio('sound/bright_man/bright_M_' + i % 10 + '.mp3');
        audio.play();
    }
}

function soundWoman(i) {
    if (i % 10 == 0) {
        let audio = new Audio('sound/bright_woman/bright_W_' + i + '.mp3');
        audio.play();
    } else {
        let audio = new Audio('sound/bright_woman/bright_W_' + i % 10 + '.mp3');
        audio.play();
    }
}

function soundSetEnd() {
    let audio = new Audio('sound/set_end_sound.mp3');
    audio.play();
}

function checkedSwitch() {
    const voice = 'voice';
    const checkedMan = document.getElementById('switch-woman').checked;
    const checkedWoman = document.getElementById('switch-man').checked;
    if (checkedMan == true) {
        localStorage.setItem(voice, 'm');
        console.log("남");
    } else if (checkedWoman == true) {
        localStorage.setItem(voice, 'w');
        console.log("여");
    }
}

function selectedVoice(k) {
    const voice = 'voice';
    const gen = localStorage.getItem(voice);
    if (gen == "m") {
        soundMan(k);
    } else if (gen == "w") {
        soundWoman(k);
    }
}




