module.exports = {
    name: "joininfo",
    description: "Menampilkan info join user di server",
    execute(message, args) {
        const member = message.mentions.members.first() || message.member;
        const joinDate = member.joinedAt.toDateString();
        const position = message.guild.members.cache
            .sort((a,b) => a.joinedTimestamp - b.joinedTimestamp)
            .map((m,i) => ({id:m.id, pos:i+1}))
            .find(m => m.id === member.id).pos;
        message.channel.send(`${member.user.tag} join pada ${joinDate}, posisi ke-${position} di server`);
    }
};
