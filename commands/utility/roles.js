module.exports = {
    name: 'roles',
    description: 'Tampilkan semua role member',
    async execute(message, args){
        const member = message.mentions.members.first() || message.member;
        const roles = member.roles.cache.map(r => r.name).join(", ");
        message.channel.send(`${member.user.tag} memiliki roles: ${roles}`);
    }
};
