module.exports = {
    name: 'serverinfo',
    description: 'Info server lengkap',
    async execute(message, args){
        const guild = message.guild;
        message.channel.send(
            `Server: ${guild.name}\nID: ${guild.id}\nMember: ${guild.memberCount}\nOwner: ${guild.ownerId}\nCreated: ${guild.createdAt}`
        );
    }
};
