module.exports = {
    name: "serverinfo",
    description: "Show server information",
    options: [],
    async execute(interaction) {
        const guild = interaction.guild;
        const msg = `Server: ${guild.name}\nID: ${guild.id}\nMembers: ${guild.memberCount}`;
        if (interaction.isChatInputCommand()) {
            await interaction.reply(msg);
        } else {
            interaction.channel.send(msg);
        }
    }
};
