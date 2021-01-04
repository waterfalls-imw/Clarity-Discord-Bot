const { Team } = require('discord.js');
var captain = require('./captain.js');

module.exports = class Auction {
    captains = [];
    round = 1;
    constructor (captains, round) {
        this.captains = captains;
        this.round = round;
    }
}