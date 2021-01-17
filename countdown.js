const seconds = 1;
const startingCounter = 2;
let stopFlag = false;
let counter = startingCounter;

let counterText = ["1.......", "2.....", "3..."];

const updateCounter = (channel) => {
    //console.log(message.content);
    if (stopFlag) {
        counter = startingCounter;
        stopFlag = false;
        return;
    }
    channel.send(counterText[counter]);
    counter -= seconds;

    if (counter < 0) {
        channel.send('Sold!');
        counter = startingCounter;
        return;
    }
    setTimeout(() => {
        updateCounter(channel)
    }, 1500 * seconds);
}

module.exports = async (client) => {
    const guild = client.guilds.cache.get("790752082089082901");
    const channel = guild.channels.cache.get("797144212134559814");
    //console.log(channel.id);
    //const message = await channel.send(getText());
    //console.log(message.content);

    updateCounter(channel);

}