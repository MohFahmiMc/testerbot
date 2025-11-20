module.exports = {
    name: 'mute',
    description: 'Mute member (beri role Muted)',
    async execute(message, args){
        if(!message.member.permissions.has("ManageRoles")) return message.reply("Kamu tidak punya izin!");
        const member = message.mentions.members.first();
        if(!member) return message.reply("Tag user yang mau di mute!");
        let role = message.guild.roles.cache.find(r => r.name === "Muted");
        if(!role){
            role = await message.guild.roles.create({name: "Muted", permissions: []});
            message.guild.channels.cache.forEach(channel => {
                channel.permissionOverwrites.edit(role, { SendMessages: false, AddReactions: false });
            });
        }
        member.roles.add(role);
        message.channel.send(`${member.user.tag} telah di-mute!`);
    }
};
