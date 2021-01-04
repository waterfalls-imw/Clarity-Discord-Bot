const { Team } = require('discord.js');
var team = require('./team.js');

module.exports = class Captain {
    user;
    coins = 0;
    queuePosition = 0;
    constructor(user, coins, queuePosition) {
        this.user = user;
        this.coins = coins;
        this.queuePosition = queuePosition;
    }

    //team = new Team(this, []);

    pickPlayer(name, coinValue) {
        coins -= coinValue;
        //team.addPlayer(name);
    }
}; 