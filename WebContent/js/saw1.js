function test(){
	
	var valor1=document.getElementById("caja1").value;
	var valor2=document.getElementById("caja2").value;
	var valor3=document.getElementById("caja3").value;
	if(valor1=='J'&&valor2=='A'&&valor3=='F'){
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


var totalSecondsLocal=299;
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
var explicacion0Sound;
var explicacionSound;
var musicSound;
var gritoSound;
var inicioPrueba=false;

var PhaserGame= function(){
	var aplastadorSprite=null;
	var ninjaSprite=null;
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
			this.load.image('aplastador', 'img/saw1/aplastador.png');
			this.load.image('folio', 'img/saw1/folio.png');
			this.load.image('fondo', 'img/saw1/fondo.png');
			this.load.image('maquina', 'img/saw1/maquina.png');
			
			this.load.spritesheet('humo', 'img/saw1/humo.png',77,97,15);
		
			this.load.atlasJSONHash('ninja', 'img/saw1/ninja2.png', 'img/saw1/ninja2.json');
			
			this.load.audio('explicacion0', 'sounds/saw0b.mp3');
			this.load.audio('explicacion', 'sounds/saw1b.mp3');
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
			var imageAplastador = this.cache.getImage('aplastador');
			var coordYAplastador=game.height-imageAplastador.height*ratioY;
			
			this.ninjaSprite=this.add.sprite(game.width*0.05, coordYAplastador+2*imageAplastador.height*ratioY/5, 'ninja', 'ninjaSecuestrado/0000');
			this.ninjaSprite.animations.add('idle', Phaser.Animation.generateFrameNames('ninjaSecuestrado/', 0, 22, '', 4), 15, true, false);
			this.ninjaSprite.animations.add('hurry', Phaser.Animation.generateFrameNames('ninjaSecuestrado/', 0, 22, '', 4), 30, true, false);
			this.ninjaSprite.animations.add('saved', Phaser.Animation.generateFrameNames('ninjaFeliz/', 0, 22, '', 4), 20, true, false);
			this.ninjaSprite.animations.add('death', Phaser.Animation.generateFrameNames('ninjaMuerto/', 0, 36, '', 4), 15, false, false);
			this.ninjaSprite.animations.play('idle');
			this.ninjaSprite.scale.setTo(2*ratioX,2*ratioY);
			
			explicacionSound = this.add.audio('explicacion');
			explicacion0Sound = this.add.audio('explicacion0');
		    musicSound = this.add.audio('music');
		    gritoSound = this.add.audio('grito');
			
			this.aplastadorSprite=this.add.sprite(game.width/3, coordYAplastador,'aplastador');
			this.aplastadorSprite.scale.setTo(ratioX,ratioY);
			var imageMaquina = this.cache.getImage('maquina');
			var maquinaSprite=this.add.sprite(game.width/2-100, game.height-imageMaquina.height*ratioY,'maquina');
			maquinaSprite.scale.setTo(ratioX,ratioY);
			
			humo = this.add.sprite(maquinaSprite.x+3*maquinaSprite.width/4+10, maquinaSprite.y, 'humo', 1);
			humo.anchor.set(1,0.5);
			animHumo2 = humo.animations.add('fum');
			animHumo2.play(15,true, false);
			
			humo2 = this.add.sprite(maquinaSprite.x+3*maquinaSprite.width/4+30, maquinaSprite.y-30, 'humo', 1);
			humo2.anchor.set(1,0.5);
			animHumo = humo2.animations.add('fum2');
			animHumo.play(15,true, false);
			
			
			var imageFolio = this.cache.getImage('folio');
			var folioSprite=this.add.sprite(game.width-imageFolio.width*ratioX, 0,'folio');
			folioSprite.scale.setTo(ratioX,ratioY);

			style = { font: "20px Arial", wordWrap: true, wordWrapWidth: folioSprite.width-20, align: "center" };
			
		    
		    
			pasoXRefresh=(this.aplastadorSprite.x-this.ninjaSprite.x-this.ninjaSprite.width/3)/totalSecondsLocal;
			
			explicacion0Sound.play();
			explicacion0Sound.onStop.add(function(){
				musicSound.loopFull(0.6);
				explicacionSound.play();
			}, this);

			explicacionSound.onStop.add(function(){
				ws.send("localSession");
				initializeClock('clockdiv');
				text = this.add.text(0, 0, "El código se encuentra custodiado por los causantes de la mayoría de las risas, aunque también llantos,\n que inundan esta casa.", style);
			    text.anchor.set(0.5);
			    text.x = Math.floor(folioSprite.x + folioSprite.width / 2);
			    text.y = Math.floor(folioSprite.y + folioSprite.height / 6);
				inicioPrueba=true;
			}, this);
			
		//	ws.send("localSession");
			ws.onmessage = function(message){
				//alert(message.data)
				if(message.data=="pista"){
					if(!pista1Vis){
						pista1 = globalGame.add.text(0, 0, "PISTA 1: El código está sepultado bajo multitud de vehículos de todo tipo", style);
					    pista1.anchor.set(0.5);
					    pista1.x = Math.floor(folioSprite.x + folioSprite.width / 2);
					    pista1.y = Math.floor(folioSprite.y + 2*folioSprite.height /6 );
						pista1Vis=true;
					}else if(!pista2Vis){
						  pista2 = globalGame.add.text(0, 0, "PISTA 2: No pienses a lo grande...", style);
						  pista2.anchor.set(0.5);
						  pista2.x = Math.floor(folioSprite.x + folioSprite.width / 2);
						  pista2.y = Math.floor(folioSprite.y + 3*folioSprite.height / 6);
						  pista2Vis=true;
					}else if(!pista3Vis){
						 pista3 = globalGame.add.text(0, 0, "PISTA 3: ...porque todo cabe en una caja", style);
						 pista3.anchor.set(0.5);
						 pista3.x = Math.floor(folioSprite.x + folioSprite.width / 2);
						 pista3.y = Math.floor(folioSprite.y + 4*folioSprite.height / 6-10);		
						 pista3Vis=true;
					}
				}
			}
		},
		
		hurryUp: function(){
			this.ninjaSprite.animations.play('hurry');
		},
		timeout: function(){
			this.killed=true;
			gritoSound.play();
			this.ninjaSprite.animations.play('death');
			humo.kill();
			humo2.kill();
			ws.send("muerte2");
		},
		solved: function(){
			this.solvedValue=true;
			if(totalSecondsLocal>0){
				clearInterval(timeinterval);
				this.ninjaSprite.y=this.ninjaSprite.y-this.ninjaSprite.height*0.2
				this.ninjaSprite.animations.play('saved');
				humo.kill();
				humo2.kill();
			}
		},
		
		update: function(){
			if(inicioPrueba){
				if(!this.solvedValue){
					if(!this.killed && startCountDown){
						if(segundoRemanente!=totalSecondsLocal){
							segundoRemanente=totalSecondsLocal;
							this.aplastadorSprite.x=this.aplastadorSprite.x-pasoXRefresh;
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
			alert("entra");
			item.alpha=0.5;
		},
		out: function(item){
			item.alpha=1;
		}
};

game.state.add("saw1", PhaserGame, true);

