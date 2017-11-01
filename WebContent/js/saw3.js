function test(){
	
	var valor1=document.getElementById("caja1").value;
	if(valor1=='93'){
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
var explicacion0Sound;
var explicacionSound;
var musicSound;
var gritoSound;
var time2Death;
var ready2Die=false;
var ready2Anim=false;
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
			this.load.image('soporte', 'img/saw3/soporte.png');
			this.load.image('cuerda', 'img/saw3/cuerda.png');
			this.load.image('vela', 'img/saw3/vela.png');
			this.load.image('mazo', 'img/saw3/mazo.png');
			this.load.image('folio', 'img/saw1/folio.png');
			this.load.image('fondo', 'img/saw1/fondo.png');
			
			this.load.atlasJSONHash('vikingo', 'img/saw3/vikingo.png', 'img/saw3/vikingo.json');
			
			this.load.audio('explicacion0', 'sounds/saw0b.mp3');
			this.load.audio('explicacion', 'sounds/saw3.mp3');
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
			var imageVela = this.cache.getImage('vela');
			var velaSize=imageVela.height*ratioY;

			this.velaSprite=this.add.sprite(game.width*0.47, game.height*0.5-velaSize,'vela');
			this.velaSprite.scale.setTo(ratioX,ratioY);
			this.soporteSprite=this.add.sprite(0, 0,'soporte');
			this.soporteSprite.scale.setTo(ratioX,ratioY);
			this.mazoSprite=this.add.sprite(game.width*0.255, game.height*0.3,'mazo');
			this.mazoSprite.anchor.set(0.5, 0.3);
			this.mazoSprite.scale.setTo(ratioX*1.2,ratioY*1.2);
			this.cuerdaSprite=this.add.sprite(0, 0,'cuerda');
			this.cuerdaSprite.scale.setTo(ratioX,ratioY);
			
			//var coordYAplastador=game.height-imageAplastador.height*ratioY;
			
		/*	 this.shark=this.add.sprite(game.width*0.08, game.height*0.55, 'tiburon', 0);
			 anim = this.shark.animations.add('swim');
			 anim.play(15,true, false);*/
			
			this.vikingoSprite=this.add.sprite(game.width*0.17, game.height*0.48, 'vikingo', 'vikingo secuestrado/0000');
			this.vikingoSprite.animations.add('idle', Phaser.Animation.generateFrameNames('vikingo secuestrado/', 0, 22, '', 4), 15, true, false);
			this.vikingoSprite.animations.add('hurry', Phaser.Animation.generateFrameNames('vikingo secuestrado/', 0, 22, '', 4), 30, true, false);
			this.vikingoSprite.animations.add('saved', Phaser.Animation.generateFrameNames('vikingo liberado/', 0, 28, '', 4), 20, true, false);
			this.vikingoSprite.animations.add('death', Phaser.Animation.generateFrameNames('vikingo muerto/', 0, 40, '', 4), 20, false, false);
			this.vikingoSprite.animations.play('idle');
			this.vikingoSprite.scale.setTo(2.6*ratioX,2.6*ratioY);
			//this.vikingoSprite.y=-this.vikingoSprite.height+this.vikingoSprite.height*0.08;
		
			var imageFolio = this.cache.getImage('folio');
			var folioSprite=this.add.sprite(game.width-imageFolio.width*ratioX, 0,'folio');
			folioSprite.scale.setTo(ratioX,ratioY);
			
			explicacionSound = this.add.audio('explicacion');
			explicacion0Sound = this.add.audio('explicacion0');
		    musicSound = this.add.audio('music');
		    gritoSound = this.add.audio('grito');

			style = { font: "20px Arial", wordWrap: true, wordWrapWidth: folioSprite.width-20, align: "center" };
			
		    
		    
			pasoXRefresh=(game.height*0.34-this.velaSprite.y)/totalSecondsLocal;
			
			explicacion0Sound.play();
			explicacion0Sound.onStop.add(function(){
				musicSound.loopFull(0.6);
				explicacionSound.play();
			}, this);

			explicacionSound.onStop.add(function(){
				ws.send("localSession");
				initializeClock('clockdiv');
				text = this.add.text(0, 0, "Dime la suma de las edades de los presentes en la casa nacidos en año mayor a 1980 e impar", style);
			    text.anchor.set(0.5);
			    text.x = Math.floor(folioSprite.x + folioSprite.width / 2);
			    text.y = Math.floor(folioSprite.y + folioSprite.height / 6);
				inicioPrueba=true;
			}, this);
			
			ws.onmessage = function(message){
				//alert(message.data)
				if(message.data=="pista"){
					if(!pista1Vis){
						pista1 = globalGame.add.text(0, 0, "PISTA 1: El resultado es mayor que 80", style);
					    pista1.anchor.set(0.5);
					    pista1.x = Math.floor(folioSprite.x + folioSprite.width / 2);
					    pista1.y = Math.floor(folioSprite.y + 2*folioSprite.height /6 );
						pista1Vis=true;
					}else if(!pista2Vis){
						  pista2 = globalGame.add.text(0, 0, "PISTA 2: 4 personas cumplen los requisitos", style);
						  pista2.anchor.set(0.5);
						  pista2.x = Math.floor(folioSprite.x + folioSprite.width / 2);
						  pista2.y = Math.floor(folioSprite.y + 3*folioSprite.height / 6);
						  pista2Vis=true;
					}else if(!pista3Vis){
						 pista3 = globalGame.add.text(0, 0, "PISTA 3: EL resultado es múltiplo de 3", style);
						 pista3.anchor.set(0.5);
						 pista3.x = Math.floor(folioSprite.x + folioSprite.width / 2);
						 pista3.y = Math.floor(folioSprite.y + 4*folioSprite.height / 6-10);		
						 pista3Vis=true;
					}
				}
			}
		},
		
		hurryUp: function(){
			this.vikingoSprite.animations.play('hurry');
		},
		timeout: function(){
			ws.send("muerte0");
			this.cuerdaSprite.kill();
			this.killed=true;
			time2Death=this.game.time.now;
			ready2Die=true;
			ready2Anim=true;
			this.mazoSprite.body.angularVelocity=-240;
			//this.vikingoSprite.animations.play('death');
			
		},
		solved: function(){
			this.solvedValue=true;
			if(totalSecondsLocal>0){
				clearInterval(timeinterval);
				//this.caballeroSprite.y=this.caballeroSprite.y-this.caballeroSprite.height*0.2
				this.vikingoSprite.animations.play('saved');
			}
		},
		
		update: function(){
			if(inicioPrueba){
				if(ready2Die && this.mazoSprite.angle>=1.5){
					ready2Die=false;
					this.mazoSprite.body.angularVelocity=0;
				}
				if(ready2Anim && this.mazoSprite.angle>=1.2){
					ready2Anim=false;
					gritoSound.play();
					this.vikingoSprite.animations.play('death');
				}
				if(!this.solvedValue){
					if(!this.killed && startCountDown){
						if(segundoRemanente!=totalSecondsLocal){
							segundoRemanente=totalSecondsLocal;
							this.velaSprite.y=this.velaSprite.y+pasoXRefresh;;
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

