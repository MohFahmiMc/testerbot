module.exports = {
    name: 'ban',
    description: 'Ban member',
    async execute(message, args){
        if(!message.member.permissions.has("BanMembers")) return message.reply("Kamu tidak punya izin!");
        const member = message.mentions.members.first();
        if(!member) return message.reply("Tag user yang mau di ban!");
        member.ban({ reason: 'Dibanned oleh bot' }).then(() => message.channel.send(`${member.user.tag} telah di-ban!`));
    }
};
