let video;
let yolo;
let status;
let objects = [];
let myFont;
let word = [];
let targetWord = "";
let score = 0;
let speech;
let gameRunning = false;
let timeoutID;
let output;

function preload() {
  myFont=loadFont('Roboto-Medium.ttf');
}

function setup() {
  createCanvas(640, 480);
  video = createCapture(VIDEO);
  video.size(width, height);

  let options = { filterBoxesThreshold: 0.01, IOUThreshold: 0.4, classProbThreshold: 0.4 }
  // Create a YOLO method
  yolo = ml5.YOLO(video, options, startDetecting);

  // Hide the original video
  video.hide();
  status = select('#status');

  speechRec = new p5.SpeechRec('en-US', gotSpeech);
  let continuous = false;  // Change to false
  let interimResults = false;
  speechRec.start(continuous, interimResults);

  speech = new p5.Speech();
  speech.setRate(0.85);
  speech.setPitch(0.8);
  
  output = select('#speech');
  
}

function draw() {
  image(video, 0, 0, width, height);
  
  for (let i = 0; i < objects.length; i++) {
    if(objects[i].label == targetWord) {
      noStroke();
      fill(0, 255, 0);
      textSize(18);
      textFont(myFont);
      text(objects[i].label + " " + nfc(objects[i].confidence * 100.0, 2) + "%", objects[i].x * width, objects[i].y * height - 5);
      noFill();
      strokeWeight(4);
      stroke(0, 255, 0);
      rect(objects[i].x * width, objects[i].y * height, objects[i].w * width, objects[i].h * height);
    }
  }

  if (!gameRunning && objects.length > 0) {
    targetWord = objects[Math.floor(Math.random() * objects.length)].label;
    score = 0;
    gameRunning = true;
    speech.speak("Let's play a game! Say the word when it appears on the screen.");
  }

  if (gameRunning) {
    fill(0, 255, 0);
    textSize(20);
    text(targetWord, width/2, height/2);
    text("Score: " + score, width - 300, 50);

    if (score >= 100) {
      speech.speak("SUCCESS!");
      gameRunning = false;
      timeoutID = setTimeout(startDetecting, 5000);  // restart the game after 5 seconds
    }
  }
}

function startDetecting() {
  status.html('Model loaded!');
  clearTimeout(timeoutID);
  detect();
}

function detect() {
  yolo.detect(function(err, results) {
    objects = results;
    detect();
  });
}

function gotSpeech() {
  console.log(speechRec);
  if (speechRec.resultValue) {
    let said = speechRec.resultString.toLowerCase().trim();  // Convert to lowercase and remove leading/trailing whitespaces
    output.html(said);
    if (gameRunning && said == targetWord.toLowerCase()) {  // Convert targetWord to lowercase
      score += 10;
      if (score < 100) {
        // Select a new word
        targetWord = objects[Math.floor(Math.random() * objects.length)].label;
      }
    } else {
      speech.speak("Wrong word. Try again!");
    }
  }
}

// Add a new function for key press
function keyPressed() {
  if (keyCode === ENTER) {
    speechRec.start();
  }
}

// Add a new function for key release
function keyReleased() {
  if (keyCode === ENTER) {
    speechRec.stop();
  }
}