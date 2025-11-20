module.exports = {
    name: 'userinfo',
    description: 'Tampilkan info user',
    async execute(message, args){
        const member = message.mentions.members.first() || message.member;
        message.channel.send(`Nama: ${member.user.tag}\nID: ${member.id}\nJoined: ${member.joinedAt}`);
    }
};
