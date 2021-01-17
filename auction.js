const Discord = require('discord.js');
const Sequelize = require('sequelize');
const captain = require('./captain.js');

const sequelize = new Sequelize('database', 'user', 'password', {
	host: 'localhost',
	dialect: 'sqlite',
	logging: false,
	// SQLite only
	storage: 'auction.sqlite',
});

const Auction = sequelize.define('auction', {
    round: {
        type: Sequelize.INTEGER,
        unique: true,
    },
    bidCoins: Sequelize.INTEGER,
    playerBid: Sequelize.STRING,
    captainBidding: Sequelize.STRING,
});
