(function() {

// ------------------------------------------------------ E R R O R
window.onerror = function(msg, url, linenumber) {
    alert('OOPS AN ERROR  -  :S  -  Please refresh the page.');
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

var user = {};
var canTransition = false;


// ----------------------------------------------------------------------------- S O C K E T . I O
// var socket = io.connect('http://avd.local:8080');
var socket = io.connect('http://192.168.4.1:8080');
// var socket = io.connect('http://192.168.1.65:8080');
// var socket = io.connect('http://192.168.1.83:8080');


socket.on('connect', function(data) {
   user.id = socket.id;
   socket.on('my_colour', data => { // happens when user connects / sets heart colour / changes background gradient / updates artist list
       user.colour = data.colour;
       if (location.search.replace(/^.*?\=/, '').length) {
           console.log('colour overwritten');
           user.colour = location.search.replace(/^.*?\=/, '')
       }
       backgroundX.style.background = data.backgroundColour;

       var artistLiArray = document.getElementsByTagName('li');
       for (var i = 0; i < artistLiArray.length; i++) {
           artistLiArray[i].innerText = data.list[i];
       }
   });

   socket.on('other_heart', data => { // someone else has liked something
        otherHeart(data.colour);
   });

   socket.on('update_user_count', data => { // users connected has updated
       var span = document.getElementById('online-users');
       span.innerText = data.onlineUsers;
       span.classList.add('flash');
       setTimeout(() => {
           span.classList.remove('flash');
       }, 300);
   });

   socket.on('background_update', data => { // background gradient has changed
       backgroundX.style.background = data.newGradient;
   });

   socket.on('artist_list_update', data => { // artist list has changed
       var artistLiArray = document.getElementsByTagName('li');
       for (var i = 0; i < artistLiArray.length; i++) {
           artistLiArray[i].innerText = data.list[i];
       }
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
                $('#position-0').css("opacity", "0");
                $('#transition-wrap').fadeIn(400);

                transitionInterval = setInterval(() => { // setInterval to provide the countdown
                    transitionCounter--;

                    if (transitionCounter < 3) {
                        document.getElementById('transition-counter').innerText = transitionCounter
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
                                // location.href = `http://192.168.1.83:8080/john_flindt?colour=${user.colour}`;
                                location.href = `http://192.168.4.1:8080/john_flindt?colour=${user.colour}`;
                                // location.href = `http://avd.local:8080/john_flindt?colour=${user.colour}`;
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
                $('#position-0').css("opacity", "1");
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

var loadingScreen = document.getElementById('loading-wrap');

function enter() {
    $('#loading-wrap').fadeOut(100);
    $('#position-0').fadeIn(800).css("display", "flex");
    loadingScreen.removeEventListener('click', enter);
    canTransition = true;
}

loadingScreen.addEventListener('click', enter);

}());
