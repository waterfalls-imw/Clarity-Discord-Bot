require("dotenv").config();

const Auction = require('./auction.js');
const Captain = require('./captain.js');

const Discord = require('discord.js');
const client = new Discord.Client({partials: ['MESSAGE', 'CHANNEL', 'REACTION']});
//const Guild = client.guilds.cache.get();
const VOUCHINGROOM = "787343712442777610";
const VOUCHEMOJIARRAY = ['🟢','🟡','🔴','⚪'];

const Sequelize = require('sequelize');

const PREFIX = "!";


const sequelize = new Sequelize('database', 'user', 'password', {
	host: 'localhost',
	dialect: 'sqlite',
	logging: false,
	// SQLite only
	storage: 'database.sqlite',
});

const Teams = sequelize.define('teams', {
	captain: { 
        type: Sequelize.STRING,
        unique: true,
    },
    discordID: {
        type: Sequelize.STRING,
        unique: true,
    },
	players: Sequelize.STRING,
	coins: Sequelize.INTEGER
});

async function addCaptain (message, teams, cptTag, coinValue, queuePosition) {
        let cptUsername = client.users.cache.get(cptTag.slice(3,-1)).username;
        try {
            // equivalent to: INSERT INTO tags (name, description, username) values (?, ?, ?);
                const team = await teams.create({
                    captain: cptUsername,
                    discordID: cptTag,
                    players: "",
                    coins: coinValue,
                });
                return message.reply(`Captain ${team.captain} added! Their coin total is ${team.coins}`);
            }
            catch (e) {
                if (e.name === 'SequelizeUniqueConstraintError') {
                    return message.reply('That captain already exists.');
                }
                return message.reply('Something went wrong with adding a captain.');
            }
}

async function listCaptains (message, teams) {
    const teamList = await teams.findAll({ attributes: ['captain'] });
    const teamString = teamList.map(t => t.captain).join('\n') || 'No teams set.';
    return message.channel.send(`List of captains:\n${teamString}`);
}

async function demoteCaptain (message, teams, isFullDelete, cptName = '') {
    var rowCount;
    if (isFullDelete) rowCount = await Teams.destroy({ where: {}, truncate: true});
    else rowCount = await teams.destroy({ where: { captain: cptName } });
    
    if (!rowCount) return message.reply('There were no captains to demote.');
    
    if (isFullDelete) return message.reply('All captains have been demoted.');
    else return message.reply(`Captain ${cptName} demoted.`);
}

async function updateCoins (message, teams, cptTag, newCoinValue) {
    const selectedCpt = await teams.findOne({ where: { discordID: cptTag } });
    selectedCpt.coins = newCoinValue;
    await selectedCpt.save();
    return message.reply(`${selectedCpt.captain}'s coin value is now ${selectedCpt.coins}`);
}

async function addPlayer (message, teams, cptTag, playerName, coinValue) {
        const selectedCpt = await teams.findOne({ where: { discordID: cptTag } });
        if (selectedCpt.coins < coinValue) {
            return message.reply('Not enough coins!');
        }
        if (!selectedCpt) return message.reply('There is no such captain in the database.');
        console.log(`${selectedCpt.captain}'s current coin value is ${selectedCpt.coins}. Players are: ${selectedCpt.players}`);
        if (selectedCpt.players !== "") {
            selectedCpt.players += "\n";
        }
        selectedCpt.players += `${playerName} picked for ${coinValue}`;
        selectedCpt.coins -= coinValue;
        await selectedCpt.save();
        return message.reply(`Player ${playerName} has been added to ${selectedCpt.captain}'s team.
        ${selectedCpt.captain}'s current coin value is ${selectedCpt.coins}`);
}

async function listPlayers (message, teams, cptTag) {
    const selectedCpt = await teams.findOne({ where: { discordID: cptTag } });
    //const playerString = selectedCpt.players.join('/n');
    return message.reply(`${cptTag}'s current roster is:\n${selectedCpt.players}`);
}

async function fetchReactionCount (message) {
    const channel = message.guild.channels.cache.get(VOUCHINGROOM);

}



const addReactions = (message, reactions) => {
        // React with first reaction in array, shift array to the left, repeat. 
    if (reactions[0].startsWith('<:')) {
        reactions[0] = (reactions[0].match(/:\d+>/g))[0].slice(1,-1);
            // If the reaction is a custom emote, trim it into the unique emote id to pass to the react() function.
    }
    message.react(reactions[0]);
    reactions.shift();
    if (reactions.length > 0) {
        setTimeout(() => addReactions(message,reactions), 400);
            // If sufficient timeout is not set between reactions, it is possible they come out in an order different than one that was intended. 
            // Because something something asynchronous something??
    }
}

client.once('ready', () => {
    console.log('Clarity Jr. is Online!');
    Teams.sync();
});

client.on('message', async message => {
    if (message.author.bot) return;
    if (message.channel.name === 'proposal-voting' || message.channel.id === '787342513228873748'){
        let messageEmojiArray = message.content.match(/<:.+?:\d+>|(?:[\u2700-\u27bf]|(?:\ud83c[\udde6-\uddff]){2}|[\ud800-\udbff][\udc00-\udfff]|[\u0023-\u0039]\ufe0f?\u20e3|\u3299|\u3297|\u303d|\u3030|\u24c2|\ud83c[\udd70-\udd71]|\ud83c[\udd7e-\udd7f]|\ud83c\udd8e|\ud83c[\udd91-\udd9a]|\ud83c[\udde6-\uddff]|[\ud83c[\ude01-\ude02]|\ud83c\ude1a|\ud83c\ude2f|[\ud83c[\ude32-\ude3a]|[\ud83c[\ude50-\ude51]|\u203c|\u2049|[\u25aa-\u25ab]|\u25b6|\u25c0|[\u25fb-\u25fe]|\u00a9|\u00ae|\u2122|\u2139|\ud83c\udc04|[\u2600-\u26FF]|\u2b05|\u2b06|\u2b07|\u2b1b|\u2b1c|\u2b50|\u2b55|\u231a|\u231b|\u2328|\u23cf|[\u23e9-\u23f3]|[\u23f8-\u23fa]|\ud83c\udccf|\u2934|\u2935|[\u2190-\u21ff])/g);
            // Gather all custom Discord emotes and unicode emojis from the message into the messageEmojiArray 
            // ("/<:.+?:\d+>" matches the custom emotes, the rest matches all unicode emojis)
        if (messageEmojiArray !== null) {
            addReactions(message, messageEmojiArray);  
        }
    } else if (message.channel.name === 'vouching-room' || message.channel.id === '787343712442777610') {
        if (!message.content.startsWith('>>')) {
            addReactions(message, VOUCHEMOJIARRAY);
        }
        
    }

    if (message.content.startsWith(PREFIX)) {
        const [CMD_NAME, ...args] = message.content
            .trim()
            .substring(PREFIX.length)
            .split(/\s+/);
        
        if (CMD_NAME === 'madsenpredictions') {
            if (args[0]) {
                message.channel.send(`Congratulations ${args[0]}, you have successfully defeated a team that was [ranked higher/predicted to beat you] in MD2L [Main/Mini/Other] Season [n]! You are truly an incredible Dota 2 player, but more than that, an amazing individual.`);
            }
        } else if (CMD_NAME === 'waterfallsteam') {
            message.channel.send("hello rd2l fellow player, waterfalls teammate here, tonight is my 34781th scrim of the week and i wanted to say how tired i am, waterfalls doesnt want us to sleep, she wants us to scrim. She yells at us and treats us as slaves. She is not the nice person you think she is. I crumble in fear as our next scrim is coming, im loosing hope, my gf is leaving me because i started losing confidence and i might lose my job as well. I think waterfalls wants me to kill myself so she can swap me with another player. Please send help and thanks for listening");
        } else if (CMD_NAME === 'captain') {
            addCaptain(message, Teams, args[0], args[1], args[2]);
            //console.log(newCaptain.team);
        } else if (CMD_NAME === 'list') {
            listCaptains(message, Teams);
        } else if (CMD_NAME === 'demote') {
            demoteCaptain(message, Teams, false, args[0]);
        } else if (CMD_NAME === 'demoteall') {
            demoteCaptain(message, Teams, true);
        } else if (CMD_NAME === 'updatecoins') {
            updateCoins(message, Teams, args[0], args[1]);
        } else if (CMD_NAME === 'addplayer') {
            addPlayer(message, Teams, args[0], args[1], args[2]);
        } else if (CMD_NAME === 'listplayers') {
            listPlayers(message, Teams, args[0]);
        } else if (CMD_NAME === 'updatevotes') {
            fetchReactionCount(message);
        }
    }
});

client.on('messageReactionAdd', async (reaction, user) => {
    // When we receive a reaction we check if the reaction is partial or not
    const VOUCHARRAY = ['YES', 'MAYBE', 'NO', 'SKIP'];
	if (reaction.partial) {
		// If the message this reaction belongs to was removed the fetching might result in an API error, which we need to handle
		try {
			await reaction.fetch();
		} catch (error) {
			console.error('Something went wrong when fetching the message: ', error);
			// Return as `reaction.message.author` may be undefined/null
			return;
		}
    }
    
    if (user.bot) return;
	// Now the message has been cached and is fully available
	console.log(`The vouch for ${reaction.message.content} gained a reaction!`);
	// The reaction is now also fully available and the properties will be reflected accurately:
    //console.log(`${reaction.count} user(s) have given the same reaction to this message!`);
    //console.log(reaction.message.guild.cache.find(c => c.name === 'vouching-room'));
    let c = reaction.message.guild.channels.cache.find(c => c.name === 'vouching-room');
    let m = await c.messages.fetch(reaction.message.id.toString());
    let reactions = m.reactions;
    //console.log(reactions.cache);
    let reactionCount = reactions.cache.map(r => {
        let count = r.count;
        return count - 1;
    });
    let count = reactionCount.reduce((a, b) => a + b, 0);
    if (count === 17) {
        let o = reaction.message.guild.channels.cache.find(c => c.name === 'vote-dump');
        let outputStr = "\n";
        
        for (var i = 0; i < reactionCount.length; i++) {
            //console.log(VOUCHARRAY)
            outputStr += VOUCHEMOJIARRAY[i] + " " + reactionCount[i] + " " + VOUCHARRAY[i];
            if (i !== reactionCount.length - 1) {
                outputStr +=  "\n";
            }
        }
        const tallyEmbed = new Discord.MessageEmbed()
            .setColor('#69b3db')
            .setAuthor(reaction.message.content, 'https://cdn.discordapp.com/embed/avatars/0.png')
            .setDescription(outputStr);


            // {
            //     "embed": {
            //       "description": "this supports [named links](https://discordapp.com) on top of the previously shown subset of markdown",
            //       "color": 9420014,
            //       "author": {
            //         "name": "author name",
            //         "icon_url": "https://cdn.discordapp.com/embed/avatars/0.png"
            //       }
            //     }
            //   }
        o.send(tallyEmbed);
    }
    //console.log(count);
});


client.login(process.env.DISCORDJS_BOT_TOKEN);