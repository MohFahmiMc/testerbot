const logs = {};
module.exports = {
    name: "slowmodelog",
    description: "Mencatat aktivitas user di channel",
    execute(message) {
        const id = message.author.id;
        logs[id] = (logs[id] || 0) + 1;
        message.channel.send(`${message.author.tag} sudah mengirim ${logs[id]} pesan di channel ini.`);
    }
};
