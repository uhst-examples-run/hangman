const screenWidth = 1000;
const screenHeight = 600;
let playerName;
let userNamed;
let titleScreen, playScreen;
let socket = io.connect('http://' + document.domain + ':' + location.port);

function setup() {
  const canvas = createCanvas(screenWidth,screenHeight);
  // Sets text stroke colour to white
  stroke(255);
  // Sets text fill colour to white
  fill(255);
  // Put the canvas inside the #sketch-holder div
  canvas.parent('sketch-holder');

  titleScreen = true;
  playScreen = false;
  userNamed = false;
  playerName = "";
}

function draw() {
  // Repeatedly updates the screen
  clear();
  // Displays player's name (just for testing)
  if (titleScreen) {
  	textSize(80);
  	textAlign(CENTER);
  	text("HANGMAN",screenWidth/2,screenHeight/4);
  	textSize(30);
  	textAlign(LEFT);
  	text("Name: " + playerName,200,250);
  }
}

function keyPressed() {
  if (!userNamed) {
  	if (keyCode==BACKSPACE && playerName.length>0) {
  		// Cuts off last letter in the player's name
  		playerName = playerName.substring(0,playerName.length-1);
  	} else if (keyCode!=ENTER && playerName.length<30) {
  		// Concatenates the typed letter to the player's name in lowercase
  		if (keyIsDown(SHIFT)) {
  			playerName += key;
  		} else {
  			playerName += key.toLowerCase();
  		}
  	} else if (keyCode==ENTER) {
  		// Stops the naming process
  		userNamed = true;
  	}
  }
}

function mousePressed() {

}



$('#reset').click(function() {
  socket.emit('Reset');
});

$('#become-chooser').click(function() {
  socket.emit('Become Chooser');
});

$('#become-guesser').click(function() {
  socket.emit('Become Guesser');
});


socket.on('connect', function() {
  socket.emit('connection', {data: 'I\'m connected!'});
});
