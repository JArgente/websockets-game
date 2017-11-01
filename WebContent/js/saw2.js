function test(){
	
	var valor1=document.getElementById("caja1").value;
	var valor2=document.getElementById("caja2").value;
	if(valor1=='0'&&valor2=='8'){
		globalGame.solved();
	}
}

function abrirCofre(){
	document.getElementById("mapaFinal").style.display="block";
}

function initializeClock(id){
	  var clock = document.getElementById(id);
	  timeinterval = setInterval(function(){
		  var seconds = Math.floor( totalSecondsLocal % 60 );
		  var minutes = Math.floor( (totalSecondsLocal/60) % 60 );
		  document.getElementById("min0").innerHTML=minutes%10;
		  document.getElementById("seg0").innerHTML=seconds%10;
		  
		  document.getElementById("min1").innerHTML=Math.floor(minutes/10);
		  document.getElementById("seg1").innerHTML=Math.floor(seconds/10);

	    if(totalSecondsLocal<=0){
	      clearInterval(timeinterval);
	    }
	    if(totalSecondsLocal==secondsToHurry){
	    	globalGame.hurryUp();
	    }
	    totalSecondsLocal--;
	    startCountDown=true;
	  },1000);
	}


var totalSecondsLocal=59;
var secondsToHurry=Math.floor(totalSecondsLocal/2)-1;
var segundoRemanente=totalSecondsLocal;

var game = new Phaser.Game("100%", "100%", Phaser.AUTO, 'phaser-example');

var ws;
var globalGame=null;
var pasoXRefresh;
var startCountDown=false;
var timeinterval;
var humo;
var humo2;
var ratioX;
var ratioY;
var pista1Vis=false;
var pista2Vis=false;
var pista3Vis=false;
var style;
var inicioPrueba=false;

var PhaserGame= function(){
	var cofreSprite=null;
	var solvedValue=false;
	var primeraEmocion=true;
	var killed;
}

PhaserGame.prototype = {
		init: function(){
			ws = new WebSocket("ws://localhost:8080/QuanticTravel/saw");
			this.game.renderer.renderSession.roundPixels = true;

            this.physics.startSystem(Phaser.Physics.ARCADE);
		},
		preload: function() {
			this.load.image('grua', 'img/saw2/grua.png');
			this.load.image('folio', 'img/saw1/folio.png');
			this.load.image('fondo', 'img/saw1/fondo.png');
			this.load.image('cuerda', 'img/saw2/cuerdaCaballero.png');
			
			this.load.spritesheet('tiburon', 'img/saw2/tiburon.png',331,108,40);
			this.load.atlasJSONHash('caballero', 'img/saw2/caballero2.png', 'img/saw2/caballero2.json');
			
			this.load.audio('explicacion0', 'sounds/saw0b.mp3');
			this.load.audio('explicacion', 'sounds/saw2.mp3');
			this.load.audio('music', 'sounds/sawMusic.mp3');
			this.load.audio('grito', 'sounds/grito.mp3');
		},

		create: function () {
			globalGame=this;
			this.primeraEmocion=true;
			this.killed=false;
			
			var back=this.add.sprite(0, 0,'fondo');
			ratioX=game.width/back.width;
			ratioY=game.height/back.height;
			back.height=game.height;
			back.width=game.width;

			this.world.enableBody= true;
			var imageCaballero = this.cache.getImage('caballero', 'caballeroSecuestrado/0000');
			var coordYCaballero=imageCaballero.height*ratioY*0.2;

			this.gruaSprite=this.add.sprite(0, 0,'grua');
			this.gruaSprite.scale.setTo(ratioX,ratioY);
			
			//var coordYAplastador=game.height-imageAplastador.height*ratioY;
			
			this.shark=this.add.sprite(game.width*0.08, game.height*0.55, 'tiburon', 0);
			this.shark.scale.setTo(3*ratioX,3*ratioY);
			anim = this.shark.animations.add('swim');
			anim.play(15,true, false);
			
			this.cuerdaSprite=this.add.sprite(game.width*0.23, 0,'cuerda');
			this.cuerdaSprite.scale.setTo(3*ratioX,3*ratioY);

			this.caballeroSprite=this.add.sprite(game.width*0.25, 0, 'caballero', 'caballeroSecuestrado2/0000');
			this.caballeroSprite.anchor.set(0.5,0);
			this.caballeroSprite.animations.add('idle', Phaser.Animation.generateFrameNames('caballeroSecuestrado2/', 0, 22, '', 4), 15, true, false);
			this.caballeroSprite.animations.add('hurry', Phaser.Animation.generateFrameNames('caballeroSecuestrado2/', 0, 22, '', 4), 30, true, false);
			this.caballeroSprite.animations.add('saved', Phaser.Animation.generateFrameNames('caballeroLiberado2/', 0, 21, '', 4), 20, true, false);
			this.caballeroSprite.animations.add('death', Phaser.Animation.generateFrameNames('caballeroMuerto2/', 0, 81, '', 4), 20, false, false);
			this.caballeroSprite.animations.play('idle');
			this.caballeroSprite.scale.setTo(2*ratioX,2*ratioY);
			this.caballeroSprite.y=-this.caballeroSprite.height*0.5;
			
			this.cuerdaSprite.y=-this.cuerdaSprite.height+this.caballeroSprite.height*0.25;
		
			explicacionSound = this.add.audio('explicacion');
			explicacion0Sound = this.add.audio('explicacion0');
		    musicSound = this.add.audio('music');
		    gritoSound = this.add.audio('grito');
			
			var imageFolio = this.cache.getImage('folio');
			var folioSprite=this.add.sprite(game.width-imageFolio.width*ratioX, 0,'folio');
			folioSprite.scale.setTo(ratioX,ratioY);

			style = { font: "20px Arial", wordWrap: true, wordWrapWidth: folioSprite.width-20, align: "center" };
			

			pasoXRefresh=(game.height*0.45-this.caballeroSprite.y)/totalSecondsLocal;
			
			explicacion0Sound.play();
			explicacion0Sound.onStop.add(function(){
				musicSound.loopFull(0.6);
				explicacionSound.play();
			}, this);

			explicacionSound.onStop.add(function(){
				ws.send("localSession");
				initializeClock('clockdiv');
				text = this.add.text(0, 0, "Dime el número de CUADROS que hay colgados en casa", style);
			    text.anchor.set(0.5);
			    text.x = Math.floor(folioSprite.x + folioSprite.width / 2);
			    text.y = Math.floor(folioSprite.y + folioSprite.height / 6);
				inicioPrueba=true;
			}, this);
			
			ws.onmessage = function(message){
				//alert(message.data)
				if(message.data=="pista"){
					if(!pista1Vis){
						pista1 = globalGame.add.text(0, 0, "PISTA 1: Los espejos no son cuadros", style);
					    pista1.anchor.set(0.5);
					    pista1.x = Math.floor(folioSprite.x + folioSprite.width / 2);
					    pista1.y = Math.floor(folioSprite.y + 2*folioSprite.height /6 );
						pista1Vis=true;
					}else if(!pista2Vis){
						  pista2 = globalGame.add.text(0, 0, "PISTA 2: Los adornos tampoco", style);
						  pista2.anchor.set(0.5);
						  pista2.x = Math.floor(folioSprite.x + folioSprite.width / 2);
						  pista2.y = Math.floor(folioSprite.y + 3*folioSprite.height / 6);
						  pista2Vis=true;
					}else if(!pista3Vis){
						 pista3 = globalGame.add.text(0, 0, "PISTA 3: Hay menos de 10", style);
						 pista3.anchor.set(0.5);
						 pista3.x = Math.floor(folioSprite.x + folioSprite.width / 2);
						 pista3.y = Math.floor(folioSprite.y + 4*folioSprite.height / 6-10);		
						 pista3Vis=true;
					}
				}
			}
		},
		
		hurryUp: function(){
			this.caballeroSprite.animations.play('hurry');
		},
		timeout: function(){
			ws.send("muerte1");
			this.shark.kill();
			gritoSound.play();
			this.killed=true;
			var coordy=this.caballeroSprite.body.y;
			animDeath=this.caballeroSprite.animations.play('death');
			animDeath.onComplete.add(function(){
				this.shark=this.add.sprite(game.width*0.08, game.height*0.55, 'tiburon', 0);
				 anim = this.shark.animations.add('swim');
				 anim.play(15,true, false);
    		}, this);
			this.caballeroSprite.body.y=coordy;
		},
		solved: function(){
			this.solvedValue=true;
			if(totalSecondsLocal>0){
				clearInterval(timeinterval);
				//this.caballeroSprite.y=this.caballeroSprite.y-this.caballeroSprite.height*0.2
				this.caballeroSprite.animations.play('saved');
			}
		},
		
		update: function(){
			if(inicioPrueba){
				if(!this.solvedValue){
					if(!this.killed && startCountDown){
						if(segundoRemanente!=totalSecondsLocal){
							segundoRemanente=totalSecondsLocal;
							this.caballeroSprite.y=this.caballeroSprite.y+pasoXRefresh;
							this.cuerdaSprite.y=this.cuerdaSprite.y+pasoXRefresh;;
							if(totalSecondsLocal<0){
								this.timeout();
							}
						}
					}
				}else{
					if(this.primeraEmocion){
						 document.getElementById("cofreCerrado").style.display="none";
						 document.getElementById("cofreAbierto").style.display="block";
	
						this.primeraEmocion=false;
					}
				}
			}
		},
		over: function(item){
			item.alpha=0.5;
		},
		out: function(item){
			item.alpha=1;
		}
};

game.state.add("saw2", PhaserGame, true);

