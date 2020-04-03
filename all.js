var can = document.getElementById("canvas");
var c = can.getContext('2d');

var ngame = {
	text: 'Начать игру',
	w: 85,
	h: 40,
	x: 150,
	y: 180,
	state: 'default',
	draw: function(){
		c.font = '50px AnotherCastle3';
		switch(this.state){
			case 'over':
			c.fillStyle = "#757EC8";
			c.fillText(this.text, this.x+this.w/2-c.measureText(this.text+'?').width/2,this.y+this.h/2+10);
			break;
			default:
			c.fillStyle = "white";
			c.fillText(this.text, this.x+this.w/2-c.measureText(this.text).width/2,this.y+this.h/2+10);
			break;
			}
		}
	};

var readmeimg = {
	text: 'Суть дела',
	w: 75,
	h: 50,
	x: 350,
	y: 250,
	state: 'default',
	draw: function(){
		c.font = '50px AnotherCastle3';
		switch(this.state){
			case 'over':
			c.fillStyle = "#757EC8";
			c.fillText(this.text, this.x+this.w/2-c.measureText(this.text+'?').width/2,this.y+this.h/2+10);
			break;
			default:
			c.fillStyle = "white";
			c.fillText(this.text, this.x+this.w/2-c.measureText(this.text).width/2,this.y+this.h/2+10);
			break;
			}
		}
	};

player.width = 46;
player.height = 46;

var ship_img;
var bomb_image;
var bullet_image;
var logo_img;
var info_img;

loadResources();

function loadResources() {
    ship_img = new Image();
    ship_img.src = "sous/hunter1.png";
    
    bomb_image = new Image();
    bomb_image.src = "sous/bomb.png";
    
    bullet_image = new Image();
    bullet_image.src = "sous/bullets.png";

	logo_img = new Image();
	logo_img.src = "sous/logo.png";

	info_img = new Image();
	info_img.src = "sous/readmepic.png";
    
}

// =========== для меню и старта ===============

function memenu(c){
	if (menu.counter == 0) { 
		return };

	var c = can.getContext('2d');
	drawBackground(c);

	c.drawImage(logo_img, 0, 0);
	ngame.draw();
	readmeimg.draw();

	can.addEventListener('mousedown', function(e){
		if(ti4omish(e.offsetX, e.offsetY, ngame)) {
		StartG(); }
		if(ti4omish(e.offsetX, e.offsetY, readmeimg) && menu.counter != 0) { menu.counter = 88; }
		}, false);

	if (menu.counter == 88) {
		c.drawImage (info_img, 0, 0);
		return;}

	can.addEventListener("mousemove", function(e){
		ngame.state = ti4omish(e.offsetX, e.offsetY, ngame) ? "over" : "default";
		readmeimg.state = ti4omish(e.offsetX, e.offsetY, readmeimg) ? "over" : "default";
	}, false);
}

function StartG() {
	if(menu.counter == 0) return;
	menu.counter = 0;

	playerBullets = [];
	enemyBullets = [];

	game.state = "start";
	player.state = "alive";
	overlay1.counter = -1;

	setInterval(mainLoop,1000/30);
}

function ti4omish(x, y, obj) {
	return x >= obj.x && x <= obj.x + obj.w && y >= obj.y && y <= obj.y + obj.h;
}

function WithMenu() {
	updateGame();
	memenu();
}

// =========== рисовалыч ===============

function mainLoop() {
	var c = can.getContext('2d');

	updateGame();
	updateBackground();
	updateEnemies();
	
	if(game.state == "playing") {
	updatePlayer();
	
	updatePlayerBullets();
	updateEnemyBullets();

	checkCollisions();
	
	drawBackground(c);
	drawEnemies(c);
	drawPlayer(c);
	drawInterf(c);
	drawEnemyBullets(c);
	drawPlayerBullets(c); }
	drawOverlay(c);
}


// =========== игрок ============

function firePlayerBullet() {
	//create a new bullet
	playerBullets.push({
		x: player.x+14,
		y: player.y - 5,
		width:20,
		height:20,
		counter:0,
	});
}

function drawPlayer(c) {
    if(player.state == "dead") return;
    
    if(player.state == "hit") {
        drawPlayerExplosion(c);
    	    return;
	}
	c.drawImage(ship_img, 
	    25,1, 23,23, //src coords
	    player.x, player.y, player.width, player.height //dst coords
	    );
}

var particles = [];
function drawPlayerExplosion(c) {
    //start
    if(player.counter == 0) {
        particles = []; //clear any old values
        for(var i = 0; i<50; i++) {
            particles.push({
                    x: player.x + player.width/2,
                    y: player.y + player.height/2,
                    xv: (Math.random()-0.5)*2.0*5.0,  // x velocity
                    yv: (Math.random()-0.5)*2.0*5.0,  // y velocity
                    age: 0,
            });
        }
    }
    
    //update and draw
    if(player.counter > 0) {
        for(var i=0; i<particles.length; i++) {
            var p = particles[i];
            p.x += p.xv;
            p.y += p.yv;
            var v = 255-p.age*3;
            c.fillStyle = "rgb("+v+","+v+","+v+")";
            c.fillRect(p.x,p.y,3,3);
            p.age++;
        }
    }
};

function drawPlayerBullets(c) {
	c.fillStyle = "blue";
	for(i in playerBullets) {
		var bullet = playerBullets[i];
		var count = Math.floor(bullet.counter/4);
		var xoff = (count%4)*24;
		
		//c.fillRect(bullet.x, bullet.y, bullet.width,bullet.height);
		c.drawImage(
		    bullet_image,
		    xoff+10,0+9,8,8,//src
		    bullet.x,bullet.y,bullet.width,bullet.height//dst
		    );
	}
}


// =========== фон ============

function drawBackground(c) {
	c.fillStyle = "black";
	c.fillRect(0,0,can.width,can.height);
}


// =========== вороги ===============

function drawEnemies(c) {
    for(var i in enemies) {
        var enemy = enemies[i];
        if(enemy.state == "alive") {
            c.fillStyle = "green";
            drawEnemy(c,enemy,15);
        }
        if(enemy.state == "hit") {
            c.fillStyle = "purple";
            enemy.shrink--;
            drawEnemy(c,enemy,enemy.shrink);
	player.scoreP = player.scoreP + 10;
        }
        //this probably won't ever be called.
        if(enemy.state == "dead") {    
	c.fillStyle = "black";
            c.drawEnemy(c,enemy,15);
        }
    }
}

function drawEnemy(c,enemy,radius) {
    if(radius <=0) radius = 1;
    var theta = enemy.counter;        
    c.save();
    c.translate(0,60);
    //draw the background circle
    circlePath(c, enemy.x, enemy.y, radius*2);
    c.fill();
    //draw the wavy dots
    for(var i=0; i<10; i++) {
        var xoff = Math.sin(toRadians(theta+i*36*2))*radius;
        var yoff = Math.sin(toRadians(theta+i*36*1.5))*radius;
        circlePath(c, enemy.x + xoff, enemy.y + yoff, 3);
        c.fillStyle = "white";
        c.fill();
    }
    c.restore();
}
function toRadians(d) {
    return d * Math.PI * 2.0 / 360.0;
}
function circlePath(c, x, y, r) {
    c.beginPath();
    c.moveTo(x,y);
    c.arc(x,y, r, 0, Math.PI*2);    
}


function createEnemyBullet(enemy) {
    return {
        x:enemy.x,
        y:enemy.y+enemy.height,
        width:30,
        height:30,
        counter:0,
    }
}

function drawEnemyBullets(c) {
    for(var i in enemyBullets) {
        var bullet = enemyBullets[i];
        var xoff = (bullet.counter%9)*12 + 1;
        var yoff = 1;
        c.drawImage(bomb_image,
            xoff,yoff,11,11,//src
            bullet.x,bullet.y,bullet.width,bullet.height//dest
            );
    }
}


// =========== overlay для игры ===============

function drawInterf(c) {
if(overlayGA.counter == 1) {
   	c.fillStyle = "white";
	c.font = "18pt AnotherCastle3";
	c.fillText(overlayGA.subtitle1 + player.scoreP, 100, 30);
	c.fillText(overlayGA.subtitle2, 250, 30); } }

// =========== overlay после окончания игры ===============

function drawOverlay(c) {
    if(overlay1.counter == -1) return;
    
    // плавное появление текста
    var alpha = overlay1.counter/50.0;
    if(alpha > 1) alpha = 1;
    c.globalAlpha = alpha;
    
    c.save();
    c.fillStyle = "white";
    c.font = "Bold 40pt AnotherCastle3";
    c.fillText(overlay1.title, 30, 200);
    c.font = "14pt AnotherCastle3";
    c.fillText(overlay1.subtitle, 100, 250);
    c.restore();
}

doSetup();
setInterval(WithMenu,1000/30);