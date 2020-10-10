var socket = io();

var players = [];
var obstacles = [];
var bullets = [];


const gunThickness = 2;
const gunLength = 50;
const bulletThickness = 10;
const bulletStartLength = 1;


socket.emit('new player');

var canvas = document.getElementById('canvas');
canvas.width = 800;
canvas.height = 600;
var ctxt = canvas.getContext('2d');


socket.on('new_player2', function(data) {
    players.push({
        x: data.x,
        y: data.y,
        angle: data.angle
    });
    document.getElementById("yes").innerHTML = players.length;
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
                players[ar.id].angle = ar.angle;
            }
        } else if (ar.type === 'Reset Round') {
            players = [];
            obstacles = [];
        } else if (ar.type === 'new_player') {
            players[ar.id] = {
                x: ar.x,
                y: ar.y,
                angle: ar.angle
            };
        } else if (ar.type === 'obstacle') {
            obstacles.push({
                type: ar.shape,
                x: ar.x,
                y: ar.y,
                w: ar.w,
                h: ar.h
            })
        } else if (ar.type === 'bullet') {
            bullets.push({
                xStart: ar.x,
                yStart: ar.y,
                r: bulletStartLength,
                angle: ar.angle,
                hit: ar.hit,
                end: false,
                xEnd: ar.xEnd,
                yEnd: ar.yEnd
            });
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

    ctxt.fillStyle = 'red';
    ctxt.lineWidth = 1.0;
    obstacles.forEach((obstacle) => {
        if (obstacle.type === 'square')
            ctxt.fillRect(obstacle.x, obstacle.y, obstacle.w, obstacle.h);
        else if (obstacle.type === 'circle') {
            ctxt.beginPath();
            ctxt.arc(obstacle.x, obstacle.y, obstacle.w, 0, 2 * Math.PI);
            ctxt.fill();
        }
    });



    ctxt.fillStyle = 'green';
    players.forEach((player) => {
        ctxt.lineWidth = gunThickness;
        ctxt.beginPath();
        ctxt.moveTo(player.x, player.y);
        ctxt.lineTo(player.x + Math.cos(player.angle) * gunLength, player.y + Math.sin(player.angle) * gunLength);
        ctxt.stroke();

        ctxt.lineWidth = 1.0;
        ctxt.beginPath();
        ctxt.arc(player.x, player.y, 15, 0, 2 * Math.PI);
        ctxt.fill();
    });

    ctxt.fillStyle = 'orange';
    //onsole.log(bullets.length);
    bullets.forEach((bullet) => {
        ctxt.lineWidth = bulletThickness;
        ctxt.beginPath();
        x = bullet.xEnd;
        x1 = bullet.xStart;
        x2 = bullet.xStart + Math.cos(bullet.angle) * bullet.r;

        y = bullet.yEnd;
        y1 = bullet.yStart;
        y2 = bullet.yStart + Math.sin(bullet.angle) * bullet.r;
        if (bullet.end || (bullet.hit && (((x1 - x <= 0 && x - x2 <= 0) || (x1 - x >= 0 && x - x2 >= 0)) && ((y1 - y <= 0 && y - y2 <= 0) || (y1 - y >= 0 && y - y2 >= 0))))) {
            bullet.end = true;
            ctxt.moveTo(x, bullet.yEnd);
            ctxt.lineTo(bullet.xEnd - Math.cos(bullet.angle) * bullet.r, bullet.yEnd - Math.sin(bullet.angle) * bullet.r);
            bullet.r -= 1;

            ctxt.stroke();
            if (bullet.r < 0)
                bullets.splice(bullet, 1);
        } else {
            ctxt.moveTo(bullet.xStart, bullet.yStart);

            ctxt.lineTo(bullet.xStart + Math.cos(bullet.angle) * bullet.r, bullet.yStart + Math.sin(bullet.angle) * bullet.r);
            bullet.r += 25;
            bullet.xStart = bullet.xStart + Math.cos(bullet.angle) * bullet.r / 3 * 2;
            bullet.yStart = bullet.yStart + Math.sin(bullet.angle) * bullet.r / 3 * 2;
            ctxt.stroke();
            if (bullet.r > 1000)
                bullets.splice(bullet, 1);
        }
    });

}