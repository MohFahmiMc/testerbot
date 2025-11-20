module.exports = {
    name: 'unmute',
    description: 'Unmute member',
    async execute(message, args){
        if(!message.member.permissions.has("ManageRoles")) return message.reply("Kamu tidak punya izin!");
        const member = message.mentions.members.first();
        if(!member) return message.reply("Tag user yang mau di unmute!");
        const role = message.guild.roles.cache.find(r => r.name === "Muted");
        if(!role) return message.reply("Role Muted tidak ditemukan!");
        member.roles.remove(role);
        message.channel.send(`${member.user.tag} telah di-unmute!`);
    }
};
