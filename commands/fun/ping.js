module.exports = {
    name: 'ping',
    description: 'Cek latency bot',
    async execute(message, args){
        message.channel.send("Pong!");
    }
};
