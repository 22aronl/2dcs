var express = require('express');
var http = require('http');
var path = require('path');
var socketIO = require('socket.io');
var _game = require('./game');

var Game = _game.Game;
var Player = _game.Player;

var app = express();
var server = http.Server(app);
var io = socketIO(server);
var game;

app.set('port', 5000);
app.use(express.static(__dirname + '/static'));
app.get('/', function(request, response) {
    response.sendFile(path.join(__dirname, '/static/index.html'));
});

let port = process.env.PORT || 5000;



server.listen(port, function() {
    console.log('Starting server on port 5000');
});

game = new Game(io);

io.on('connection', function(socket) {
    const player = new Player(game, Math.floor(Math.random() * 300), Math.floor(Math.random() * 300), game.players.length, socket);
    socket.on('new player', function() {

        game.players.forEach((playerz) => {
            socket.emit('new_player2', { x: playerz.x, y: playerz.y });
        });


        game.ghosts.push(player);
        //console.log(game.players[game.players.length].x);
        console.log("New Player");

    });

    socket.on('movement', function(data) {
        player.movement = data;
    });

    socket.on('disconnect', function(data) {
        delete game.players[player.id];
        delete game.ghosts[player.id];
        io.emit('user_leave', player.id);
        console.log("USER LEFT");
    });
});

setInterval(() => {
    //console.log("DOES THIS WORK?");
    console.log("New Round");
    game.round();
    io.emit('update', game.getUpdates());
}, 4000);

setInterval(() => {
    //console.log("DOES THIS WORK?");
    game.update();
    io.emit('update', game.getUpdates());
}, 1000 / 30);