var socket = io();

var players = [];




socket.emit('new player');

var canvas = document.getElementById('canvas');
canvas.width = 800;
canvas.height = 600;
var ctxt = canvas.getContext('2d');


socket.on('new_player2', function(data) {
    players.push({
        x: data.x,
        y: data.y
    });
    document.getElementById("yes").innerHTML = players.length;
});

socket.on('new_player', function(data) {
    players.push({
        x: data.x,
        y: data.y
    });

});

socket.on('user_leave', function(data) {
    delete players[data];
});

socket.on('update', function(data) {
    data.forEach((ar) => {
        if (ar.type === 'player') {
            if (players[ar.id]) {
                players[ar.id].x = ar.x;
                players[ar.id].y = ar.y;
            }
        } else if (ar.type === 'Reset Round') {
            players = [];
        } else if (ar.type === 'new_player') {
            players[ar.id] = {
                x: ar.x,
                y: ar.y
            };
        }
    });

});

setInterval(function() {

    socket.emit('movement', movement);
    socket.emit("mouse", mouse);

    draw();

}, 1000 / 30);

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
        ctxt.arc(player.x, player.y, 10, 0, 2 * Math.PI);
        ctxt.fill();
    });
}