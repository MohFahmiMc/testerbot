module.exports = {
    name: 'kick',
    description: 'Kick member',
    async execute(message, args){
        if(!message.member.permissions.has("KickMembers")) return message.reply("Kamu tidak punya izin!");
        const member = message.mentions.members.first();
        if(!member) return message.reply("Tag user yang mau di kick!");
        member.kick().then(() => message.channel.send(`${member.user.tag} telah di-kick!`));
    }
};
