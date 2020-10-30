var socket = io();

var players = [];
var obstacles = [];
var bullets = [];
var chatTexts = [];
var pendingInputs = [];

var newGame = false;
var startTime = -1;
var roundTime = -1;


const gunThickness = 4;
const gunLength = 50;
const bulletThickness = 2;
const bulletStartLength = 35;
const maxChatLength = 20;
const bulletShrink = 8;


socket.emit('new player');

var canvas = document.getElementById('canvas');
canvas.width = 800;
canvas.height = 600;
var ctxt = canvas.getContext('2d');
var chatText = document.getElementById('chat-text');
var chatInput = document.getElementById('chat-input');
var chatForm = document.getElementById('chat-form');

var input_sequence_number = 0;
var playerId;
var numPlayers = 0;



document.addEventListener('DOMContentLoaded', function() {

    document.getElementById('chat-input').addEventListener('focus', function() {
        typing = true;
    });
    document.getElementById('chat-input').addEventListener('blur', function() {
        typing = false;
    });
});


document.onkeyup = function(event) {

    //user pressed and released enter key
    if (event.keyCode === 13) {

        if (!typing) {
            //user is not already typing, focus our chat text form
            chatInput.focus();

        } else {

            //user sent a message, unfocus our chat form 
            chatInput.blur();
        }

    }
}


socket.on('new_player2', function(data) {
    players[data.id] = {
        x: data.x,
        y: data.y,
        angle: data.angle,
        id: data.id
    };
});

socket.on('startSpectatingInfo', function(data) {
    document.getElementById("yes").innerHTML = "SPECTATING";
    startTime = Date.now() - data.elapsedTime;
    roundTime = data.roundTime;
});

socket.on('new_obstacle2', function(ar) {

    obstacles.push({
        type: ar.type,
        x: ar.x,
        y: ar.y,
        w: ar.w,
        h: ar.h
    });
});

socket.on('player_info_start', function(data) {
    playerId = data.id;
});


socket.on('user_leave', function(data) {
    delete players[data];
});

socket.on('update', function(data) {
    data.forEach((ar) => {
        if (ar.type === 'player') {
            if (playerId == data.id) {
                var j = 0;
                while (j < pendingInputs.length) {
                    var input = this.pendingInputs[j];
                    if (input.input_sequence_number <= data.input_sequence_number)
                        this.pendingInputs.splice(j, 1);
                    else {
                        player[playerId].x = data.x;
                        player[playerId].y = data.y;
                        while (j++ < this.pendingInputs.length) {
                            movement = this.pendingInputs[j];
                            this.move(movement, playerId);
                            this.correctCollisions(playerId);
                            pendingInputs[j].x = player[playerId].x;
                            pendingInputs[j].y = player[playerId].y;

                        }
                    }
                }
            } else {

                if (players[ar.id]) {
                    players[ar.id].x = ar.x;
                    players[ar.id].y = ar.y;
                    players[ar.id].angle = ar.angle;
                }
            }


        } else if (ar.type === 'Reset Round') {
            players = [];
            obstacles = [];
            newGame = true;
            addToChatBox("Game:  New Round");
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
        } else if (ar.type == 'time') {
            startTime = Date.now();
            roundTime = ar.time;
        } else if (ar.type == 'scoreboard') {
            if (ar.index == playerId)
                addToChatBox("Game: You scored " + ar.score);
            else
                addToChatBox("Game: Player " + ar.index + " scored " + ar.score);
        } else if (ar.type == 'numOfPlayers') {
            numPlayers = ar.num;
            updatePlayerCount();
        } else {
            console.log("ERROR IN Update type " + data.type);
        }
    });

});

function updatePlayerCount() {
    document.getElementById("yes").innerHTML = "NUMBER OF PLAYERS: " + numPlayers;
}

function addToChatBox(data) {
    chatTexts.push(data);
    if (chatTexts.length > maxChatLength)
        chatTexts.shift();
    updateChatBox();
}

socket.on('pong', function(data) {
    document.getElementById('ping').innerHTML = "Ping: " + (Date.now() - data);
});

socket.on('addToChat', function(data) {
    console.log("Got a Chat Message");
    addToChatBox(data);
});


chatForm.onsubmit = function(e) {
    //prevent the form from refreshing the page
    e.preventDefault();

    //call sendMsgToServer socket function, with form text value as argument
    socket.emit('sendMsgToServer', "Player " + playerId + ": " + chatInput.value);
    chatInput.value = "";
}

function updateChatBox() {
    chatText.innerHTML = "";
    chatTexts.forEach((data) => {
        chatText.innerHTML += '<div class="chatCell">' + data + '</div>';
    });
    chatText.scrollTop = chatText.scrollHeight;
}

function correctCollisions(playerId) {
    x = players[playerId].x;
    y = players[playerId].y;
    size = 15;
    obstacles.forEach((obstacle) => {
        if (obstacle.type === 'circle') {
            const data = this.circleOverlappCircle(x, y, size, obstacle.x, obstacle.y, obstacle.w);
            players[playerId].x += data.x;
            players[playerId].y += data.y;
        }
    });
}

function circleOverlappCircle(xc, yc, rc, xr, yr, rr) {
    dista = Math.sqrt((xc - xr) * (xc - xr) + (yc - yr) * (yc - yr));
    distb = rc + rr;
    if (distb < dista)
        return { x: 0, y: 0 };
    x = xc - xr;
    y = yc - yr;
    theta = Math.atan2(y, x);
    distc = Math.abs(dista - distb);

    return { x: Math.cos(theta) * distc, y: Math.sin(theta) * distc };
}

function move(movement, playerId) {
    if (!players[playerId])
        return;
    if (movement.down)
        players[playerId].y += 5;
    if (movement.up)
        players[playerId].y -= 5;
    if (movement.left)
        players[playerId].x -= 5;
    if (movement.right)
        players[playerId].x += 5;

    this.correctCollisions(playerId);
    //console.log()

}

setInterval(function() {
    //console.log(players.length);
    if (newGame) {
        movement.input_sequence_number = input_sequence_number++;
        socket.emit('movement', movement);
        socket.emit("mouse", mouse);
        socket.emit("curPing", Date.now());

        move(movement, playerId);

        updateChatBox();
        movement.x = players[playerId].x;
        movement.y = players[playerId].y;
        pendingInputs.push(movement);
    }

    if (startTime != -1) {
        document.getElementById("roundTime").innerHTML = "Roundtime: " + Math.ceil(roundTime - (Date.now() - startTime) / 1000);
    }

    draw();

}, 1000 / 30);

var movement = {
    up: false,
    down: false,
    left: false,
    right: false,
    x: 0,
    y: 0
}

var time = Date.now();

var mouse = {
    x: 0,
    y: 0,
    click: false,
    time: 0
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

    ctxt.fillStyle = 'blue';
    //onsole.log(bullets.length);
    bullets.forEach((bullet, index) => {
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
            bullet.r -= (bullet.r / 5 * 4 + bulletShrink);

            ctxt.stroke();
            if (bullet.r < 0)
                delete bullets[index];
        } else {
            ctxt.moveTo(bullet.xStart, bullet.yStart);
            ctxt.lineTo(bullet.xStart + Math.cos(bullet.angle) * bullet.r, bullet.yStart + Math.sin(bullet.angle) * bullet.r);
            bullet.r += 50;
            bullet.xStart = bullet.xStart + Math.cos(bullet.angle) * bullet.r / 3 * 2;
            bullet.yStart = bullet.yStart + Math.sin(bullet.angle) * bullet.r / 3 * 2;
            ctxt.stroke();
            if (bullet.r > 1000) {
                delete bullets[index];
            }
        }
    });

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



    if (players[playerId]) {
        var player = players[playerId];
        ctxt.lineWidth = 1.0;
        ctxt.beginPath();
        ctxt.arc(player.x, player.y, 15, 0, 2 * Math.PI);
        ctxt.stroke();
    }

}