module.exports = {
    name: 'say',
    description: 'Bot mengulangi pesan',
    async execute(message, args){
        const text = args.join(" ");
        if(!text) return message.channel.send("Tolong tulis sesuatu!");
        message.channel.send(text);
    }
};
