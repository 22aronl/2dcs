var express = require('express');
var http = require('http');
var path = require('path');
var socketIO = require('socket.io');
var _game = require('./game');

var Game = _game.Game;

var app = express();
var server = http.Server(app);
var io = socketIO(server);
var game;

app.set('port', 5000);
app.use(express.static(__dirname + '/static'));
app.get('/', function(request, response) {
    response.sendFile(path.join(__dirname, '/static/index.html'));
});

let port = process.env.PORT;
if (port == null || port == "") {
    port = 5000;
}



server.listen(port, function() {
    console.log('Starting server on port 5000');
});
game = new Game(io);

io.on('connection', function(socket) {
    socket.on('new player', function() {

    });
});

setInterval(() => {
    game.update();
    io.emit("update", game.getUpdates());
}, 1000 / 30);