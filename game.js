class Game {
    constructor(io) {
        this.io = io;
        this.players = [];
        this.ghosts = [];
        this.updates = [];
        this.obstacles = [];
        this.obstacles.push({
            type: 'square',
            x: 200,
            y: 200,
            w: 40,
            h: 40,
        });

        this.obstacles.push({
            type: 'circle',
            x: 400,
            y: 400,
            w: 40,
            h: 40
        })
    }

    round() {
        this.players = this.ghosts;
        this.ghost = [];

        this.updates.push({
            type: "Reset Round"
        })

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
            player.update();
            this.updates.push({
                type: 'new_player',
                id: player.id,
                x: player.x,
                y: player.y,
                angle: player.angle
            });
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

        this.movement = {
            up: false,
            down: false,
            left: false,
            right: false
        };

        this.angle = 180;
        this.click = false;
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

    update() {
        //console.log("x" + this.x + " Y " + this.y);

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
    //console.log("X" + x + " Y " + y + " THETA" + theta + " distc+ " + distc);
    //console.log(Math.cos(theta) * distc + " " + Math.sin(theta) * distc);
    return { x: Math.cos(theta) * distc, y: Math.sin(theta) * distc };
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