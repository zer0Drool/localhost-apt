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

// IAN LOADING
var ianImages = [];
var ianImageObjs = [];
var ianLoadCounter = 0;
for (var i = 1; i < 111; i++) {
    ianImages.push(`ian/housewives/${i}.jpg`);
    var imageObj = new Image();
    imageObj.src = ianImages[i - 1];
    imageObj.onload = function() {
        ianLoadCounter++;
        if (ianLoadCounter === 110) {
            $('#position-17 .tutorialX').text('> tap <');
            giveTutorialClick(17); // -------------------------------------- giving click event listener to tutorial 1 once all have transitioned etc...
            ianInit();
        }
    }
    ianImageObjs.push(imageObj);
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
                $('#ian').css("opacity", "0");
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
                                // location.href = `http://192.168.1.83:8080?colour=${user.colour}`;
                                location.href = `http://192.168.4.1:8080?colour=${user.colour}`;
                                // location.href = `http://avd.local:8080?colour=${user.colour}`;
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
                $('#ian').css("opacity", "1");
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


    socket.emit('newHeart', {colour: user.colour, userPosition: 'ian'}); // sends heart to the server so it can be emitted for everyone else


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
    removeTutorialClick(17); // make sure the only id clickable is the specific wrap
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
    document.getElementById('ianName').classList.add('flash2');
}, 800);

$('#heartSVG').bind('touchend', function(e) {
    e.preventDefault(); // meant to stop zooming in on heart-wrap when spam clicking
    heartClick(); // sends heart
});

function ianInit() {
    var ianShake = new Shake({threshold: 3, timeout: 2});

    ianShake.start();

    window.addEventListener("shake", (e) => {
        ianDraw();
    }, false);

    var ianCanv;
    var ianContext;
    var ianImageCount = 0;

    var housewifeNamesArr = ['Vicki Gunvalson', 'Kimberly Bryant', 'Jo De La Rosa', 'Jeana Keough', 'Lauri Peterson', 'Tammy Knickerbocker', 'Tamra Judge', 'Quinn Fry', 'Luann de Lesseps', 'Bethenny Frankel', 'Alex McCord', 'Ramona Singer', 'Jill Zarin', 'NeNe Leakes', 'DeShawn Snow', 'Shereé Whitfield', 'Lisa Wu', 'Kim Zolciak-Biermann', 'Gretchen Rossi', 'Lynne Curtin', 'Kelly Killoren Bensimon', 'Teresa Giudice', 'Jacqueline Laurita', 'Caroline Manzo', 'Dina Manzo', 'Danielle Staub', 'Kandi Burruss', 'Alexis Bellino', 'Sonja Morgan', 'Mary Amons', 'Lynda Erkiletian', 'Cat Ommanney', 'Michaele Salahi', 'Stacie Scott Turner', 'Cynthia Bailey', 'Phaedra Parks', 'Taylor Armstrong', 'Camille Grammer', 'Adrienne Maloof', 'Kim Richards', 'Kyle Richards', 'Lisa Vanderpump', 'Lea Black', 'Adriana de Moura', 'Alexia Echevarria', 'Marysol Patton', 'Larsa Pippen', 'Cristy Rice', 'Peggy Tanous', 'Cindy Barshop', 'Melissa Gorga', 'Kathy Wakile', 'Heather Dubrow', 'Aviva Drescher', 'Carole Radziwill', 'Heather Thomson', 'Lisa Hochstein', 'Joanna Krupa', 'Ana Quincoces', 'Karent Sierra', 'Kenya Moore', 'Porsha Williams', 'Brandi Glanville', 'Yolanda Hadid', 'Lydia McLaughlin', 'Carlton Gebbia', 'Joyce Giraud de Ohoven', 'Kristen Taekman', 'Shannon Beador', 'Lizzie Rovsek', 'Teresa Aprea', 'Amber Marchese', 'Nicole Napolitano', 'Claudia Jordan', 'Eileen Davidson', 'Lisa Rinna', 'Dorinda Medley', 'Meghan King Edmonds', 'Kim Fields', 'Erika Girardi', 'Kathryn Edwards', 'Gizelle Bryant', 'Ashley Darby', 'Robyn Dixon', 'Karen Huger', 'Charrisse Jackson-Jordan', 'Katie Rost', 'Jules Wainstein', 'Cary Deuber', 'Tiffany Hendra', 'Stephanie Hollman', 'LeeAnne Locken', 'Brandi Redmond', 'Kelly Dodd', 'Dolores Catania', 'Siggy Flicker', 'Dorit Kemsley', 'Monique Samuels', 'Tinsley Mortimer', 'Peggy Sulahian', 'D’Andra Simmons', 'Kameron Westcott', 'Margaret Josephs', 'Teddi Mellencamp Arroyave', 'Candiace Dillard', 'Emily Simpson', 'Gina Kirschenheiter', 'Marlo Hampton', 'Eva Marcille', 'Shamari DeVoe', 'Denise Richards'];

    console.log(housewifeNamesArr.lenght);

    var housewifeName = document.getElementById('housewife-name');

    function ianDraw() {
        ianCanv = document.getElementById("ian-canv");
        ianContext = ianCanv.getContext("2d");

        ianContext.clearRect(0, 0, 560, 880);

        ianContext.drawImage(ianImageObjs[ianImageCount], 0, 0, 560, 880);
        housewifeName.innerText = housewifeNamesArr[ianImageCount];

        ianImageCount++;
        if (ianImageCount === 110) {
            ianImageCount = 0;
        }
    }

    ianDraw();
}

}());
