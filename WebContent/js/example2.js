var planes=[
            [
             {
            	skin:"plane1",
            	velocity:1,
            	damageReduction:1
             },
             {
             	skin:"plane2",
             	velocity:0.5,
             	damageReduction:0.5
             },
             {
              	skin:"plane3",
              	velocity:2,
              	damageReduction:2
             }
             ],
             [
              {
             	skin:"heli1",
             	velocity:1,
             	damageReduction:1
              },
              {
              	skin:"heli2",
              	velocity:0.5,
              	damageReduction:0.5
              },
              {
               	skin:"heli3",
               	velocity:2,
               	damageReduction:2
              }
              ],
              [
               {
              	skin:"zep1",
              	velocity:1,
              	damageReduction:2
               },
               {
               	skin:"zep2",
               	velocity:0.5,
               	damageReduction:1
               },
               {
                skin:"zep3",
                velocity:2,
                damageReduction:3.5
               }
               ]
            ];

var players=[
             {
            	maxLife:100,
            	life:100,
            	sprite:null,
            	currentWeapon:0,
            	fire:false,
            	plane:1,
            	moves:["0","0"],
            	timeHitted:0,
            	temporalInvinc:0,
            	damaged:0,
            	morphing:false,
            	entrada:true,
            	weapons:[]
             },
             {
             	maxLife:100,
             	life:100,
             	sprite:null,
             	currentWeapon:0,
            	fire:false,
            	plane:1,
            	moves:["0","0"],
            	timeHitted:0,
            	temporalInvinc:0,
            	damaged:0,
            	morphing:false,
            	entrada:true,
            	weapons:[]
              },
              {
               	maxLife:100,
               	life:100,
               	sprite:null,
               	currentWeapon:0,
            	fire:false,
            	plane:1,
            	moves:["0","0"],
            	timeHitted:0,
            	temporalInvinc:0,
            	damaged:0,
            	morphing:false,
            	entrada:true,
            	weapons:[]
                }
             ];

var enemy= {
        skin:"enemy",
        strength:40,
        maxLife:30,
        life:30
     };

var rangedEnemy= {
        skin:"rangedEnemy",
        fireRate:0,
     };

var boss={
        skin:"boss",
        deathSkin:"boss",
        life:400,
        maxLife:400,
        strength:90,
        atack1:33,
        atack2:50 ,
        sprite:null,
        weapons:null
     };

var game = new Phaser.Game("100%", "100%", Phaser.AUTO, 'phaser-example');

var Bullet = function (game, key, damageB) {

    Phaser.Sprite.call(this, game, 0, 0, key);

    this.texture.baseTexture.scaleMode = PIXI.scaleModes.NEAREST;
    this.damage=damageB;
    this.anchor.set(0.5);

    this.checkWorldBounds = true;
    this.outOfBoundsKill = true;
    this.exists = false;

    this.tracking = false;
    this.scaleSpeed = 0;

};

Bullet.prototype = Object.create(Phaser.Sprite.prototype);
Bullet.prototype.constructor = Bullet;

Bullet.prototype.fire = function (x, y, angle, speed, gx, gy) {

    gx = gx || 0;
    gy = gy || 0;

    this.reset(x, y);
    this.scale.set(1);

    this.game.physics.arcade.velocityFromAngle(angle, speed, this.body.velocity);

    this.angle = angle;

    this.body.gravity.set(gx, gy);

};

Bullet.prototype.update = function () {

    if (this.tracking)
    {
        this.rotation = Math.atan2(this.body.velocity.y, this.body.velocity.x);
    }

    if (this.scaleSpeed > 0)
    {
        this.scale.x += this.scaleSpeed;
        this.scale.y += this.scaleSpeed;
    }
    if(this.body.x>window.innerWidth+globalGame.camera.x){
    	this.kill();
    }

};

var Weapon = {};

////////////////////////////////////////////////////
//  A single bullet is fired in front of the ship //
////////////////////////////////////////////////////

Weapon.SingleBullet = function (game) {

    Phaser.Group.call(this, game, game.world, 'Single Bullet', false, true, Phaser.Physics.ARCADE);

    this.nextFire = 0;
    this.bulletSpeed = 600;
    this.fireRate = 300;

    for (var i = 0; i < 64; i++)
    {
        this.add(new Bullet(game, 'bullet1', 20), true);
    }

    return this;

};

Weapon.SingleBullet.prototype = Object.create(Phaser.Group.prototype);
Weapon.SingleBullet.prototype.constructor = Weapon.SingleBullet;

Weapon.SingleBullet.prototype.fire = function (source) {

    if (this.game.time.time < this.nextFire) { return; }

    var x = source.x + 40;
    var y = source.y;
    blasterSound.play();
    this.getFirstExists(false).fire(x, y, 0, this.bulletSpeed, 0, 0);

    this.nextFire = this.game.time.time + this.fireRate;

};

////////////////////////////////////////////////////
//  Bullets are fired out scattered on the y axis //
////////////////////////////////////////////////////

Weapon.ScatterShot = function (game) {

    Phaser.Group.call(this, game, game.world, 'Scatter Shot', false, true, Phaser.Physics.ARCADE);

    this.nextFire = 0;
    this.bulletSpeed = 600;
    this.fireRate = 40;

    for (var i = 0; i < 60; i++)
    {
        this.add(new Bullet(game, 'bullet2', 10), true);
    }

    return this;

};

Weapon.ScatterShot.prototype = Object.create(Phaser.Group.prototype);
Weapon.ScatterShot.prototype.constructor = Weapon.ScatterShot;

Weapon.ScatterShot.prototype.fire = function (source) {

    if (this.game.time.time < this.nextFire) { return; }

    var x = source.x + 40;
    var y = (source.y) + this.game.rnd.between(-10, 10);
    blasterSound.play();
    this.getFirstExists(false).fire(x, y, 0, this.bulletSpeed, 0, 0);

    this.nextFire = this.game.time.time + this.fireRate;

};

//////////////////////////////////////////////////////////////////////////
//  Fires a streaming beam of lazers, very fast, in front of the player //
//////////////////////////////////////////////////////////////////////////

Weapon.Beam = function (game) {

    Phaser.Group.call(this, game, game.world, 'Beam', false, true, Phaser.Physics.ARCADE);

    this.nextFire = 0;
    this.bulletSpeed = 1000;
    this.fireRate = 20;

    for (var i = 0; i < 64; i++)
    {
        this.add(new Bullet(game, 'bullet3', 7), true);
    }

    return this;

};

Weapon.Beam.prototype = Object.create(Phaser.Group.prototype);
Weapon.Beam.prototype.constructor = Weapon.Beam;

Weapon.Beam.prototype.fire = function (source) {

    if (this.game.time.time < this.nextFire) { return; }

    var x = source.x + 40;
    var y = source.y ;
    blasterSound.play();
    this.getFirstExists(false).fire(x, y, 0, this.bulletSpeed, 0, 0);

    this.nextFire = this.game.time.time + this.fireRate;

};

///////////////////////////////////////////////////////////////////////
//  Bullets have Gravity.y set on a repeating pre-calculated pattern //
///////////////////////////////////////////////////////////////////////

Weapon.Pattern = function (game) {

    Phaser.Group.call(this, game, game.world, 'Pattern', false, true, Phaser.Physics.ARCADE);

    this.nextFire = 0;
    this.bulletSpeed = 600;
    this.fireRate = 40;

    this.pattern = Phaser.ArrayUtils.numberArrayStep(-800, 800, 200);
    this.pattern = this.pattern.concat(Phaser.ArrayUtils.numberArrayStep(800, -800, -200));

    this.patternIndex = 0;

    for (var i = 0; i < 64; i++)
    {
        this.add(new Bullet(game, 'bullet4', 15), true);
    }

    return this;

};

Weapon.Pattern.prototype = Object.create(Phaser.Group.prototype);
Weapon.Pattern.prototype.constructor = Weapon.Pattern;

Weapon.Pattern.prototype.fire = function (source) {

    if (this.game.time.time < this.nextFire) { return; }

    var x = source.x + 40;
    var y = source.y;
    blasterSound.play();
    this.getFirstExists(false).fire(x, y, 0, this.bulletSpeed, 0, this.pattern[this.patternIndex]);

    this.patternIndex++;

    if (this.patternIndex === this.pattern.length)
    {
        this.patternIndex = 0;
    }

    this.nextFire = this.game.time.time + this.fireRate;

};

///////////////////////////////////////////////////////////////////
//  Rockets that visually track the direction they're heading in //
///////////////////////////////////////////////////////////////////

Weapon.Rockets = function (game) {

    Phaser.Group.call(this, game, game.world, 'Rockets', false, true, Phaser.Physics.ARCADE);

    this.nextFire = 0;
    this.bulletSpeed = 400;
    this.fireRate = 250;

    for (var i = 0; i < 32; i++)
    {
        this.add(new Bullet(game, 'bullet5', 40), true);
    }

    this.setAll('tracking', true);

    return this;

};

Weapon.Rockets.prototype = Object.create(Phaser.Group.prototype);
Weapon.Rockets.prototype.constructor = Weapon.Rockets;

Weapon.Rockets.prototype.fire = function (source) {

    if (this.game.time.time < this.nextFire) { return; }

    var x = source.x + 40;
    var y = source.y;
    blasterSound.play();
    this.getFirstExists(false).fire(x, y, 0, this.bulletSpeed, 0, -700);
    this.getFirstExists(false).fire(x, y, 0, this.bulletSpeed, 0, 0);
    this.getFirstExists(false).fire(x, y, 0, this.bulletSpeed, 0, 700);

    this.nextFire = this.game.time.time + this.fireRate;

};

////////////////////////////////////////////////////////////////////////
//  A single bullet that scales in size as it moves across the screen //
////////////////////////////////////////////////////////////////////////

Weapon.ScaleBullet = function (game) {

    Phaser.Group.call(this, game, game.world, 'Scale Bullet', false, true, Phaser.Physics.ARCADE);

    this.nextFire = 0;
    this.bulletSpeed = 800;
    this.fireRate = 100;

    for (var i = 0; i < 32; i++)
    {
        this.add(new Bullet(game, 'bullet6', 35), true);
    }

    this.setAll('scaleSpeed', 0.05);

    return this;

};

Weapon.ScaleBullet.prototype = Object.create(Phaser.Group.prototype);
Weapon.ScaleBullet.prototype.constructor = Weapon.ScaleBullet;

Weapon.ScaleBullet.prototype.fire = function (source) {

    if (this.game.time.time < this.nextFire) { return; }

    var x = source.x + 40;
    var y = source.y;
    blasterSound.play();
    this.getFirstExists(false).fire(x, y, 0, this.bulletSpeed, 0, 0);

    this.nextFire = this.game.time.time + this.fireRate;

};

Weapon.EightWay = function (game) {

    Phaser.Group.call(this, game, game.world, 'Eight Way', false, true, Phaser.Physics.ARCADE);

    this.nextFire = 0;
    this.bulletSpeed = 600;
    this.fireRate = 30;

    for (var i = 0; i < 96; i++)
    {
        this.add(new Bullet(game, 'balaCanon', enemy.strength), true);
    }

    return this;

};

Weapon.EightWay.prototype = Object.create(Phaser.Group.prototype);
Weapon.EightWay.prototype.constructor = Weapon.EightWay;

Weapon.EightWay.prototype.fire = function (source) {

    if (this.game.time.time < this.nextFire) { return; }

    var x = source.x + 16;
    var y = source.y + 10;
    
    var shoot=this.game.rnd.between(0, 6);
    
    if(shoot==0){
    	this.getFirstExists(false).fire(x, y, 180, this.bulletSpeed, 0, 0);
    }else if(shoot==1){
    	this.getFirstExists(false).fire(x, y, 185, this.bulletSpeed, 0, 0);
    }else if(shoot==2){
    	this.getFirstExists(false).fire(x, y, 190, this.bulletSpeed, 0, 0);
    }else if(shoot==3){
    	this.getFirstExists(false).fire(x, y, 195, this.bulletSpeed, 0, 0);
    }else if(shoot==4){
    	this.getFirstExists(false).fire(x, y, 175, this.bulletSpeed, 0, 0);
    }else if(shoot==5){
    	this.getFirstExists(false).fire(x, y, 170, this.bulletSpeed, 0, 0);
    }else if(shoot==6){
    	this.getFirstExists(false).fire(x, y, 165, this.bulletSpeed, 0, 0);
    }
    this.nextFire = this.game.time.time + this.fireRate;

};

function reiniciarJugador(indexCharacter){
	var lifeAnt=players[indexCharacter].life;
	players[indexCharacter]=
             {
				maxLife:100,
	           	life:lifeAnt,
	           	sprite:null,
	           	currentWeapon:0,
	        	fire:false,
	        	plane:1,
	        	moves:["0","0"],
	        	timeHitted:0,
	        	temporalInvinc:0,
	        	damaged:0,
	        	morphing:false,
	        	entrada:true,
	        	weapons:[]
             };
	players[indexCharacter].weapons.push(new Weapon.SingleBullet(this.game));
	players[indexCharacter].weapons.push(new Weapon.ScatterShot(this.game));
	players[indexCharacter].weapons.push(new Weapon.Beam(this.game));
	players[indexCharacter].weapons.push(new Weapon.Pattern(this.game));
	players[indexCharacter].weapons.push(new Weapon.Rockets(this.game));
	players[indexCharacter].weapons.push(new Weapon.ScaleBullet(this.game));
	for (var j = 0; j < players[indexCharacter].weapons.length; j++)
    {
		globalGame.bulletsPool.add(players[indexCharacter].weapons[j]);
		players[indexCharacter].weapons[j].visible = false;
    }
	players[indexCharacter].weapons[0].visible = true;
}
//CONSTANTES
var worldsize=16000;
var bossDominions=500;
var initBossDominions=1500;
//------------------------------

var ws;
var globalGame=null;
var startGame=false;
var cameraFollow=-1;
var finalBoss=false;
var deathBoss;
var frames=200;
var lastRangedEnemyX=0;
var livingPlayers=[];
var animCounter=0;
var muertoYEnterrado=false;
var yaperdido=true;
var yaperdidoFinal=null;
var numMuertos=0;
var playerKilledType;

var PhaserGame= function(){
    this.nextEnemy=null;
    this.nextRangedEnemy=null;
    this.enemyPool=null;
    this.rangedEnemyPool=null;
    this.weaponsPool=null;
    this.bulletsPool=null;
    this.transformPool=null;
    this.bossBulletsPool=null;
    this.playersPool=null;
    this.barSprite=null;
    this.gameoverAnim=false;
}

PhaserGame.prototype = {
		init: function(){
			this.game.renderer.renderSession.roundPixels = true;

            this.physics.startSystem(Phaser.Physics.ARCADE);
		},
		preload: function() {
			this.load.atlasJSONHash('boss', 'img/juego2/barcoHundido.png', 'img/juego2/barcoHundido.json');
			this.load.image('canon', 'img/juego2/canon.png');
			this.load.image('fondo', 'img/juego2/fondo.png');
			
			this.load.image('plane1', 'img/plane-1.png');
			this.load.image('plane2', 'img/plane-2.png');
			this.load.image('plane3', 'img/plane-3.png');
			
			this.load.image('heli1', 'img/heli-1.png');
			this.load.image('heli2', 'img/heli-2.png');
			this.load.image('heli3', 'img/heli-3.png');
			
			this.load.image('zep1', 'img/zep-1.png');
			this.load.image('zep2', 'img/zep-2.png'); 
			this.load.image('zep3', 'img/zep-3.png');
			
			this.load.spritesheet('transform1', 'img/objectst.png',91,79,47);
			this.load.spritesheet('transform2', 'img/objectst2.png',91,79,47);
			
			this.load.spritesheet('explosion2', 'img/exp1.png',128,128,15);
			this.load.spritesheet('transform', 'img/nubetrans.png',353,310,85);
			this.load.spritesheet('explosion1', 'img/exp2.png',96,96,21);
			this.load.spritesheet('fire', 'img/fire.png',64,64,5);
			
			this.load.image('enemy', 'img/juego2/pirata3.png');
			//this.load.image('rangedEnemy', 'img/rangedEnemy.png');
			
			//this.load.image('boss', 'img/boss.jpg');
			
			this.load.image('balaCanon', 'img/juego2/bala2.png');
			for(i=1; i<= 6; i++){
				this.load.image('bullet'+i, 'img/bullet'+i+'.png');
			}
			
			
			for(i=1; i<= 6; i++){
				this.load.image('weapon'+i, 'img/arma'+i+'.png');
			}

			this.load.audio('explosion', 'sounds/explosion2.wav');
			this.load.audio('blaster', 'sounds/blaster.ogg');
			this.load.audio('crash', 'sounds/crash.wav');
			this.load.audio('collect', 'sounds/collect.wav');
			this.load.audio('win', 'sounds/win.wav');
			this.load.audio('gameOver', 'sounds/gameOver.mp3');
			
			this.load.audio('battle', 'sounds/batalla.wav');
			this.load.audio('music', 'sounds/mundo2.mp3');
		},

		create: function () {
			globalGame=this;
			this.world.setBounds(0, 0, worldsize, window.innerHeight-150);
			//var height=window.height;
			//sprite.scale.setTo(10, 10);
			var maxFondo=0;
			var imageFondo = this.cache.getImage('fondo');
			for(maxFondo=0;maxFondo<worldsize;maxFondo=maxFondo+imageFondo.width){
				back=this.add.sprite(maxFondo, 0,'fondo');
				back.height=window.innerHeight;
			}
			
			this.bulletsPool = this.add.group();
		    this.bulletsPool.enableBody = true;
		    this.bulletsPool.physicsBodyType = Phaser.Physics.ARCADE;
			
		    explosionSound = this.add.audio('explosion');
		    crashSound = this.add.audio('crash');
		    blasterSound = this.add.audio('blaster');
		    collectSound = this.add.audio('collect');
		    winSound = this.add.audio('win');
		    gameOverSound = this.add.audio('gameOver');
		    musicSound = this.add.audio('music');
		    musicSound.loopFull();
		    batalla= this.add.audio('battle');
			
			
			this.bossBulletsPool = this.add.group();
		    this.bossBulletsPool.enableBody = true;
		    this.bossBulletsPool.physicsBodyType = Phaser.Physics.ARCADE;
		    boss.weapons=new Weapon.EightWay(this.game);
			boss.weapons.visible = true;
		    this.bossBulletsPool.add(boss.weapons);
			
			this.enemyBulletsPool = this.add.group();
			this.enemyBulletsPool.enableBody = true;
			this.enemyBulletsPool.physicsBodyType = Phaser.Physics.ARCADE;
		//	this.enemyBulletsPool.createMultiple(100, 'enemyBullet');
			this.enemyBulletsPool.setAll('anchor.x', 0.5);
			this.enemyBulletsPool.setAll('anchor.y', 1);
			this.enemyBulletsPool.setAll('outOfBoundsKill', true);
			this.enemyBulletsPool.setAll('checkWorldBounds', true);
			
			
			this.enemyPool = this.add.group();
		    this.enemyPool.enableBody = true;
		    this.enemyPool.physicsBodyType = Phaser.Physics.ARCADE;
		    this.enemyPool.createMultiple(50, enemy.skin);
		    this.enemyPool.setAll('anchor.x', 0.5);
		    this.enemyPool.setAll('anchor.y', 0.5);
		    this.enemyPool.setAll('outOfBoundsKill', true);
		    this.enemyPool.setAll('checkWorldBounds', true);
		    this.physics.arcade.enable(this.enemyPool,true);
		    
		    
		    this.rangedEnemyPool = this.add.group();
		    this.rangedEnemyPool.enableBody = true;
		    this.rangedEnemyPool.physicsBodyType = Phaser.Physics.ARCADE;
		    this.rangedEnemyPool.createMultiple(50, 'canon');
		    this.rangedEnemyPool.setAll('anchor.x', 0.5);
		    this.rangedEnemyPool.setAll('anchor.y', 0.5);
		    this.rangedEnemyPool.setAll('outOfBoundsKill', true);
		    this.rangedEnemyPool.setAll('checkWorldBounds', true);
		    this.physics.arcade.enable(this.rangedEnemyPool,true);
		    
		    this.weaponsPool = this.add.group();
		    this.weaponsPool.enableBody = true;
		    this.weaponsPool.physicsBodyType = Phaser.Physics.ARCADE;
		    
		    this.transformPool = this.add.group();
		    this.transformPool.enableBody = true;
		    this.transformPool.physicsBodyType = Phaser.Physics.ARCADE;
		    
		    this.playersPool = this.add.group();
		    this.playersPool.enableBody = true;
		    this.playersPool.physicsBodyType = Phaser.Physics.ARCADE;

			this.world.enableBody= true;
			
			ws = new WebSocket("ws://localhost:8080/QuanticTravel/actions");
			ws.onmessage = function(message){
				substransform=message.data.substring(0, message.data.length-1);
				substransform2=message.data.substring(0, message.data.length-2);
				indexCharacter=parseInt(message.data.charAt(message.data.length-1));
				if(substransform=="close"){
					globalGame.die(players[indexCharacter]);
				}else if(substransform=="fire"){
					players[indexCharacter].fire=true;
				}else if(substransform=="start"){
					reiniciarJugador(indexCharacter);
					playerObject=globalGame.add.sprite(globalGame.camera.x+200, -200, planes[indexCharacter][0].skin);
					playerObject.anchor.set(0.5);
					playerObject.body.collideWorldBounds=true;
					playerObject.type=indexCharacter;
					playerObject.body.checkCollision.down=false;
					playerObject.body.checkCollision.up=false;
					playerObject.body.checkCollision.right=false;
					globalGame.playersPool.add(playerObject);
					globalGame.updatePlayersHealth(playerObject,0);
					//alert(players[indexCharacter].life);
					players[indexCharacter].sprite=playerObject;
					//players[indexCharacter].entrada=true;
					if(cameraFollow==-1){
						globalGame.camera.follow(playerObject);
						cameraFollow=indexCharacter;
						startGame=true;
					}
				}else if(substransform=="stopFire"){
					players[indexCharacter].fire=false;
				}else if(substransform2=="transform"){
					
					players[indexCharacter].plane=parseInt(message.data.charAt( message.data.length-2));
					players[indexCharacter].morphing=true;
					 players[indexCharacter].sprite.loadTexture('transform', 1);
					 animCloud = players[indexCharacter].sprite.animations.add('trans');
					 animCloud.play(20,false, false);
					
					 animCloud.onComplete.add(function(){
						 players[indexCharacter].sprite.loadTexture(planes[indexCharacter][players[indexCharacter].plane-1].skin);
						 players[indexCharacter].morphing=false;
					 });
				}else if(substransform=="gameOver"){
					globalGame.gameOver();
				}else{
					players[indexCharacter].moves= substransform.split("y");
				}
			}

		},
		playerBulletHit: function(bullet, friend){
		//	alert("entra");
			explosionSound.play();
			bullet.kill();
			 explosion = this.add.sprite(friend.body.x+friend.width/2, friend.body.y, 'explosion1', 1);
			 anim = explosion.animations.add('burst');
			 anim.play(15,false, true);
			damage=20*planes[friend.type][players[friend.type].plane-1].damageReduction;
			this.updatePlayersHealth(friend, damage);
		},
		bossBulletHit: function(bullet, friend){
			bullet.kill();
			explosionSound.play();
			 explosion = this.add.sprite(friend.body.x+friend.width/2, friend.body.y, 'explosion1', 1);
			 anim = explosion.animations.add('burst');
			 anim.play(15,false, true);
			damage=bullet.damage*planes[friend.type][players[friend.type].plane-1].damageReduction;
			this.updatePlayersHealth(friend, damage);
		},
		playerHit: function(friend, foe){
			var damage;
			explosionSound.play();
			if(players[friend.type].temporalInvinc==0 || this.game.time.now>=players[friend.type].timeHitted+players[friend.type].temporalInvinc){
				 explosion = this.add.sprite(friend.body.x+friend.width/2, friend.body.y, 'explosion1', 1);
				 anim = explosion.animations.add('burst');
				 anim.play(15,false, true);
				players[friend.type].temporalInvinc=0;
				if(foe.type!=1){
					foe.kill();
					damage=enemy.strength*planes[friend.type][players[friend.type].plane-1].damageReduction;
				}else{
					damage=boss.strength*planes[friend.type][players[friend.type].plane-1].damageReduction;
					players[friend.type].temporalInvinc=2000;
					players[friend.type].timeHitted=this.game.time.now;
					//players[friend.type].moves["-10",players[friend.type].moves[1]];
					
				}
				this.updatePlayersHealth(friend, damage);
				
			}
		},
		updatePlayersHealth: function(friend, damage){
		//	alert(damage);
			players[friend.type].life=players[friend.type].life-damage;
			if(players[friend.type].life<=0){
				this.die(players[friend.type]);
				ws.send("server"+friend.type+"killl");
			}else{
				percentLife=(players[friend.type].life/players[friend.type].maxLife)*100;
				if(percentLife<70 && players[friend.type].damaged<1){
					players[friend.type].damaged=1;
					fire = this.make.sprite(0, -20, 'fire', 1);
					fire.anchor.set(0.5);
					friend.addChild(fire);
					 animFire = fire.animations.add('burn');
					 animFire.play(10,true);
				}
				if(percentLife<45 && players[friend.type].damaged<2){
					players[friend.type].damaged=2;
					fire = this.make.sprite(40, 0, 'fire', 1);
					fire.anchor.set(0.5);
					friend.addChild(fire);
					 animFire = fire.animations.add('burn');
					 animFire.play(10,true);
				}
				if(percentLife<25&& players[friend.type].damaged<3){
					players[friend.type].damaged=3;
					fire = this.make.sprite(-40, -20, 'fire', 1);
					fire.anchor.set(0.5);
					friend.addChild(fire);
					 animFire = fire.animations.add('burn');
					 animFire.play(10,true);
				}
				ws.send("server"+friend.type+"lifee"+Math.round(percentLife));
			}
		},
		
		die: function(playerObject){
			playerObject.moves=["0","0"];
			playerObject.damaged=4;
			//playerObject.sprite.kill();
			
			
		},
		destroyPlayer: function(playerObject){
			 explosion = this.add.sprite(playerObject.body.x+playerObject.width/2, playerObject.body.y+playerObject.height/2, 'explosion2', 1);
			 crashSound.play();
			 playerKilledType=playerObject.type;
			 playerObject.kill();
			 explosion.anchor.set(0.5);
			 explosion.scale.setTo(2,2);
			 anim = explosion.animations.add('burst');
			 anim.play(15,false, true);
			 
			 anim.onComplete.add(function(){
				 newLeader=this.playersPool.getFirstAlive();
					if(newLeader==null){
						this.gameOver();
						cameraFollow=-1;
					}else if(playerKilledType==cameraFollow){
						cameraFollow=newLeader.type;
						this.camera.follow(newLeader);
					}
	    		}, this);
			 
		},
		gameOver: function(){
			musicSound.stop();
			batalla.stop();
		    gameOverSound.play();
			this.gameoverAnim=true;
			//alert("gameOver");
			//this.camera.x=bossDominions;
		},
		enemyHit: function (bullet, foe) {
		    bullet.kill();
		    explosionSound.play();
		    if(foe.type==1){
		    	explosion = this.add.sprite(foe.body.x+foe.width/2, foe.height*0.8, 'explosion1', 1);
				 anim = explosion.animations.add('burst');
				 anim.play(15,false, true);
		    	boss.life=boss.life-bullet.damage;
		    	if(boss.life<=0 && finalBoss){
		    		foe.body.checkCollision.down=false;
		    		foe.body.checkCollision.up=false;
		    		foe.body.checkCollision.right=false;
		    		foe.body.checkCollision.left=false;
		    		finalBoss=false;
		    		this.barSprite.kill();
		    		var animDie=foe.animations.play('drown');
		    		this.playersPool.forEachAlive(function(playerIngame) {
		    			playerIngame.body.checkCollision.down=false;
		    			playerIngame.body.checkCollision.up=false;
		    			playerIngame.body.checkCollision.right=false;
		    			playerIngame.body.checkCollision.left=false;
		    		},this);

		    		
		    		animDie.onComplete.add(function(){
		    			musicSound.stop();
						batalla.stop();
					    winSound.play();
		    			muertoYEnterrado=true;
		    			ws.send("server"+7+"winne");
		    		}, this);
		    		
		    		//foe.kill();
		    		//var image = this.cache.getImage(boss.deathSkin);
		    		
		    		//deathBoss=this.add.sprite(posx, window.innerHeight-image.height-50, boss.deathSkin);
		    		 
		    	}
		    }else{
		    	explosion = this.add.sprite(foe.body.x+foe.width/2, foe.body.y+foe.height*0.8, 'explosion1', 1);
				 anim = explosion.animations.add('burst');
				 anim.play(15,false, true);
				 foe.life=foe.life-bullet.damage;
				 if(foe.life<=0){
					 foe.kill();
					 var random=this.game.rnd.integerInRange(1,4);
						if(random==4){
							var tipoRecompensa=this.game.rnd.integerInRange(1,2);
							if(tipoRecompensa==1){
									var weapon=this.game.rnd.integerInRange(1,6);
								 	weaponObject=this.add.sprite(foe.body.x, foe.body.y, "weapon"+weapon);
								 	weaponObject.scale.setTo(0.7,0.7);
								 	weaponObject.type=weapon;
									this.weaponsPool.add(weaponObject);
							}else{
								 var transform=this.game.rnd.integerInRange(1,2);
								 transformObject = this.add.sprite(foe.body.x, foe.body.y, 'transform'+transform, 1);
								 transformObject.type=transform+1;
								 this.transformPool.add(transformObject);
								 anim = transformObject.animations.add('trans');
								 anim.play(10,true, true);

							}
						}
				 }
				
		    }
		},
		
		
		collect: function(player, object){
			collectSound.play();
			players[player.type].weapons[players[player.type].currentWeapon].visible = false;
			players[player.type].weapons[players[player.type].currentWeapon].callAll('reset', null, 0, 0);
			players[player.type].weapons[players[player.type].currentWeapon].setAll('exists', false);
			players[player.type].currentWeapon=object.type-1;
			players[player.type].weapons[players[player.type].currentWeapon].visible = true;
	        ws.send("server"+player.type+"weapo"+object.type);
			object.destroy();
			
		},
		
		collectTrans: function(player, object){	
			collectSound.play();
	        ws.send("server"+player.type+"plane"+object.type);
			object.destroy();
			
		},
		regularBossAtack:function(){
		//	for(i=0;i<=5;i++){
				livingPlayers.length=0;
				this.playersPool.forEachAlive(function(alivePlayer){
			        // put every living enemy in an array
					livingPlayers.push(alivePlayer);
			    });
				blasterSound.play();
				var target=livingPlayers[this.game.rnd.integerInRange(0,livingPlayers.length-1)];
				enemyAsBullet=this.add.sprite(boss.sprite.body.x+boss.sprite.width/2, boss.sprite.body.y+boss.sprite.height/2, "balaCanon");
				//enemyAsBullet.life=enemy.life;
				//enemyAsBullet.type=0;
				this.bossBulletsPool.add(enemyAsBullet);
				game.physics.arcade.moveToObject(enemyAsBullet,target,120);
				boss.sprite.lastAttack=this.game.time.now;
		//	}
		},
		majorBossAtack: function(){
			blasterSound.play();
			boss.weapons.fire(boss.sprite);
			boss.sprite.lastAttack=this.game.time.now;
			
		},
		update: function(){
			this.physics.arcade.overlap(this.playersPool, this.enemyPool, this.playerHit, null, this);
			this.physics.arcade.overlap(this.bulletsPool, this.enemyPool, this.enemyHit, null, this);
			this.physics.arcade.overlap(this.playersPool, this.weaponsPool, this.collect, null, this);
			this.physics.arcade.overlap(this.playersPool, this.transformPool, this.collectTrans, null, this);
			this.physics.arcade.overlap(this.enemyBulletsPool, this.playersPool, this.playerBulletHit, null, this);
			this.physics.arcade.overlap(this.bossBulletsPool, this.playersPool, this.bossBulletHit, null, this);
			
			  var speed=250;
			  
			  if(this.camera.x+window.innerWidth<worldsize-bossDominions || finalBoss){
				  this.playersPool.forEachAlive(function(playerIngame) {
					  var speedx=0;
					  var speedy=0;
					  if(playerIngame.body.x<=this.camera.x){
						  playerIngame.body.x=this.camera.x;
					  }
					  if(playerIngame.body.x+playerIngame.body.width>=this.camera.x+window.innerWidth){
						  playerIngame.body.x=this.camera.x+window.innerWidth-playerIngame.body.width;
					  }
					  if(players[playerIngame.type].damaged>=4){
						  if(players[playerIngame.type].damaged==4){
							  playerIngame.body.velocity.y=0;
							  playerIngame.body.velocity.x=0;
							  players[playerIngame.type].damaged=5;
							  	 explosion = globalGame.add.sprite(playerIngame.body.x+playerIngame.width/2, playerIngame.body.y, 'explosion1', 1);
								 var anim = explosion.animations.add('burst');
								 anim.play(15,false, true);
								 anim.onComplete.add(function(){
									 players[playerIngame.type].damaged=6;
									 playerIngame.body.gravity.y = 200;
									 playerIngame.body.checkCollision.down=false;
									 playerIngame.body.checkCollision.up=false;
									 playerIngame.body.checkCollision.right=false;
									 playerIngame.body.checkCollision.left=false;
								 });
							  
						  }else if(players[playerIngame.type].damaged==6){
							  playerIngame.body.velocity.x=200;
							  var coef=(playerIngame.body.velocity.y/200)/2;
							  if(coef>=2){
								  coef=2;
							  }
							  playerIngame.angle=45*coef;
							  
						  }
						  if(playerIngame.body.onFloor()){
							  this.destroyPlayer(playerIngame);
						  }
					  }else{
						  playerIngame.body.velocity.y=0;
						  playerIngame.body.velocity.x=0;
						  
						  var speedx=speed*parseFloat(players[playerIngame.type].moves[0]);
						  var speedy=-speed*parseFloat(players[playerIngame.type].moves[1]);
					  }
						  
					  playerIngame.body.velocity.y += speedy*planes[playerIngame.type][players[playerIngame.type].plane-1].velocity;
					//  if((playerIngame.body.x> this.camera.x+window.innerWidth-playerIngame.width && speedx>0)||(playerIngame.body.x<this.camera.x && speedx>0)){
					//	  playerIngame.body.velocity.x=0;
					//  }else{
						  playerIngame.body.velocity.x += speedx*planes[playerIngame.type][players[playerIngame.type].plane-1].velocity;
					  //}
					  if(players[playerIngame.type].entrada){
						  if(playerIngame.body.y>100){
							  players[playerIngame.type].entrada=false;
							  playerIngame.body.checkCollision.down=true;
							  playerIngame.body.checkCollision.up=true;
							  playerIngame.body.checkCollision.right=true;
							  playerIngame.body.checkCollision.left=true;
						  }
						  playerIngame.body.velocity.x=200 
						  playerIngame.body.velocity.y=200 
					  }
					  
					  
					  if( players[playerIngame.type].fire && !players[playerIngame.type].morphing)
					  {
						  players[playerIngame.type].weapons[players[playerIngame.type].currentWeapon].fire(playerIngame);
					  }
				  },this);
				  this.rangedEnemyPool.forEachAlive(function(rangedEnemyIngame) {
					  if(this.game.time.now > rangedEnemyIngame.lastShot+rangedEnemyIngame.fireRate){
						  var enemyBullet = globalGame.add.sprite(rangedEnemyIngame.body.x+rangedEnemyIngame.width/2, rangedEnemyIngame.body.y+15,'balaCanon');
						  globalGame.enemyBulletsPool.add(enemyBullet);
						  blasterSound.play();
						  enemyBullet.anchor.set(0.5);
						  enemyBullet.body.velocity.y=-100;

						  rangedEnemyIngame.lastShot=this.game.time.now;
					  }
				  },this);
				  if(this.camera.x+2*window.innerWidth<worldsize-initBossDominions){
					  if(startGame && !finalBoss && this.game.time.now > this.nextEnemy && this.enemyPool.countDead() > 0){
						  var enemySprite = this.enemyPool.getFirstExists(false);
						  enemySprite.type=0;
						  enemySprite.life=enemy.life;
						  enemySprite.reset(window.innerWidth+this.camera.x, this.rnd.integerInRange(50, window.innerHeight-200));
						  enemySprite.body.velocity.x = this.rnd.integerInRange(-110, -80);
						  enemySprite.anchor.setTo(0.5,0.8);
						  //enemySprite.body.angularVelocity=5;
						  var random=this.game.rnd.integerInRange(4000,5000);
						  this.nextEnemy=this.game.time.now+random; 
					  }
					  if(startGame && !finalBoss && this.game.time.now > this.nextRangedEnemy && this.rangedEnemyPool.countDead() > 0){
						  if((window.innerWidth+this.camera.x)-lastRangedEnemyX>=500){
	
							  var rangedEnemyLocal = this.rangedEnemyPool.getFirstExists(false);
							  rangedEnemyLocal.type=0;
							  //var image = this.cache.getImage(rangedEnemy.skin);
							  rangedEnemyLocal.reset(window.innerWidth+this.camera.x, window.innerHeight-100);
							  //rangedEnemyLocal.animations.add('attack', Phaser.Animation.generateFrameNames('seta/', 0, 23, '', 4), 25, false, false);
							  rangedEnemyLocal.fireRate=this.rnd.integerInRange(6000, 7000);
							  rangedEnemyLocal.lastShot=this.game.time.now;
							  
							  var enemyBullet = globalGame.add.sprite(rangedEnemyLocal.body.x+rangedEnemyLocal.width/2, rangedEnemyLocal.body.y+15,'balaCanon');
							  enemyBullet.anchor.set(0.5);
							  blasterSound.play();
							  globalGame.enemyBulletsPool.add(enemyBullet);
							  enemyBullet.body.velocity.y=-100;
							  
							  lastRangedEnemyX=window.innerWidth+this.camera.x;
						  }
						  var randomRanged=this.game.rnd.integerInRange(4000,5000);
						  this.nextRangedEnemy=this.game.time.now+randomRanged;
					  }
				  }
			  }
			  if(finalBoss && !animatedFinalBoss){
				  if(this.game.time.now>boss.sprite.lastAttack+boss.sprite.fireRate){
					this.majorBossAtack();
					 // }else{
					//	  this.regularBossAtack();
					 // }
				  }
			  }
			  if(this.camera.x+window.innerWidth>=worldsize-initBossDominions && this.camera.x+window.innerWidth<worldsize-bossDominions && !this.gameoverAnim){
				  if(finalBoss==false){
					  musicSound.stop();
					  batalla.loopFull();
					  finalBoss=true;
					  this.enemyPool.forEachAlive(function(enemyIngame){
						  enemyIngame.kill();
					  });
					  this.rangedEnemyPool.forEachAlive(function(rangedEnemyIngame){
						  rangedEnemyIngame.kill();
					  });
					  this.enemyBulletsPool.forEachAlive(function(bulletEnemyIngame){
						  bulletEnemyIngame.kill();
					  });
					  this.camera.unfollow();
					  animatedFinalBoss=true;
					 // var image = this.cache.getImage(boss.skin);
					  //capguy = game.add.sprite(0, 180, 'cityscene', 'capguy/walk/0001');
					    bossSprite=this.add.sprite(worldsize-bossDominions-300, window.innerHeight-370, boss.skin, 'barcoHundido2/0000');
					    bossSprite.animations.add('drown', Phaser.Animation.generateFrameNames('barcoHundido2/', 0, 33, '', 4), 10, false, false);
					    bossSprite.anchor.set(0.5);
					    bossSprite.scale.setTo(1.2, 1.2);
					     
					    bossSprite.type=1;
					    bossSprite.fireRate=2000;
					    bossSprite.lastAttack=this.game.time.now;
					    boss.sprite=bossSprite;
						this.enemyPool.add(bossSprite);
				  }
				  this.playersPool.forEachAlive(function(playerIngame) {
					  playerIngame.body.velocity.y=0;
					  playerIngame.body.velocity.x=250;
				  });
				  this.camera.x=this.camera.x+5;
			  }
			  if(this.camera.x+window.innerWidth>=worldsize-bossDominions && finalBoss){
				  if(animatedFinalBoss){
					  this.bar = this.add.bitmapData(500, 10);
					  this.barSprite=this.add.sprite((this.camera.x+window.innerWidth/2)-250, 50, this.bar);
				      this.bar.context.fillStyle = '#0f0'; 
				      this.bar.context.fillRect(0, 0, 500, 10);
				      animatedFinalBoss=false;
				  }else{
					  this.bar.context.clearRect(0, 0, this.bar.width, this.bar.height);
				        
				        // some simple colour changing to make it look like a health bar
				        if (boss.life < 0.2*boss.maxLife) {
				           this.bar.context.fillStyle = '#f00';   
				        }
				        else if (boss.life < 0.8*boss.maxLife) {
				            this.bar.context.fillStyle = '#ff0';
				        }
				        else {
				            this.bar.context.fillStyle = '#0f0';
				        }
				        
				        // draw the bar
				        this.bar.context.fillRect(0, 0, (boss.life/boss.maxLife)*500, 10);
				        
				        // important - without this line, the context will never be updated on the GPU when using webGL
				        this.bar.dirty = true;
				  }
				  
			  } if(this.camera.x+window.innerWidth>=worldsize-bossDominions && !finalBoss && frames>0 && muertoYEnterrado){
				  
				  this.playersPool.forEachAlive(function(playerIngame) {
					  playerIngame.body.velocity.y=0;
					  playerIngame.body.velocity.x=0;
					  difX=(boss.sprite.body.x-boss.sprite.body.width/2)-(playerIngame.body.x+playerIngame.body.width/2)-10;
					  difY=(boss.sprite.body.y+boss.sprite.body.height)-(playerIngame.body.y+playerIngame.body.height);
					  absX=Math.round(difX/frames);
					  absY=Math.round(difY/frames);
					  playerIngame.body.y=playerIngame.body.y+absY;
					  playerIngame.body.x=playerIngame.body.x+absX;
					  
				  });
				  frames--;
				  
			  }
			  if(this.gameoverAnim && this.camera.x+window.innerWidth<worldsize-bossDominions){
				  this.camera.x=this.camera.x+15;
				  if(yaperdido){
				    yaperdido=false;
				    bossSprite=this.add.sprite(worldsize-bossDominions-300, window.innerHeight-370, boss.skin, 'barcoHundido2/0000');
				    bossSprite.anchor.set(0.5);
				    bossSprite.scale.setTo(1.2, 1.2);
				    bossSprite.animations.add('die');
				    bossSprite.type=1;
				    bossSprite.fireRate=0;
				    bossSprite.lastAttack=this.game.time.now+10000;
				    yaperdidoFinal=this.game.time.now+20000; 
				    tiempoReferencia=yaperdidoFinal;
				    boss.sprite=bossSprite;
				  }
			  }
			  if(this.gameoverAnim && this.camera.x+window.innerWidth>=worldsize-bossDominions){
				  if(yaperdido){
					  	bossSprite=boss.sprite;
					    yaperdido=false;
					    boss.sprite.fireRate=0;
					    boss.sprite.lastAttack=this.game.time.now+10000;
					    //yaperdidoFinal=this.game.time.now+20000; 
					  }
				  yaperdidoFinal=this.game.time.now; 
				  tiempoReferencia=yaperdidoFinal;
				  this.gameoverAnim=false;
			  }
			  if(!yaperdido && this.game.time.now>= yaperdidoFinal+5000){
				  window.location='finJuego2.html' 
			  }
			  if(frames==0){
				  window.location='finJuego2.html'
			  }
		}
};

game.state.add("Game", PhaserGame, true);

