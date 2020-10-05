var express = require('express');
var http = require('http');
var path = require('path');
var socketIO = require('socket.io');

var app = express();
var server = http.Server(app);
var io = socketIO(server);

app.set('port', 5000);
app.use('/static', express.static(__dirname + '/static'));
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