(function() {

// ------------------------------------------------------ E R R O R
window.onerror = function(msg, url, linenumber) {
    alert('OOOPS A FUCKING ERROR : '+msg+'\nURL: '+url+'\nLine Number: '+linenumber);
    return true;
}

bodyScrollLock.disableBodyScroll(document.body);

// ----------------------------------------------------------------------------- W I N D O W  L O C A T I O N
if (location.protocol != 'http:') {
    location.href = 'http:' + window.location.href.substring(window.location.protocol.length);
}

document.addEventListener('click', e => {
    console.log(e.target);
});


// ----------------------------------------------------------------------------- D Y N A M I C  E L E M E N T S
var backgroundX = document.getElementById('back-boi');

var user = {
    colour: location.search.replace(/^.*?\=/, '').length ? location.search.replace(/^.*?\=/, '') : 2
};

var canTransition = false;


// ----------------------------------------------------------------------------- S O C K E T . I O
// var socket = io.connect('http://avd.local:8080');
var socket = io.connect('http://192.168.4.1:8080');
// var socket = io.connect('http://192.168.1.83:8080');


socket.on('connect', function(data) {
   user.id = socket.id;

   socket.on('other_heart', data => { // someone else has liked something
        otherHeart(data.colour);
   });

   socket.on('background_update', data => { // background gradient has changed
       backgroundX.style.background = data.newGradient;
   });

});


// ----------------------------------------------------------------------------- D E V I C E  O R I E N T A T I O N  F O R  T R A N S I T I O N I N G
window.addEventListener("deviceorientation", handleOrientation, true);
var transitionActive = false;
var transitionCounter = 3;
var transitionInterval;

function handleOrientation(event) {
    if (canTransition) {
        var alpha = event.alpha;
        var beta = event.beta;
        var gamma = event.gamma;

        if ((beta > 130 || beta < -150) && (gamma < 40 && gamma > -40)) {
            if (!transitionActive) {
                transitionActive = true;
                document.getElementById('transition-counter').innerText = '3'; // reset the counter to 3
                $('#cassie').css("opacity", "0");
                $('#transition-wrap').fadeIn(400);
                $('#heart-wrap').css("opacity", "0");

                transitionInterval = setInterval(() => { // setInterval to provide the countdown
                    transitionCounter--;

                    if (transitionCounter < 3) {
                        document.getElementById('transition-counter').innerText = transitionCounter;
                    }

                    if (transitionCounter === 0) { // user is now transitioning / only fires once
                        document.getElementById('transition-counter').innerText = ':)';
                        setTimeout(() => {
                            document.getElementById('transition-counter').innerText = ';)';
                        }, 80);
                        setTimeout(() => {
                            document.getElementById('transition-counter').innerText = ':)';
                        }, 300);
                        clearInterval(transitionInterval);
                        setTimeout(() => {
                            try {
                                // location.href = `http://192.168.1.83:8080/jon_arbuckle?colour=${user.colour}`;
                                location.href = `http://192.168.4.1:8080/jon_arbuckle?colour=${user.colour}`;
                                // location.href = `http://avd.local:8080/jon_arbuckle?colour=${user.colour}`;
                            } catch (e) {
                                $('#transition-counter').hide();
                                $('#redirect').show();
                            }
                        }, 500)
                        transitionCounter = 3;
                    }
                }, 1000);
            }
        } else {
            if (transitionActive === true) { // if they were transitioning they aren't now
                transitionActive = false;
                transitionCounter = 3;
                $('#cassie').css("opacity", "1");
                $('#heart-wrap').css("opacity", "1");
                $('#transition-wrap').fadeOut(400);
                document.getElementById('transition-counter').innerText = ':('
                clearInterval(transitionInterval);
            }
        }
    }
}


// ----------------------------------------------------------------------------- H E A R T  C A N V A S
// ----------------------------------------- appending canvas with full screen dimensions
$('body').append(`<canvas id="heartCanvas" height=${window.innerHeight} width=${window.innerWidth} />`);
document.getElementById('heartCanvas').style.zIndex = 104;


// ----------------------------------------- loading heart image to stop canvas bug fuckery
var heart1 = new Image();
heart1.src = 'images/peachpuff_heart.png';
var heart2 = new Image();
heart2.src = 'images/deeppink_heart.png';
var heart3 = new Image();
heart3.src = 'images/blue_heart.png';
var heart4 = new Image();
heart4.src = 'images/darkslategrey_heart.png';


var heartID = 1;

var heartCanvas = document.getElementById('heartCanvas');
var heartContext = heartCanvas.getContext('2d');
var heartCooldown = false;
var heartSettings = { // these are the settings for the hearts
    heartHeight: 100,
    heartWidth: 120,
    hearts: [], // an array for all current hearts on screen and their properties
    minScale: 0.8,
    w: window.innerWidth,
    h: window.innerHeight
}

function otherHeart(colourX) { // someone elses heart
    // canvasCheckCounter = 0;
    // canvasActive = true;

    // --------------------- random settings for individual heart
    var scale = (Math.random() * (1 - heartSettings.minScale)) + heartSettings.minScale;
    heartSettings.hearts.push({
        id: heartID,
        x: window.innerWidth - 193,
        y: window.innerHeight - 170,
        ys: Math.random() - 20,
        height: scale * heartSettings.heartHeight,
        width: scale * heartSettings.heartWidth,
        opacity: scale,
        xVar: -3,
        xRando: Math.random() >= 0.5 ? -Math.floor(Math.random() * 5) : Math.floor(Math.random() * 5),
        colour: colourX == 1 ? heart1 : colourX == 2 ? heart2 : colourX == 3 ? heart3 : heart4
    });
    heartID++;
}

function heartClick() { // the user has created a heart
    // canvasCheckCounter = 0;
    // canvasActive = true;

    if (heartCooldown === true) { // --------------------------- this is how to throttle the number of hearts the user can spam
        return;
    }
    heartCooldown = true;
    setTimeout(() => {
        heartCooldown = false
    }, 100);


    socket.emit('newHeart', {colour: user.colour, userPosition: 'cassie'}); // sends heart to the server so it can be emitted for everyone else


    // --------------------- random settings for individual heart
    var scale = (Math.random() * (1 - heartSettings.minScale)) + heartSettings.minScale;
    heartSettings.hearts.push({
        id: heartID,
        x: window.innerWidth - 193,
        y: window.innerHeight - 170,
        ys: Math.random() - 20,
        height: scale * heartSettings.heartHeight,
        width: scale * heartSettings.heartWidth,
        opacity: scale,
        xVar: -3,
        xRando: Math.random() >= 0.5 ? -Math.floor(Math.random() * 5) : Math.floor(Math.random() * 5),
        colour: user.colour == 1 ? heart1 : user.colour == 2 ? heart2 : user.colour == 3 ? heart3 : heart4
    });
    heartID++;
}

function heartsMove() { // ---------------------------------------- gets called at the end of drawHearts / changes the position of the hearts to make them float up the screen
    for (var i = 0; i < heartSettings.hearts.length; i++) {
        var heart = heartSettings.hearts[i];
        heart.y += heart.ys;
        heart.x = heart.x + heart.xVar;
        heart.xVar = heart.xVar + 0.04;
        if (heart.xVar > -2.6) {
            heart.xVar = (heart.xVar / 5) + heart.xRando;
        }
        if (heart.y < -100) { // this removes the heart if it above the screen
            heartSettings.hearts = heartSettings.hearts.filter(heartX => heartX.id !== heart.id)
        }
    }
}

function drawHearts() { // ---------------------------------------- gets called in the setInterval every 35ms to draw every heart on the canvas
    heartContext.clearRect(0, 0, heartSettings.w, heartSettings.h);
    for (var i = 0; i < heartSettings.hearts.length; i++) {
        var heart = heartSettings.hearts[i];
        heartContext.globalAlpha = heart.opacity;
        heartContext.drawImage (heart.colour, heart.x, heart.y, heart.width, heart.height);
    }

    heartsMove();
}


setInterval(drawHearts, 35); // only use if not using the function at bottom to determine if should be drawing

function logStats() {
    $.get('/logStats', data => {
        console.log(data.likes, data.gradient);
    });
}

// ----------------------------------------------------------------------------- D Y N A M I C  T U T O R I A L  C L I C K  E V E N T
function closeTutorial(e) {
    removeTutorialClick(9); // make sure the only id clickable is the specific wrap
    canTransition = true;
}


function removeTutorialClick(tutorial_num) {
    $(`#position-${tutorial_num}`).off('click', closeTutorial);
    $(`#position-${tutorial_num}`).fadeOut(500);
}


function giveTutorialClick(tutorial_num) { // --------------------- dynamically give the click event listener to tutorial screens, once clicked it will remove the event listener
    $(`#position-${tutorial_num}`).on('click', closeTutorial);
}

setTimeout(() => {
    document.getElementById('cassieName').classList.add('flash2');
    setTimeout(() => {
        $('#position-9 .tutorialX').text('> tap <');
        giveTutorialClick(9); // -------------------------------------- giving click event listener to tutorial 1 once all have transitioned etc...
    }, 1600);
}, 800);

$('#heartSVG').bind('touchend', function(e) {
    e.preventDefault(); // meant to stop zooming in on heart-wrap when spam clicking
    heartClick(); // sends heart
});

game = new Phaser.Game(window.innerWidth, window.innerHeight, Phaser.CANVAS, document.getElementById('bang'), { preload: preload, create: create, update: update });
function preload() {
game.scale.scaleMode = Phaser.ScaleManager.aspectRatio;
game.scale.pageAlignVertically = true;
game.scale.pageAlignHorizontally = true;
game.physics.startSystem(Phaser.Physics.ARCADE);
//game.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL;
//game.scale.refresh();
game.load.image("bush2", "mcquater/exploding/bush2.png");
game.load.image("bush1", "mcquater/exploding/bush1.png");
game.load.image("cactus", "mcquater/exploding/cactus.png");
game.load.image("boulder1", "mcquater/exploding/boulder1.png");
game.load.image("boulder2", "mcquater/exploding/boulder2.png");
game.load.image("boulder3", "mcquater/exploding/boulder3.png");
game.load.image("checkers", "mcquater/exploding/checkers.png");
game.load.image("fogsand1","mcquater/exploding/fogsand3.png");
game.load.spritesheet("arcade1","mcquater/exploding/arcade1.png",56,80);
game.load.spritesheet("bird","mcquater/exploding/bird.png",27,32);
game.load.spritesheet("rain","mcquater/exploding/rain.png",255.5,222);
game.load.image("billboard02", "mcquater/exploding/billboard02.png");
game.load.image("billboard04", "mcquater/exploding/billboard04.png");
game.load.image("cloud1","mcquater/exploding/cloud1.png");
game.load.image("cloud2","mcquater/exploding/cloud2.png");
game.load.spritesheet("explosionCloud","mcquater/exploding/explosionCloud.png",200,280);
game.load.spritesheet("birds","mcquater/exploding/birds.png",60,48);
game.load.spritesheet("genieSmoke","mcquater/exploding/genieSmoke.png",84, 86);

game.stage.backgroundColor = "#e9ff00";
}

// scaleRatio = 3;
scaleRatio = 1.8;
//when creatung each asset, set it this way:
// .scale.setTo(scaleRatio, scaleRatio);

var boomStyleCloud = { font: "16px Courier", fill: "#fff"};
function create(){
// $("head").append('<meta id="cassieMeta" name="viewport" content="initial-scale=1">')
//bg flow
var myBitmap = game.add.bitmapData(game.world.width, game.world.height);
var grd=myBitmap.context.createLinearGradient(0,0,0,1000);
grd.addColorStop(0,"#ffd8a8");
grd.addColorStop(1,"#e4c196");
myBitmap.context.fillStyle=grd;
myBitmap.context.fillRect(0,0,game.world.width, game.world.height);
var changeIt = game.add.sprite(0,0, myBitmap);
changeIt.alpha = 0;
game.add.tween(changeIt).to({ alpha: 1 }, 4000).start();
fog = game.add.physicsGroup();
for (var i = 0; i < 10; i++){
fog.create(game.world.randomX, game.world.randomY, 'fogsand1');
fog.setAll("smoothed", false);}
checkers = game.add.physicsGroup();
for (var i = 0; i < 4; i++){
checkers.create(game.world.randomX, game.world.randomY, 'checkers');
checkers.setAll("smoothed", false);}
bushes = game.add.physicsGroup();
copter= game.add.sprite(620,350,"arcade1");
copter.animations.add("copter",[],10,true);
copter.animations.play("copter");
for (var i = 0; i < 10; i++){
bushes.create(game.world.randomX, game.world.randomY, 'bush1');
bushes.create(game.world.randomX, game.world.randomY, 'bush2');
bushes.create(game.world.randomX, game.world.randomY, 'cactus');
bushes.create(game.world.randomX, game.world.randomY, 'boulder1');
bushes.create(game.world.randomX, game.world.randomY, 'boulder2');
bushes.create(game.world.randomX, game.world.randomY, 'boulder3');
bushes.create(game.world.randomX, game.world.randomY, 'billboard02');
bushes.create(game.world.randomX, game.world.randomY, 'billboard04');
bushes.setAll("smoothed", false);}
bushes.sort();
bushes.scale.setTo(scaleRatio, scaleRatio);
//rain rain go away
background= game.add.tileSprite(0, 0,  game.world.width,game.world.height, 'rain');
background.animations.add("rai",[],10,true);
background.animations.add("rain",[],10,true);
background.animations.play("rain");
background.scale.setTo(scaleRatio, scaleRatio);
//clouds
cloudGroup = game.add.group();
cloudGroup.enableBody = true;
cloudGroupGen = game.time.events.loop(1000, genClouds, this);
cloudGroupGen.timer.start();
//cloud explosion pool
explosionsClouds = game.add.group();
explosionsClouds.enableBody = true;
explosionsClouds.physicsBodyType = Phaser.Physics.ISOARCADE;
explosionsClouds.createMultiple(50, 'explosionCloud');
explosionsClouds.setAll('anchor.x', 0.5);
explosionsClouds.setAll('anchor.y', 1);
explosionsClouds.forEach(function(explosionCloud) {
explosionCloud.animations.add('explosionCloud');
});
game.input.addPointer();
//bird taps
game.input.onTap.add(onTap, this);
//genie smoke explosion pool
genieSmokes = game.add.group();
genieSmokes.enableBody = true;
genieSmokes.physicsBodyType = Phaser.Physics.ISOARCADE;
genieSmokes.createMultiple(10, 'genieSmoke');
genieSmokes.setAll('anchor.x', 0.5);
genieSmokes.setAll('anchor.y', 1);
genieSmokes.forEach(function(genieSmoke) {
genieSmoke.animations.add('genieSmoke');
genieSmoke.scale.setTo(scaleRatio, scaleRatio);
});
};
function update(){
//fps adjustment for all devices
deltaTime = (game.time.elapsedMS) / 25;
bushes.sort('y', Phaser.Group.SORT_ASCENDING);
}
function onTap(pointer,doubletap){
if (doubletap){
var velocityX = game.rnd.integerInRange(90, 120);
bird = game.add.sprite(game.input.activePointer.position.x,game.input.activePointer.position.y,"birds");
bird.alpha=0;
birdTween = game.add.tween(bird).to( { alpha: 1 }, 800, "Linear", true);
bird.smoothed=false;
bird.scale.x=-1;
bird.anchor.setTo(0.5, 0.5);
game.physics.arcade.enableBody(bird);
bird.enableBody = true;
bird.inputEnabled = true;
bird.animations.add("bird",[],10,true);
bird.animations.play("bird")
bird.body.velocity.x = velocityX * deltaTime;
var genieSmoke = genieSmokes.getFirstExists(false);
genieSmoke.reset(bird.x-10, bird.y+22, 0);
genieSmoke.play('genieSmoke', 10, false, true);
bird.checkWorldBounds = true;
bird.outOfBoundsKill = true;
bird.scale.setTo(scaleRatio, scaleRatio);
}
}

function genClouds(){
for (var i = 0; i < 1; i++) {
var x = i * 1;
var velocityX = game.rnd.integerInRange(20, 30);
var cloud;
cloud = cloudGroup.getFirstExists(false);
if (!cloud) {
cloud = game.add.sprite(0, 0, 'cloud'+ game.rnd.integerInRange(1,2));
cloud.preUpdate();
cloud.smoothed=false;
cloudGroup.add(cloud);
cloud.anchor.setTo(0.5, 0.5);
game.physics.arcade.enableBody(cloud);
cloud.enableBody = true;
cloud.inputEnabled = true;
//make them explode when clicked on
cloud.events.onInputDown.add(explodeCloud, this);
function explodeCloud(){
var explosionCloud = explosionsClouds.getFirstExists(false);
explosionCloud.reset(cloud.x, cloud.y+150, 0);
explosionCloud.play('explosionCloud', 15, false, true);
explosionCloud.scale.setTo(scaleRatio, scaleRatio);
killCloud = game.add.tween(cloud).to( { alpha: 0 }, 800, "Linear", true);
killCloud.onComplete.add(killC);
function killC(){cloud.kill();}
}}
cloud.anchor.setTo(0.5, 0.5);
cloud.reset(-30,game.world.randomY);
cloud.body.velocity.x = velocityX * deltaTime;
cloud.checkWorldBounds = true;
cloud.outOfBoundsKill = true;
cloud.scale.setTo(scaleRatio, scaleRatio);}}

}());
