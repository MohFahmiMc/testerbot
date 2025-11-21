module.exports = {
    name: "audituser",
    description: "Cek aktivitas user dalam 24 jam terakhir",
    async execute(message, args) {
        const member = message.mentions.members.first() || message.member;
        const dayAgo = Date.now() - 86400000; // 24 jam
        let count = 0;
        message.guild.channels.cache.filter(c => c.isTextBased()).forEach(ch => {
            ch.messages.fetch({limit:100}).then(msgs => {
                msgs.forEach(m => {
                    if(m.author.id === member.id && m.createdTimestamp > dayAgo) count++;
                });
            });
        });
        setTimeout(() => message.channel.send(`${member.user.tag} mengirim ${count} pesan dalam 24 jam terakhir.`), 2000);
    }
};
