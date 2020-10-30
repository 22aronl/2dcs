class Game {
    constructor(io) {
        this.io = io;
        this.players = [];
        this.ghosts = [];
        this.updates = [];
        this.obstacles = [];
        this.bullets = [];
        this.gameState = [];
        this.scoreBoards = [];
        this.lastProcessedInput = [];
        this.gameStateIndex = 0;
        this.maxGameStateStorage = 120;
        this.startTime = 0;

        this.obstacles.push({
            type: 'circle',
            x: 400,
            y: 400,
            w: 40,
            h: 40
        });

        this.obstacles.push({
            type: 'circle',
            x: 300,
            y: 400,
            w: 60,
            h: 60
        });

        this.obstacles.push({
            type: 'circle',
            x: 200,
            y: 200,
            w: 40,
            h: 40
        });
    }

    time(len) {
        this.updates.push({
            type: 'time',
            time: len
        });
    }

    round() {
        this.gameState = [];
        this.gameStateIndex = 0;
        this.ghosts.forEach((ghost) => {
            this.players.push(ghost);
        });
        this.ghosts = [];

        this.startTime = Date.now();

        this.updates.push({
            type: "Reset Round"
        });

        this.scoreBoards.forEach((score, index) => {
            this.updates.push({
                type: "scoreboard",
                index: index,
                score: score
            });
        });


        this.scoreBoards = [];

        this.obstacles.forEach((obstacle) => {
            this.updates.push({
                type: 'obstacle',
                shape: obstacle.type,
                x: obstacle.x,
                y: obstacle.y,
                w: obstacle.w,
                h: obstacle.h
            });
        });

        this.players.forEach((player) => {
            player.reset();
            this.updates.push({
                type: 'new_player',
                id: player.id,
                x: player.x,
                y: player.y,
                angle: player.angle,
                inputProcessingNumber: this.lastProcessedInput[player.id]
            });
        });
    }

    storeGameState(index) {
        if (this.gameState.length >= this.maxGameStateStorage)
            this.gameState.shift();
        this.gameState[index] = [];
        this.players.forEach((player) => {
            this.gameState[index][player.id] = {
                x: player.x,
                y: player.y
            };
        });
    }

    update() {
        this.players.forEach((player) => {
            player.update();
            this.updates.push({
                type: 'player',
                id: player.id,
                x: player.x,
                y: player.y,
                angle: player.angle
            });
        });

        this.updates.push({
            type: 'numOfPlayers',
            num: this.players.length
        });

        this.bullets.forEach((bullet) => { // MIGHT WANT TO OPTIMIZE IT
            const temp = [];
            this.players.forEach((player) => {
                if (player.id != bullet.playerId && lineIntersectCircle(bullet.x, bullet.y, bullet.angle, player.x, player.y, player.size)) {
                    const data = lineIntersectPoint(bullet.x, bullet.y, bullet.angle, player.x, player.y, player.size);
                    if (!Number.isNaN(data.x)) {
                        data.isPlayer = bullet.playerId;
                        temp.push(data);
                    }
                }
            })
            this.obstacles.forEach((obstacle) => {
                if (obstacle.type === 'circle' && lineIntersectCircle(bullet.x, bullet.y, bullet.angle, obstacle.x, obstacle.y, obstacle.w)) {
                    const data = lineIntersectPoint(bullet.x, bullet.y, bullet.angle, obstacle.x, obstacle.y, obstacle.w);
                    if (!Number.isNaN(data.x)) {
                        data.isPlayer = -1;
                        temp.push(data);
                    }
                }
            })
            if (temp.length == 0) {
                this.updates.push({
                    type: 'bullet',
                    x: bullet.x,
                    y: bullet.y,
                    angle: bullet.angle,
                    hit: false,
                    xEnd: 10,
                    yEnd: 10
                });
            } else {
                let mindist = Math.sqrt((temp[0].x - bullet.x) * (temp[0].x - bullet.x) + (temp[0].y - bullet.y) * (temp[0].y - bullet.y));
                let end = 0;

                for (let i = 1; i < temp.length; i++) {

                    let mindisttemp = Math.sqrt((temp[i].x - bullet.x) * (temp[i].x - bullet.x) + (temp[i].y - bullet.y) * (temp[i].y - bullet.y));
                    if (mindist > mindisttemp)
                        end = i;
                }
                if (temp[end].isPlayer >= 0) {
                    if (!this.scoreBoards[temp[end].isPlayer])
                        this.scoreBoards[temp[end].isPlayer] = 0;
                    this.scoreBoards[temp[end].isPlayer]++;
                }

                this.updates.push({
                    type: 'bullet',
                    x: bullet.x,
                    y: bullet.y,
                    angle: bullet.angle,
                    hit: true,
                    xEnd: temp[end].x,
                    yEnd: temp[end].y
                });
            }
            this.bullets.splice(bullet, 1);
        });
        this.storeGameState(this.gameStateIndex++);
    }

    getUpdates() {
        const temp = this.updates;
        this.updates = [];
        return temp;
    }
}

class Player {
    constructor(game, x, y, index, socket) {
        this.x = x;
        this.y = y;
        this.game = game;
        this.id = index;
        this.socket = socket;
        this.speed = 5;
        this.size = 15;
        this.score = 0;

        this.movement = {
            up: false,
            down: false,
            left: false,
            right: false
        };

        this.angle = 180;
        this.click = false;
        this.shoot = 0;
        this.minTimeBetween = 75;
    }

    reset() {
        this.x = Math.floor(Math.random() * 700);
        this.y = Math.floor(Math.random() * 500);
        this.score = 0;
    }

    setMovement(data) {
        this.movement = data;
        this.game.lastProcessedInput[data.id] = data.input_sequence_number;
    }

    correctCollisions() {
        this.game.obstacles.forEach((obstacle) => {
            if (obstacle.type === 'circle') {
                const data = circleOverlappCircle(this.x, this.y, this.size, obstacle.x, obstacle.y, obstacle.w);
                this.x += data.x;
                this.y += data.y;
            }
        });
    }

    move() {
        if (this.movement.down)
            this.y += 5;
        if (this.movement.up)
            this.y -= 5;
        if (this.movement.left)
            this.x -= 5;
        if (this.movement.right)
            this.x += 5;

        this.correctCollisions();
    }

    update() {

        this.move();

        if (this.click && Date.now() - this.shoot > this.minTimeBetween) {
            this.shoot = Date.now();

            this.game.bullets.push({
                x: this.x,
                y: this.y,
                angle: this.angle,
                playerId: this.id
            });
        }
    }

    getData() {
        return { x: this.x, y: this.y };
    }
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

function lineIntersectPoint(x, y, theta, xr, yr, rr) {

    m1 = Math.sin(theta) / Math.cos(theta);
    d = -m1 * x + y - yr;
    a = m1 * m1 + 1;
    b = -2 * xr + 2 * m1 * d
    c = xr * xr + d * d - rr * rr;

    inner = Math.sqrt(b * b - 4 * a * c);

    m2 = (-b + inner) / (2 * a);
    m3 = (-b - inner) / (2 * a);

    m4 = (m2 + m3) / 2;
    y1 = m1 * (m4 - x) + y;

    return { x: m4, y: y1 };
}

function lineIntersectCircle(x, y, theta, xr, yr, rr) {

    m1 = Math.sin(theta) / Math.cos(theta);
    // a1 = y;
    // b1 = x;

    // i = xr - b1;
    // j = -yr - a1;

    // a = i * i - rr * rr;
    // b = 2 * i * j;
    // c = j * j - rr * rr;

    // inner = Math.sqrt(b * b - 4 * a * c);


    // m2 = (-b + inner) / (2 * a);
    // m3 = (-b - inner) / (2 * a);



    const distance = Math.sqrt((xr - x) * (xr - x) + (yr - y) * (yr - y));
    realAngle = Math.atan2(rr, distance);
    m2 = Math.sin(realAngle + theta) / Math.cos(realAngle + theta);
    m3 = Math.sin(-realAngle + theta) / Math.cos(-realAngle + theta);
    return true;
    //return (m3 >= m1 && m2 <= m1) || (m3 <= m1 && m2 >= m1);

}

function circleOverlappRect(xc, yc, r, xr, yr, w, h) {
    dista = Math.sqrt(w * w + h * h) + r;
    distb = Math.sqrt((xr - xc) * (xr - xc) + (yr - yc) * (yr - yc));
    if (distb < dista)
        return { x: 0, y: 0 };

    return circleOverlappCircle(xc, yc, r, xr, yr, w); //THIS DOES NOT WORK

}


module.exports.Game = Game;
module.exports.Player = Player;