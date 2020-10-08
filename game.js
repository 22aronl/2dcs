class Game {
    constructor(io) {
        this.io = io;
        this.players = [];
        this.ghosts = [];
        this.updates = [];
    }

    round() {
        this.players = this.ghosts;
        this.ghost = [];

        this.updates.push({
            type: "Reset Round"
        })

        this.players.forEach((player) => {
            player.update();
            this.updates.push({
                type: 'new_player',
                id: player.id,
                x: player.x,
                y: player.y
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
                y: player.y
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

        this.movement = {
            up: false,
            down: false,
            left: false,
            right: false
        };

        this.mouse = {
            angle: 180,
            click: false
        };
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
    }

    getData() {
        return { x: this.x, y: this.y };
    }
}


module.exports.Game = Game;
module.exports.Player = Player;