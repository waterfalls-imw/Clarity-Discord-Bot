module.exports = class Team {
    players = [];
    constructor (captain, players) {
        this.captain = captain;
        this.players = players;
    }

    addPlayer (player) {
        players.push(player);
    }

    removePlayer (player) {
        for (var i = 0; i < players.length; i++) {
            if (players[i] === player | i === player) {
                players.splice(i,i);
            }
        }
    }
};