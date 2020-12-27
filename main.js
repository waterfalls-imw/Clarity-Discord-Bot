const Discord = require('discord.js');
const client = new Discord.Client();

const prefix = "!";

const addReactions = (message, reactions) => {
        // React with first reaction in array, shift array to the left, repeat. 
    if (reactions[0].startsWith('<:')) {
        reactions[0] = (reactions[0].match(/:\d+>/g))[0].slice(1,-1);
            // If the reaction is a custom emote, trim it into the unique emote id to pass to the react() function.
    }
    message.react(reactions[0]);
    reactions.shift();
    if (reactions.length > 0) {
        setTimeout(() => addReactions(message,reactions), 750);
            // If sufficient timeout is not set between reactions, it is possible they come out in an order different than one that was intended. 
            // Because something something asynchronous something??
    }
}

client.once('ready', () => {
    console.log('Little Clarity is Online!');
});

client.on('message', message => {
    if (message.channel.name === 'proposal-voting'){
        let messageEmojiArray = message.content.match(/<:.+?:\d+>|(?:[\u2700-\u27bf]|(?:\ud83c[\udde6-\uddff]){2}|[\ud800-\udbff][\udc00-\udfff]|[\u0023-\u0039]\ufe0f?\u20e3|\u3299|\u3297|\u303d|\u3030|\u24c2|\ud83c[\udd70-\udd71]|\ud83c[\udd7e-\udd7f]|\ud83c\udd8e|\ud83c[\udd91-\udd9a]|\ud83c[\udde6-\uddff]|[\ud83c[\ude01-\ude02]|\ud83c\ude1a|\ud83c\ude2f|[\ud83c[\ude32-\ude3a]|[\ud83c[\ude50-\ude51]|\u203c|\u2049|[\u25aa-\u25ab]|\u25b6|\u25c0|[\u25fb-\u25fe]|\u00a9|\u00ae|\u2122|\u2139|\ud83c\udc04|[\u2600-\u26FF]|\u2b05|\u2b06|\u2b07|\u2b1b|\u2b1c|\u2b50|\u2b55|\u231a|\u231b|\u2328|\u23cf|[\u23e9-\u23f3]|[\u23f8-\u23fa]|\ud83c\udccf|\u2934|\u2935|[\u2190-\u21ff])/g);
            // Gather all custom Discord emotes and unicode emojis from the message into the messageEmojiArray 
            // ("/<:.+?:\d+>" matches the custom emotes, the rest matches all unicode emojis)
        if (messageEmojiArray !== null) {
            addReactions(message, messageEmojiArray);  
        }
    } else if (message.channel.name === 'vouching-room') {
        const vouchEmojiArray = ['🟢','🟡','🔴','⚪'];
        addReactions(message, vouchEmojiArray);
    }
});


client.login('NzkwNzUxNDA2MjE4MDE4ODU3.X-FKog.1EfX0IMLh_9HYh53V0B8CqJ1ulU');