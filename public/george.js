(function() {

// ------------------------------------------------------ E R R O R
window.onerror = function(msg, url, linenumber) {
    alert('OOPS AN ERROR  -  :S  -  it will be fine');
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
// var socket = io.connect('http://192.168.4.1:8080');
var socket = io.connect('http://192.168.1.83:8080');


socket.on('connect', function(data) {
   user.id = socket.id;

   socket.on('other_heart', data => { // someone else has liked something
        otherHeart(data.colour);
   });

   socket.on('background_update', data => { // background gradient has changed
       backgroundX.style.background = data.newGradient;
   });

   socket.on('my_colour', data => { // happens when user connects / sets heart colour / changes background gradient / updates artist list
       backgroundX.style.background = data.backgroundColour;
   });


});

//GEORGE LOAD
var georgeToLoadVid = document.getElementsByClassName('georgeVid');

for (var i = 0; i < georgeToLoadVid.length; i++) {
    georgeToLoadVid[i].src = `/george/SN_0${i + 1}.mp4`;
}

$('#position-7').on('click', georgeLoad);

function georgeLoad() {
    $('#position-7').off('click', georgeLoad);
    $('#position-7 .tutorialX').text('loading...');
    // var georgeToLoadVid = document.getElementsByClassName('georgeVid');
    for (var i = 0; i < georgeToLoadVid.length; i++) {
        setTimeout(pauseGeorgeVideos, 10000)
        // georgeToLoadVid[i].src = `/george/SN_0${i + 1}.mp4`;
        georgeToLoadVid[i].play();
    }
    setTimeout(() => {
        $('#position-7 .tutorialX').text('> enter <');
        giveTutorialClick(7); // -------------------------------------- giving click event listener to tutorial 1 once all have transitioned etc...
    }, 11000);
}

var needToPause = true;

function pauseGeorgeVideos() {
    if (needToPause) {
        needToPause = false;
        var georgeToPauseVid = document.getElementsByClassName('georgeVid');
        for (var i = 0; i < georgeToPauseVid.length; i++) {
            georgeToPauseVid[i].pause();
            georgeToPauseVid[i].currentTime = 0;
        }
    }
}


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
                $('#george').css("opacity", "0");
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
                                location.href = `http://192.168.1.83:8080/cassie_mcquater?colour=${user.colour}`;
                                // location.href = `http://192.168.4.1:8080/cassie_mcquater?colour=${user.colour}`;
                                // location.href = `http://avd.local:8080/cassie_mcquater?colour=${user.colour}`;
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
                $('#george').css("opacity", "1");
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


    socket.emit('newHeart', {colour: user.colour, userPosition: 'george'}); // sends heart to the server so it can be emitted for everyone else


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
    removeTutorialClick(7); // make sure the only id clickable is the specific wrap
}


function removeTutorialClick(tutorial_num) {
    $(`#position-${tutorial_num}`).off('click', closeTutorial);
    $(`#position-${tutorial_num}`).fadeOut(500);
}


function giveTutorialClick(tutorial_num) { // --------------------- dynamically give the click event listener to tutorial screens, once clicked it will remove the event listener
    $(`#position-${tutorial_num}`).on('click', closeTutorial);
}

setTimeout(() => {
    document.getElementById('georgeName').classList.add('flash2');
    setTimeout(() => {
        canTransition = true;
    }, 1000);
}, 800);

$('#heartSVG').bind('touchend', function(e) {
    e.preventDefault(); // meant to stop zooming in on heart-wrap when spam clicking
    heartClick(); // sends heart
});

var georgeDiv = document.getElementById('george');
georgeDiv.style.pointerEvents = 'auto';
var georgeVidsArray = document.getElementsByClassName('georgeVid');

var Z = [-500, -1000, -1500, -2000, -2500];
var X = [-50, -40, -30, -20, -10];
var georgeClickCount = -1;
var xDown;
var yDown;
var xDiff;
var yDiff;
var transitioning;

// georgeDiv.addEventListener('touchstart', (e) => {
//     xDown = e.touches[0].clientX;
//     yDown = e.touches[0].clientY;
// });
//
// georgeDiv.addEventListener('touchmove', (e) => {
//     var xDownNew = e.touches[0].clientX;
//     var yDownNew = e.touches[0].clientY;
//
//     xDiff = xDown - xDownNew;
//     yDiff = yDown - yDownNew;
// });
//
// georgeDiv.addEventListener('touchend', (e) => {
//     if ((yDiff > 200) && !transitioning) {
//         if (georgeClickCount >= 0) {
//             transitioning = true;
//             georgeActive('back');
//         }
//         xDiff = null;
//         yDiff = null;
//     }
//     if ((yDiff < -200) && !transitioning) {
//         if (georgeClickCount < 4) {
//             transitioning = true;
//             georgeActive('forward');
//         }
//         xDiff = null;
//         yDiff = null;
//     }
// })

document.addEventListener('keydown', e => {
    if (e.keyCode === 38) {
        georgeActive('forward')
    }
    if (e.keyCode === 40) {
        georgeActive('back')
    }
    if (e.keyCode === 39) {
        heartClick();
    }
})

function georgeActive(directionX) {
    if (directionX === 'forward') {
        if (georgeClickCount < 4) {
            if (georgeClickCount >= 0) {
                georgeVidsArray[georgeClickCount].pause();
                georgeVidsArray[georgeClickCount].style.transform = `translateX(${X[georgeClickCount + 1]}%) translateY(2%) translateZ(${Z[georgeClickCount]}px)`;
                setTimeout(() => {
                    for (var i = 0; i < Z.length; i++) {
                        Z[i] += 500;
                        X[i] -= 10;
                        georgeVidsArray[i].style.transform = `translateX(${X[i]}%) translateY(2%) translateZ(${Z[i]}px)`;
                    }
                    setTimeout(() => {
                        georgeVidsArray[georgeClickCount].style.transform = `translateX(12%) translateY(2%) translateZ(${Z[georgeClickCount]}px)`;
                        setTimeout(() => {
                            georgeVidsArray[georgeClickCount].play();
                        }, 1500)
                        transitioning = false;
                    }, 1000)
                    georgeClickCount++;
                }, 1000);
            } else {
                for (var i = 0; i < Z.length; i++) {
                    Z[i] += 500;
                    X[i] -= 10;
                    georgeVidsArray[i].style.transform = `translateX(${X[i]}%) translateY(2%) translateZ(${Z[i]}px)`;
                }
                setTimeout(() => {
                    georgeVidsArray[georgeClickCount].style.transform = `translateX(12%) translateY(2%) translateZ(${Z[georgeClickCount]}px)`;
                    setTimeout(() => {
                        georgeVidsArray[georgeClickCount].play();
                    }, 1500)
                    transitioning = false;
                }, 1000)
                georgeClickCount++;
            }
        }
    } else if (directionX === 'back') {
        if (georgeClickCount >= 0) {
            georgeVidsArray[georgeClickCount].pause();
            georgeVidsArray[georgeClickCount].style.transform = `translateX(${X[georgeClickCount]}%) translateY(2%) translateZ(${Z[georgeClickCount]}px)`;
            setTimeout(() => {
                for (var i = 0; i < Z.length; i++) {
                    Z[i] -= 500;
                    X[i] += 10;
                    georgeVidsArray[i].style.transform = `translateX(${X[i]}%) translateY(2%) translateZ(${Z[i]}px)`;
                }
                if (georgeClickCount > 0) {
                    setTimeout(() => {
                        georgeVidsArray[georgeClickCount].style.transform = `translateX(12%) translateY(2%) translateZ(${Z[georgeClickCount]}px)`;
                        setTimeout(() => {
                            georgeVidsArray[georgeClickCount].play();
                        }, 1500)
                    }, 1000)
                }
                setTimeout(() => {transitioning = false;}, 1000);
                georgeClickCount--;
            }, 1000);
        }
    }

}

georgeDiv.addEventListener('click', georgeActive);

}());
