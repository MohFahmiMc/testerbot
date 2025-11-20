module.exports = {
    name: "channels",
    description: "Menampilkan semua channel server",
    execute(message, args, client) {
        const channels = message.guild.channels.cache.map(c => c.name).join(", ");
        message.channel.send(`Channels di server: ${channels}`);
    }
};
