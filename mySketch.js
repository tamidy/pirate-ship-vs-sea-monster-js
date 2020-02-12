/* Disclaimer: This game was made for educational purposes. 

References: 
https://www.openprocessing.org/sketch/626042
https://www.openprocessing.org/sketch/637500

Music: 
The Seven Seas by Brandon Fiechter (https://www.youtube.com/watch?v=ke8mhtFFtLw)

Sound Effects: 
Gaming Sound FX 
(https://www.youtube.com/watch?v=KUOfNtoJyLw)
(https://www.youtube.com/watch?v=CQeezCdF4mk)
Sound effect GAMING 
(https://www.youtube.com/watch?v=Fgh1dqZS0oQ)


Images: 
https://en.wikipedia.org/wiki/Jolly_Roger#/media/File:Pirate_Flag.svg
https://webstockreview.net/pict/getfirst
http://dnrc.mt.gov/divisions/water/operations/images/floodplain/Fire_Icon.png/image_view_fullscreen
*/

let cenX, cenY; //center of the screen
let monX, monY; //position of the monster 
let monster, player; //monster and player object variables

let cannons = [];	//array of cannon ball objects 
let strikeTimer = 10;	//timing the monster's attacks

let theta = 0; //angle of the wave, keeps changing with every iteration
let waveYs = []; //y values of the wave 
let counters = []; //counters for each of the 6 clouds 
let starX = [];	//x positions of the stars
let starY = [];	//y positions of the stars
let starSize = []; //sizes of the stars 
let starOp = []; //opacities of the stars 
let starNum = 100; //# of stars

let running = false; //boolean to signify whether the game is still going
let titleBool = true; //boolean to signify whether the game hasn't started yet 
let gameOverBool = false; //boolean to signify whether the game is over 
let winBool = false; //boolean to signify if the player won or lost 
let creditsBool = false;
let start, restart, creditsButton; //Start, restart, credits button variables

function preload() { //Importing images and sounds 
	skull = loadImage('images/skull.png');
	cannon = loadImage('images/cannon.png');
	fire = loadImage('images/fire.png');
	song = loadSound('sounds/piratesong.mp3');
	tada = loadSound('sounds/tada.mp3');
	splat = loadSound('sounds/splat.mp3');
	lose = loadSound('sounds/sadtrombone.mp3');
}

function setup() {
	createCanvas(windowWidth, windowHeight);
	background(143, 243, 255); //sky blue color
	textAlign(CENTER);
	cenX = windowWidth/2;
	cenY = windowHeight/2;
	
	//Instantiating the monster object with the proper position 
	monX = windowWidth/3;
	monY = (windowHeight*2)/3-25;
	monster = new MonsterObject(monX, monY);
	
	//Instantiating the user object with its images and position 
	player = new PlayerObject(skull, cannon, (windowWidth*2)/3, (windowHeight*2)/3);
	
	//Initializing the counters at the clouds' starting points
	counters[0] = windowWidth; 
	counters[1] = cenX;
	counters[2] = 0;	
	counters[3] = (cenX*3)/2;
	counters[4] = cenX/2;
	counters[5] = -cenX/2;
	
	//Resizing images 
	skull.resize(50, 0);
	cannon.resize(120, 0);
	fire.resize(100, 0);
	
	//Setting up the stars 
	for (let i=0; i<starNum; i++) {
		starX[i] = random(windowWidth); 
		starY[i] = random(windowHeight);
		starSize[i] = random(1, 10);
		starOp[i] = random(255);
	}
	
	//Slider - value must be between 0-300 because of the colors from day to night 
	slider = createSlider(0, 300, 0);
	slider.position(cenX-150, windowHeight-50);
	slider.size(300, 10);
	
	//Start and Restart buttons
	start = createButton("Start");
	start.position(cenX-50, 250);
	start.size(90, 50);
	start.mousePressed(startGame);

	restart = createButton("Restart");
	restart.hide(); //Hiding the button 
	restart.position(cenX-50, 250);
	restart.size(90, 50);
	restart.mousePressed(restartGame);	
	
	creditsButton = createButton("Credits");
	creditsButton.hide();
	creditsButton.position(windowWidth-150, windowHeight-150);
	creditsButton.size(90, 50);
	creditsButton.mousePressed(showCredits);	
	
} //end setup 

function draw() {
	//Changes from sky blue to black depending on the value of the slider
	background(143-slider.value(), 243-slider.value(), 255-slider.value());

	//Stars 
	for (let j=0; j<starNum; j++) {
		noStroke();
		fill(255, slider.value()-starOp[j]); //Opacity of the stars depends on the random value and the value of the slider 
		ellipse(starX[j], starY[j], starSize[j], starSize[j]); 
	}	
	
	//Clouds
	for (let i=0; i<6; i++) {
		
		//Making the clouds move over time 
		counters[i] += 0.8; 
		
		if (counters[i]>windowWidth+(cenX/2)) { 
			
			//Once they reach a certain point they start back at the left
			counters[i] = -cenX/2; 
		}
		
		let tempY;		
		if (i>=0 && i<3) {
			tempY = cenY/2; 
		} else {
			tempY = (cenY*3)/2;
		}
		cloud(counters[i], tempY);
	}
	
	//Showing the sun, moon, and player 
	sunMoon();	
	player.show();
	
	//Showing the monster
	if (slider.value() < 150) {
		monster.show(10, 232, 60); //Daytime color
	}	else {
		monster.show(0, 126, 65); //Nighttime color 
	}
	monster.updatePupil();
	
	//Showing the wave 
	wave();
	
	//Health Bars
	noStroke();
	//Monster
	fill(slider.value());
	rect(cenX/2-255, 15, 510, 30);
	if (monster.health > 0) {
		fill(144);
		rect(cenX/2-250, 20, monster.health/2, 20); 
	}
	//Player 
	fill(slider.value());
	rect((windowWidth*3)/4-255, 15, 510, 30);
	if (player.health > 0) {
		fill(144);
		rect(((windowWidth*3)/4)-(player.health/2-250), 20, player.health/2, 20);
	}	
	
	//If the game is going, then the user and monster can attack 
	if (running) {
		
		//Cannons - drawing, moving, and stopping them 
		for (let i=0; i<cannons.length; i++) {
			cannons[i].show();
			cannons[i].move();
			
			//If the cannon ball has reached the monster 
			if (cannons[i].X <= monX) {
				//then the cannon ball disappears and the monster gets hit 
				cannons.splice(0, 1); //Replacing cannon[0] with 1
				monster.hit(fire);
			}
		}
		
		//Times when the monster strikes the user 
		strikeTimer += 1;
		if (strikeTimer%2000 >= 0 && strikeTimer%100 <= 5) {
			//Monster attacks and the player gets hit 
			monster.attack();
			player.hit(fire);
		}
		
		//When the monster is defeated 
		if (monster.health <= 0) {
			monster.sink(tada);
			song.stop();
			strikeTimer = 0;
			running = false;
			gameOverBool = true;
			winBool = true;
		}

		//When the player is defeated
		if (player.health <= 0) {
			player.sink(lose);
			song.stop();
			strikeTimer = 0;
			running = false;
			gameOverBool = true;
			winBool = false;
		}
		
	} else { //The game is not running 
		
		//Game hasn't started 
		if (titleBool) {
			titleScreen();
		}
		//Game over 
		if (gameOverBool) {
			
			if (creditsBool) {
				credits();
			} else {
				resultsScreen();
			}
		}
	}
	
} //end draw 

function mousePressed() {	//Shooting a cannon ball, with the starting point 
	cannons.push(new CannonBallObject((windowWidth*2)/3-30, (windowHeight*2)/3-60));
	
	//Adding a sound effect to the cannon ball if the game is running 
	if (running) {
		splat.play();
	}
}

function wave() {	
	noStroke();
	let amp = 10; //amplitude of the wave 
	let period = 300; //period of the wave 
	let waveX = TWO_PI/period; //x value of the wave, TWO_PI - built-in constant
	
	//3 waves 
	for (let i=0; i<2; i++) {
		theta += 0.02; //increasing the angle 
		let x = theta; //temporary value
		
		//Drawing across the entire window
		for (let j=0; j<windowWidth; j++) {
			waveYs[j] = sin(x) * amp; //setting up the y values with the sin() function and the amplitude
			x += waveX; //incrementing the x value 
		}
		
		//Color of the wave changes depending on the value of the slider
		stroke(0, 74-(slider.value()/2), 255-(slider.value()/2));
		for (let k=0; k<windowWidth; k++) {
			line(k, waveYs[k]+(((windowHeight*2)/3)+90), k, windowHeight);
		}
	}
}

function sunMoon() {
	let sunX=150, sunY=150; //position of the sun
	let moonX=150, moonY=150; //position of the moon
	
	noStroke();	
	
	//As the sun sets, the moon rises, and vice versa
	
	//Temporary Y values 
	let sY = sunY+(slider.value()*((slider.value()/90)%windowHeight));
	let mY = 8*(moonY-slider.value())+(windowHeight+slider.value());
	
	if (sY>=windowHeight+sunY) {
		sY = windowHeight+sunY;
	}
	if (mY<=moonY) {
		mY = moonY; 
	}
	
	//Sun 
	fill(255, 233, 60);
	ellipse(sunX, sY, 150, 150);
	//Moon
	fill(194, 236, 255);
	ellipse(moonX, mY, 150, 150);
}

function cloud(x, y) {
	noStroke();
	fill(255-slider.value()+150); //Color changes from white to grey depending on the value of the slider 
	ellipse(x, y, 65, 65);
	ellipse(x-60, y, 65, 65);
	ellipse(x+60, y, 65, 65);
	ellipse(x+30, y-30, 65, 65);
	ellipse(x-30, y-30, 65, 65);
	ellipse(x-30, y+30, 65, 65);
	ellipse(x+30, y+30, 65, 65);
	ellipse(x, y-50, 30, 30);
	ellipse(x, y+50, 30, 30);
	ellipse(x-60, y-30, 30, 30);
	ellipse(x+60, y+30, 30, 30);	
}

function startGame() {
	running = true;
	titleBool = false;
	song.loop(); //Playing the song in a loop
	start.hide();
}

function titleScreen() {
	//Welcome message
	fill(slider.value());
	noStroke();
	textSize(60);
	textFont('Fantasy');
	text("Ahoy Matey!", cenX, 150);
	textSize(20);
	text("Press the mouse to destroy the sea monster!", cenX, 200);
}

function restartGame() {
	restart.hide();
	creditsButton.hide();
	
	running = true;
	winBool = false;
	gameOverBool = false;
	song.loop();
	player.restart();
	monster.restart();
}

function resultsScreen() {
	slider.show();
	
	//Displaying the appropriate message
	fill(slider.value()); //Color of the text depends on the value of the slider 
	textSize(60);
	textFont('Fantasy');
	
	if (winBool) {
		//Win message 
		text("You Win!", cenX, 150);
	} else {
		//Lose message 
		text("You Lose!", cenX, 150);
	}

	//Allowing the player to play again
	restart.show();
	
	//Allowing the player to view the credits
	creditsButton.show();
}

function showCredits() {
	creditsBool = !creditsBool; 
}

function credits() {
	restart.hide();
	slider.hide();
	background(143, 243, 255);
	
	//Credits 
	let top = cenY/4;
	
	fill(0);
	noStroke();
	textFont('Georgia');
	textSize(20);
	text("Credits", cenX, top);

	textSize(15);
	text("This game was made for educational purposes.", cenX, top+50);

	text("References:", cenX, top+100);
	text("https://www.openprocessing.org/sketch/626042", cenX, top+125);
	text("https://www.openprocessing.org/sketch/637500", cenX, top+150);
	
	text("Music:", cenX, top+200);
	text("The Seven Seas by Brandon Fiechter", cenX, top+225);
	
	text("Sound Effects:", cenX, top+275);
	text("Gaming Sound FX", cenX, top+300);
	text("youtube.com/watch?v=KUOfNtoJyLw", cenX, top+325);
	text("youtube.com/watch?v=CQeezCdF4mk", cenX, top+350);
	text("Sound effect GAMING", cenX, top+375);
	text("youtube.com/watch?v=KUOfNtoJyLw", cenX, top+400);
	
	text("Images:", cenX, top+450);
	text("wikipedia.org/wiki/Jolly_Roger#/media/File:Pirate_Flag.svg", cenX, top+475);
	text("https://webstockreview.net/pict/getfirst", cenX, top+500);
	text("dnrc.mt.gov/divisions/water/operations/images/floodplain/Fire_Icon.png", cenX, top+525);
}

class PlayerObject {
	constructor(skullImage, cannonImage, X, Y) {
		this.skullImg = skullImage;
		this.cannonImg = cannonImage;
		this.X = X;
		this.Y = Y;
		this.copyX = X; 
		this.copyY = Y;
		this.health = 1000;
	}
	
	show() {
		//Base
		noStroke();
		fill(87, 34, 0);
		beginShape();
		vertex(this.X, this.Y);
		bezierVertex(this.X, this.Y, this.X+150, this.Y+250, this.X+300, this.Y);
		vertex(this.X+300, this.Y);
		endShape();

		//Mast
		stroke(0);
		strokeWeight(5);
		line(this.X+150, this.Y, this.X+150, this.Y-300);

		//Sails
		fill(255);
		beginShape();
		vertex(this.X+150, this.Y-50);
		bezierVertex(this.X+150, this.Y-50, this.X-60, this.Y-150, this.X+150, this.Y-250);
		bezierVertex(this.X+150, this.Y-250, this.X+90, this.Y-150, this.X+150, this.Y-50);
		vertex(this.X+150, this.Y-250);
		endShape();

		beginShape();
		vertex(this.X+150, this.Y-50);
		bezierVertex(this.X+150, this.Y-50, this.X+30, this.Y-150, this.X+150, this.Y-250);
		bezierVertex(this.X+150, this.Y-250, this.X+120, this.Y-150, this.X+150, this.Y-50);
		vertex(this.X+150, this.Y-250);
		endShape();

		//Flag 
		fill(0);
		rect(this.X+150, this.Y-300, 70, 50);
		image(this.skullImg, this.X+160, this.Y-300);

		//Cannon 
		image(this.cannonImg, this.X-30, this.Y-70);
	}
	
	hit(fireImg) { //When the user gets hit 
		this.health -= random(0, 10);
		image(fireImg, this.X+100, this.Y-100);
	}
	
	sink(loseSound) { //When the user dies
		this.Y += 200;
		
		//Playing the victory sound
		loseSound.playMode('untilDone');
		loseSound.play();
	} 
	
	restart() { //Resetting the health level and positions
		this.health = 1000;
		this.X = this.copyX; 
		this.Y = this.copyY;
	}
}

class MonsterObject {
	constructor(X, Y) {
		this.X = X; 
		this.Y = Y; 
		this.eyeX = X;
		this.eyeY = Y;
		this.copyX = X;
		this.copyY = Y;
		this.health = 1000;
		this.r = 0;
		this.g = 0; 
		this.b = 0;
	}
	
	show(r, g, b) { //Drawing the monster 
		this.r = r; 
		this.g = g; 
		this.b = b;
		noStroke();
		fill(this.r, this.g, this.b);
		ellipse(this.X, this.Y, 250, 250);
		triangle(this.X-400, this.Y+400, this.X, this.Y-50, this.X+400, this.Y+400);
		fill(255);
		ellipse(this.X, this.Y, 200, 200);
		
		fill(0);
		ellipse(this.eyeX, this.eyeY, 100, 100);
	}
	
	updatePupil() { //Updating the pupil's position based on the mouse position 
		this.eyeX = (this.X-30) + mouseX * 30/windowHeight;
		this.eyeY = (this.Y-30) + mouseY * 30/windowHeight;
	}
	
	hit(fireImg) { //When the monster gets hit 
		this.health -= random(0, 10);
		image(fireImg, this.X-50, this.Y-100);
	}
	
	sink(tadaSound) { //When the monster dies
		this.Y += 200;
		
		//Playing the victory sound
		tadaSound.playMode('untilDone');
		tadaSound.play();
	} 
	
	attack() { //When the monster attacks 
		noStroke();
		fill(this.r, this.g, this.b);
		triangle(this.X+100, this.Y+75, this.X+300, this.Y+25, player.X, player.Y);
	}
	
	restart() { //Resets the health level and positions
		this.health = 1000;
		this.X = this.copyX; 
		this.Y = this.copyY;
	}
}

class CannonBallObject {
	constructor(X, Y) {
		this.X = X;
		this.Y = Y;
	}
	
	//Drawing the cannon ball
	show() {
		noStroke();
		fill(slider.value()-150); //Color of the cannon ball depends on the value of the slider 
		ellipse(this.X, this.Y, 25, 25);
	}
	
	//Changing the x position over time
	move() {
		this.X -= 10;
	}
}