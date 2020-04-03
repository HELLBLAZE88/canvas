var game = {
    state: "start",
};

var menu = {
	counter: 9,
};

var overlayGA = {
    counter: 1,
    subtitle1: "Очки: ",
    subtitle2: "Пауза: N",
};

var overlay1 = {
    counter: -1,
    title: "foo",
    subtitle: "bar",
};

var player = {
	x:100,
	y:350,
	width: 20,
	height: 50,
	counter: 0,
	scoreP: 0,
};
var keyboard = { };

var playerBullets = [];
var enemies = [];
var enemyBullets = [];

// =========== игорь  ============
function updateGame() {
    if(game.state == "playing" && enemies.length == 0) {
        game.state = "won";
        overlay1.title = "Вторженцы побеждены!";
        overlay1.subtitle = 'Нажмите "Пробел" для повторения игры';
        overlay1.counter = 0;
	overlayGA.counter = 0;
    }
    if(game.state == "over" && keyboard[32]) {
        game.state = "start";
        player.state = "alive";
        overlay1.counter = -1;
	overlayGA.counter = 1;
    }
    if(game.state == "won" && keyboard[32]) {
        game.state = "start";
        player.state = "alive";
        overlay1.counter = -1;
	overlayGA.counter = 1;
    }

	if (game.state == "playing" && keyboard[78]) {
		game.state = "pause";
		overlayGA.counter = 0;
	c.fillStyle = "white";
	c.font = "Bold 36pt AnotherCastle3";
	c.fillText("А обед по расписанию!", 30, 200);
	c.font = "20pt AnotherCastle3";
	c.fillText("Чтобы продолжить нажмите V", 100, 250);
	c.fillText("Чтобы выйти в меню нажмите C", 100, 300);
		keyboard[78] == false;
		}
	if (game.state == "pause" && keyboard[86]) {
		game.state = "playing";
		overlayGA.counter = 1;
		keyboard[86] == false;}
	if (game.state == "pause" && keyboard[67]) {
		game.state = "menu";
		menu.counter = 9;}
	if (menu.counter == 88 && keyboard[67]) {
		game.state = "menu";
		menu.counter = 9;}
    
    if(overlay1.counter >= 0) {
        overlay1.counter++;
    }
    
}
function updatePlayer() {
    if(player.state == "dead") return;
    
    //левая стрелочка
	if(keyboard[37])  { 
	    player.x -= 5; 
	    if(player.x < 0) player.x = 0;
	}	
	//правая стрелочка
	if(keyboard[39]) { 
	    player.x += 5;	
	    var right = canvas.width - player.width;
	    if(player.x > right) player.x = right;
	}	
	
	//пробел
	if(keyboard[32]) {
		if(!keyboard.fired) { 
			firePlayerBullet(); 
			keyboard.fired = true;
		}
	} else {
		keyboard.fired = false;
	}
	
	if(player.state == "hit") {
	    player.counter++;
	    if(player.counter >= 40) {
	        player.counter = 0;
	        player.state = "dead";
	        game.state = "over";
	        overlay1.title = "Игра окончена";
	        overlay1.subtitle = 'Нажмите "Пробел" для того, чтобы начать сначала';
	        overlay1.counter = 0;
		overlayGA.counter = 1;
	    }
	}
}


function updatePlayerBullets() {
	//move each bullet
	for(i in playerBullets) {
		var bullet = playerBullets[i];
		bullet.y -= 8;
		bullet.counter++;
	}
	//remove the ones that are off the screen
	playerBullets = playerBullets.filter(function(bullet){
		return bullet.y > 0;
	});
}

function updateBackground() {
}

// ============== вороги =============
function updateEnemies() {
    
    //создание десяти ворогов
    if(game.state == "start") {
        enemies = [];
        enemyBullets = [];
        for(var i=0; i<10; i++) {
            enemies.push({
                    x: 50+ i*50,
                    y: 10,
                    width: 40,
                    height: 40,
                    state: "alive", // the starting state of enemies
                    counter: 0, // a counter to use when calculating effects in each state
                    phase: Math.floor(Math.random()*50), //make the enemies not be identical
                    shrink: 20,
            });
        }
        game.state = "playing";
    }
    
    
    //for each enemy
    for(var i=0; i<10; i++) {
        var enemy = enemies[i];
        if(!enemy) continue;
        
        //float back and forth when alive
        if(enemy && enemy.state == "alive") {
            enemy.counter++;
            enemy.x += Math.sin(enemy.counter*Math.PI*2/100)*2;
            //fire a bullet every 50 ticks
            //use 'phase' so they don't all fire at the same time
            if((enemy.counter + enemy.phase) % 120 == 0) {
                enemyBullets.push(createEnemyBullet(enemy));
            }
        }
        
        //enter the destruction state when hit
        if(enemy && enemy.state == "hit") {
            enemy.counter++;
            
            //finally be dead so it will get cleaned up
            if(enemy.counter >= 20) {
                enemy.state = "dead";
                enemy.counter = 0;
		var scoreP = 0;
            }
        }
    }
    
    //remove the dead ones
    enemies = enemies.filter(function(e) {
            if(e && e.state != "dead") return true;
            return false;
    });
}


function updateEnemyBullets() {
    for(var i in enemyBullets) {
        var bullet = enemyBullets[i];
        bullet.y += 2;
        bullet.counter++;
    }
}

// =========== check for collisions ===

function checkCollisions() {
    for(var i in playerBullets) {
        var bullet = playerBullets[i];
        for(var j in enemies) {
            var enemy = enemies[j];
            if(collided(bullet,enemy)) {
                bullet.state = "hit";
                enemy.state = "hit";
                enemy.counter = 0;
            }
        }
    }
    
    if(player.state == "hit" || player.state == "dead")
return;
    for(var i in enemyBullets) {
        var bullet = enemyBullets[i];
        if(collided(bullet,player)) {
            bullet.state = "hit";
            player.state = "hit";
            player.counter = 0;
        }
    }
}

function collided(a, b) {
    
    //check for horz collision
    if(b.x + b.width >= a.x && b.x < a.x + a.width) {
        //check for vert collision
        if(b.y + b.height >= a.y && b.y < a.y + a.height) {
            return true;
        }
    }
    
    //check a inside b
    if(b.x <= a.x && b.x + b.width >= a.x+a.width) {
        if(b.y <= a.y && b.y + b.height >= a.y + a.height) {
            return true;
        }
    }
    
    //check b inside a
    if(a.x <= b.x && a.x + a.width >= b.x+b.width) {
        if(a.y <= b.y && a.y + a.height >= b.y+b.height) {
            return true;
        }
    }
    
    return false;
}

//====================================


function doSetup() {
	attachEvent(document, "keydown", function(e) {
		keyboard[e.keyCode] = true;
	});
	attachEvent(document, "keyup", function(e) {
		keyboard[e.keyCode] = false;
	});
}

function attachEvent(node,name,func) {
    if(node.addEventListener) {
        node.addEventListener(name,func,false);
    } else if(node.attachEvent) {
        node.attachEvent(name,func);
    }
};

