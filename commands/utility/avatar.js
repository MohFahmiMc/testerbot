module.exports = {
    name: 'avatar',
    description: 'Tampilkan avatar user',
    async execute(message, args){
        const member = message.mentions.members.first() || message.member;
        message.channel.send(`${member.user.tag}'s avatar: ${member.user.displayAvatarURL({ dynamic: true, size: 1024 })}`);
    }
};
