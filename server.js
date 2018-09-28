const express = require('express');
const app = express();

const server = require('http').Server(app);
const io = require('socket.io')(server);

const device = require('express-device');
app.use(device.capture());

const compression = require('compression');
app.use(compression());

app.use(express.static('./public'));

var socketsLength = 0; // var used to update user count
var colourCounter = 1; // var used to rotate through heart colours


// ----------------------------------- D A N I E L  T I M E R
var danielCurrentTime = 940;
setInterval(() => {
    danielCurrentTime = danielCurrentTime == 984 ? 0 : danielCurrentTime + 1;
}, 1000);


// ----------------------------------- D Y N A M I C  G R A D I E N T
var peachpuff = 0;
var deeppink = 0;
var blue = 0;
var darkslategrey = 0;
var gradient = 'linear-gradient(darkslategrey, blue, deeppink, peachpuff)';
var backgroundArray = {
    peachpuff: 1,
    deeppink: 1,
    blue: 1,
    darkslategrey: 1
}


// ----------------------------------- D Y N A M I C  A R T I S T  L I S T
var artistLikesPrev = ['Jon Arbuckle', 'John Flindt', 'Daniel Lee', 'Cassie McQuater', 'Henry Pope', 'Jonny Tanna', 'Tabitha Tohill-Reid', 'George Stone', 'Ian Williamson'];
var artistLikesTrue = ['Jon Arbuckle', 'John Flindt', 'Daniel Lee', 'Cassie McQuater', 'Henry Pope', 'Jonny Tanna', 'Tabitha Tohill-Reid', 'George Stone', 'Ian Williamson'];
var artistLikesToSort = [];
var artistLikes = {
    jon: {likes: 0, name: 'Jon Arbuckle'},
    john: {likes: 0, name: 'John Flindt'},
    daniel: {likes: 0, name: 'Daniel Lee'},
    cassie: {likes: 0, name: 'Cassie McQuater'},
    henry: {likes: 0, name: 'Henry Pope'},
    jonny: {likes: 0, name: 'Jonny Tanna'},
    tabitha: {likes: 0, name: 'Tabitha Tohill-Reid'},
    george: {likes: 0, name: 'George Stone'},
    ian: {likes: 0, name: 'Ian Williamson'}
}


// ----------------------------------- S O C K E T . I O
io.on('connection', (socket) => {

    function updateBackground(colour) { // dynamically updates the background colour
        backgroundArray[colour]++;
        gradient = 'linear-gradient(';
        for (var i = 0; i < backgroundArray.darkslategrey; i++) {
            gradient = gradient + 'darkslategrey, '
        }
        for (var i = 0; i < backgroundArray.blue; i++) {
            gradient = gradient + 'blue, '
        }
        for (var i = 0; i < backgroundArray.deeppink; i++) {
            gradient = gradient + 'deeppink, '
        }
        for (var i = 0; i < backgroundArray.peachpuff; i++) {
            gradient = gradient + 'peachpuff, '
        }
        gradient = gradient.slice(0, -2)
        gradient = gradient + ')';
        io.emit('background_update', {newGradient: gradient}); // emits to ALL sockets
    }


    function updateArtistList() { // dynamically updates the artist list on enter screen
        for (var artist in artistLikes) {
            artistLikesToSort.push([artist, artistLikes[artist].likes])
        }
        artistLikesToSort.sort(function(a, b) {
            return b[1] - a[1];
        });
        artistLikesTrue = [];
        for (var i = 0; i < artistLikesToSort.length; i++) {
            artistLikesTrue.push(artistLikes[artistLikesToSort[i][0]].name);
        }
        artistLikesToSort = [];
        var changed = false;
        for (var i = 0; i < artistLikesPrev.length; i++) {
            if (artistLikesPrev[i] !== artistLikesTrue[i]) {
                changed = true;
            }
        }
        if (changed) {
            artistLikesPrev = artistLikesTrue;
            io.emit('artist_list_update', {list: artistLikesTrue}); // emits to ALL sockets
        }
    }


    socket.colour = colourCounter; // adds the heart colour to the socket object

    colourCounter = colourCounter === 4 ? 1 : colourCounter + 1; // increments heart colour

    socketsLength++; // increments number of connected sockets


    socket.on('disconnect', () => { // socket has disconnected / will update user count
        socketsLength--;
        socket.broadcast.emit('update_user_count', {onlineUsers: socketsLength}) // emits to ALL sockects EXCEPT sender with new user count
    });


    socket.on('newHeart', data => { // a heart has been drawn
        socket.broadcast.emit('other_heart', {colour: data.colour}); // emits to ALL sockects EXCEPT sender with new heart

        peachpuff = data.colour == 1 ? peachpuff + 1 : peachpuff; // stuff to check for gradient update
        deeppink = data.colour == 2 ? deeppink + 1 : deeppink;
        blue = data.colour == 3 ? blue + 1 : blue;
        darkslategrey = data.colour == 4 ? darkslategrey + 1 : darkslategrey;
        if (peachpuff === 50) {
            updateBackground('peachpuff');
            peachpuff = 0;
        }
        if (deeppink === 50) {
            updateBackground('deeppink');
            deeppink = 0;
        }
        if (blue === 50) {
            updateBackground('blue');
            blue = 0;
        }
        if (darkslategrey === 50) {
            updateBackground('darkslategrey');
            darkslategrey = 0;
        }

        if (data.userPosition !== 'noPosition') { // if the userPosition is invalid wont trigger function
            artistLikes[data.userPosition].likes++; // increments likes for relative artists
            updateArtistList();
        }
    });

    socket.on('get_daniel_time', () => {
        socket.emit('daniel_time', {time: danielCurrentTime});
    });

    socket.emit('my_colour', {colour: socket.colour, backgroundColour: gradient, list: artistLikesTrue}); // emits ONLY to user socket with info about what the heart colour / gradient / artist list should be

    io.emit('update_user_count', {onlineUsers: socketsLength}); // emits to ALL sockets with new user count
});


app.get('/logStats', (req, res) => {
    console.log(artistLikes, backgroundArray);
    res.json({likes: artistLikes, gradient: backgroundArray});
})

app.get('/john_flindt', (req, res) => {
    req.device.type === 'phone' ? res.sendFile(__dirname + '/john.html') : res.sendFile(__dirname + '/denied.html');
})

app.get('/henry_pope', (req, res) => {
    req.device.type === 'phone' ? res.sendFile(__dirname + '/henry.html') : res.sendFile(__dirname + '/denied.html');
})

app.get('/tabitha_tohill_reid', (req, res) => {
    req.device.type === 'phone' ? res.sendFile(__dirname + '/tabitha.html') : res.sendFile(__dirname + '/denied.html');
})

app.get('/george_stone', (req, res) => {
    req.device.type === 'phone' ? res.sendFile(__dirname + '/george.html') : res.sendFile(__dirname + '/denied.html');
})

app.get('/cassie_mcquater', (req, res) => {
    req.device.type === 'phone' ? res.sendFile(__dirname + '/cassie.html') : res.sendFile(__dirname + '/denied.html');
})

app.get('/jon_arbuckle', (req, res) => {
    req.device.type === 'phone' ? res.sendFile(__dirname + '/jon.html') : res.sendFile(__dirname + '/denied.html');
})

app.get('/daniel_lee', (req, res) => {
    req.device.type === 'phone' ? res.sendFile(__dirname + '/daniel.html') : res.sendFile(__dirname + '/denied.html');
})

app.get('/jonny_tanna', (req, res) => {
    req.device.type === 'phone' ? res.sendFile(__dirname + '/jonny.html') : res.sendFile(__dirname + '/denied.html');
})

app.get('/ian_williamson', (req, res) => {
    req.device.type === 'phone' ? res.sendFile(__dirname + '/ian.html') : res.sendFile(__dirname + '/denied.html');
})

app.get('/', (req, res) => {
    req.device.type === 'phone' ? res.sendFile(__dirname + '/index.html') : res.sendFile(__dirname + '/denied.html');
});

app.get('*', (req, res) => {
    req.device.type === 'phone' ? res.sendFile(__dirname + '/index.html') : res.sendFile(__dirname + '/denied.html');
});

server.listen(8080);
