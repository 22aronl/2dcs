class Game {
    constructor(io) {
        this.io = io;
        this.players = [];
        this.ghosts = [];
        this.updates = [];
    }

    update() {
        this.players.forEach((player) => {
            player.update();
            this.updates.push({
                type: "player"
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
    constructor() {

    }

    update() {

    }
}


module.exports.Game = Game;
module.exports.Player = Player;