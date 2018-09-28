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


var jonny = document.getElementById('jonny');
var numbers = document.getElementById('numbers');
var yesButton = document.getElementById('yes');
var noButton = document.getElementById('no');
// var snoop = $('#snoop');
var snoop = document.getElementById('snoop');

// ------------------------------------------ L O A D I N G

var questionImages = [];
var questionImageObjs = [];
var questionLoadCounter = 0;
var yesImages = [];
var yesImageObjs = [];
var yesLoadCounter = 0;
var noImages = [];
var noImageObjs = [];
var noLoadCounter = 0;
var homeImages = [];
var homeImageObjs = [];
var homeLoadCounter = 0;
var questionLoaded = false;
var yesLoaded = false;
var noLoaded = false;
var homeLoaded = false;

function jonnyStart() {
    jonny.appendChild(questionImageObjs[0]);
}

function jonnyLoadCheck() {
    if (questionLoaded && yesLoaded && noLoaded && homeLoaded) {
        $('#position-15 .tutorialX').text('> enter <');
        giveTutorialClick(15); // -------------------------------------- giving click event listener to tutorial 1 once all have transitioned etc...
        jonnyStart();
    }
}

function jonnyLoad() {
    for (var i = 0; i < 5; i++) {
        questionImages.push(`jonny/question${i + 1}.jpg`);
        var imageObj = new Image();
        imageObj.src = questionImages[i];
        imageObj.onload = function() {
            questionLoadCounter++;
            if (questionLoadCounter === 5) {
                console.log(questionImageObjs);
                questionLoaded = true;
                jonnyLoadCheck();
            }
        }
        questionImageObjs.push(imageObj);
    }

    for (var i = 0; i < 11; i++) {
        if (i > 8) {
            yesImages.push(`jonny/yes${i + 1}.gif`);
        } else {
            yesImages.push(`jonny/yes${i + 1}.jpg`);
        }
        var imageObj = new Image();
        imageObj.src = yesImages[i];
        imageObj.onload = function() {
            yesLoadCounter++;
            if (yesLoadCounter === 11) {
                console.log(yesImageObjs);
                yesLoaded = true;
                jonnyLoadCheck();
            }
        }
        yesImageObjs.push(imageObj);
    }

    for (var i = 0; i < 10; i++) {
        if (i === 3 || i === 4 || i === 9) {
            noImages.push(`jonny/no${i + 1}.gif`);
        } else {
            noImages.push(`jonny/no${i + 1}.jpg`);
        }
        var imageObj = new Image();
        imageObj.src = noImages[i];
        imageObj.onload = function() {
            noLoadCounter++;
            if (noLoadCounter === 10) {
                console.log(noImageObjs);
                noLoaded = true;
                jonnyLoadCheck();
            }
        }
        noImageObjs.push(imageObj);
    }

    for (var i = 0; i < 4; i++) {
        homeImages.push(`jonny/home${i + 1}.jpg`);
        var imageObj = new Image();
        imageObj.src = homeImages[i];
        imageObj.onload = function() {
            homeLoadCounter++;
            if (homeLoadCounter === 4) {
                console.log(homeImageObjs);
                homeLoaded = true;
                jonnyLoadCheck();
            }
        }
        homeImageObjs.push(imageObj);
    }
}

jonnyLoad();


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
                $('#jonny').css("opacity", "0");
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
                                // location.href = `http://192.168.1.83:8080/ian_williamson?colour=${user.colour}`;
                                location.href = `http://192.168.4.1:8080/ian_williamson?colour=${user.colour}`;
                                // location.href = `http://avd.local:8080/ian_williamson?colour=${user.colour}`;
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
                $('#jonny').css("opacity", "1");
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


    socket.emit('newHeart', {colour: user.colour, userPosition: 'jonny'}); // sends heart to the server so it can be emitted for everyone else


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
    removeTutorialClick(15); // make sure the only id clickable is the specific wrap
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
    document.getElementById('jonnyName').classList.add('flash2');
}, 800);

$('#heartSVG').bind('touchend', function(e) {
    e.preventDefault(); // meant to stop zooming in on heart-wrap when spam clicking
    heartClick(); // sends heart
});

// ------------------------------------------ C L I C K I N G

var question = true;
var jonnyQuestionCounter = 0;
var yes = false;
var jonnyYesCounter = 0;
var no = false;
var jonnyNoCounter = 0;
var home = false;
var jonnyHomeCounter = 0;

var yesOrNo;
var reboot = false;

function homeSwipe(direction) {
    if (direction === 'left') {
        if (jonnyHomeCounter < 2) {
            console.log(jonnyHomeCounter);
            if (jonnyHomeCounter === 1) {
                $('#snoop').fadeOut();
            }
            jonnyHomeCounter++;
            jonny.appendChild(homeImageObjs[jonnyHomeCounter]);
            if (jonnyHomeCounter === 1) {
                $('#snoop').fadeIn();
            }
        }
    } else if (direction === 'right') {
        if (jonnyHomeCounter > 0) {
            console.log(jonnyHomeCounter);
            if (jonnyHomeCounter === 1) {
                $('#snoop').fadeOut();
            }
            jonnyHomeCounter--;
            jonny.appendChild(homeImageObjs[jonnyHomeCounter]);
            if (jonnyHomeCounter === 1) {
                $('#snoop').fadeIn();
            }
        }
    }
}

function jonnyHomeScreen() {
    jonny.removeEventListener('click', jonnyForward);

    var xDown;
    var xDiff;

    jonny.addEventListener('touchstart', (e) => {
        xDown = e.touches[0].clientX;
    });

    jonny.addEventListener('touchmove', (e) => {
        var xDownNew = e.touches[0].clientX;
        xDiff = xDown - xDownNew;
    });

    jonny.addEventListener('touchend', (e) => {
        if ((xDiff > 300)) {
            homeSwipe('left')
            xDiff = null;
        }
        if ((xDiff < -300)) {
            homeSwipe('right')
            xDiff = null;
        }
    })
}

var bootInProgress = false;

function jonnyForward() {

    if (!bootInProgress) {

        if (question) {
            jonnyQuestionCounter++;
            if (jonnyQuestionCounter === 2) {
                numbers.style.display = 'flex';
            }
            if (jonnyQuestionCounter === 5) {
                question = false;
                yesOrNo === 'yes' ? yes = true : no = true
            } else {
                jonny.appendChild(questionImageObjs[jonnyQuestionCounter]);
            }
        }

        if (reboot) {
            bootInProgress = true;
            jonny.style.backgroundColor = '#0C006E';
            var audio = new Audio('jonny/reboot.mp3');
            audio.play();
            var imageObj = new Image();
            imageObj.src = 'jonny/reboot.gif' + '?a=' + Math.random();
            imageObj.id = 'reboot';
            imageObj.onload = function() {
                console.log('loaded reboot gif');
                setTimeout(() => {
                    jonny.appendChild(homeImageObjs[0]);
                    reboot = false;
                    bootInProgress = false;
                    jonnyHomeScreen();
                }, 8000)
            }
            jonny.appendChild(imageObj);
        }

        if (yes) {
            console.log(jonnyYesCounter);
            jonny.appendChild(yesImageObjs[jonnyYesCounter]);
            jonnyYesCounter++;
            console.log(jonnyYesCounter);
            if (jonnyYesCounter === 11) {
                console.log('hi');
                yes = false;
                reboot = true;
            }
        }

        if (no) {
            jonny.appendChild(noImageObjs[jonnyNoCounter]);
            jonnyNoCounter++;
            if (jonnyNoCounter === 10) {
                no = false;
                reboot = true;
            }
        }

    }

}

jonny.addEventListener('click', jonnyForward);

yesButton.addEventListener('click', () => {
    yesOrNo = 'yes';
    console.log('y/n', yesOrNo);
    numbers.style.display = 'none';
});

noButton.addEventListener('click', () => {
    yesOrNo = 'no';
    console.log('y/n', yesOrNo);
    numbers.style.display = 'none';
});

snoop.addEventListener('click', () => {
    snoop.style.display = 'none';
    jonny.appendChild(homeImageObjs[3]);
})


}());
