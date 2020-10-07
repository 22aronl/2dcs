var socket = io();

var players = [];


socket.emit('new player');

var canvas = document.getElementById('canvas');
canvas.width = 800;
canvas.height = 600;
var ctxt = canvas.getContext('2d');

setInterval(function() {

    socket.emit('movement', movement);
    socket.emit("mouse", mouse);


    draw();

}, 1000 / 30);

socket.on('new_player', function(data) {
    players.push(1);
});

socket.on('update', function(data) {
    if (data.type == 'player') {
        console.log("PLAYER!");
    }
});


var movement = {
    up: false,
    down: false,
    left: false,
    right: false
}

var mouse = {
    x: 0,
    y: 0,
    click: false
}
document.addEventListener('mousedown', function(event) {
    mouse.click = true;
});
document.addEventListener('mouseup', function(event) {
    mouse.click = false;
});
document.addEventListener('mousemove', function(event) {
    mouse.x = event.clientX;
    mouse.y = event.clientY;
});
document.addEventListener('keydown', function(event) {
    switch (event.keyCode) {
        case 65: // A
            movement.left = true;
            break;
        case 87: // W
            movement.up = true;
            break;
        case 68: // D
            movement.right = true;
            break;
        case 83: // S
            movement.down = true;
            break;
    }
});
document.addEventListener('keyup', function(event) {
    switch (event.keyCode) {
        case 65: // A
            movement.left = false;
            break;
        case 87: // W
            movement.up = false;
            break;
        case 68: // D
            movement.right = false;
            break;
        case 83: // S
            movement.down = false;
            break;
    }
});

function draw() {
    ctxt.clearRect(0, 0, 800, 600);
    ctxt.fillStyle = 'green';
    this.players.forEach((player) => {
        ctxt.beginPath();
        ctxt.arc(Math.floor((Math.random() * 800)), Math.floor((Math.random() * 600)), 10, 0, 2 * Math.PI);
        ctxt.fill();
    });
}