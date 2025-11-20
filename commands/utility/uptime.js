module.exports = {
    name: "uptime",
    description: "Menampilkan berapa lama bot berjalan",
    execute(message, args, client) {
        const totalSeconds = Math.floor(client.uptime / 1000);
        const hours = Math.floor(totalSeconds / 3600);
        const minutes = Math.floor((totalSeconds % 3600) / 60);
        const seconds = totalSeconds % 60;

        message.channel.send(`Bot aktif selama ${hours}h ${minutes}m ${seconds}s`);
    }
};
