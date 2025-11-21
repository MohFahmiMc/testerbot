module.exports = {
    name: "membercount",
    description: "Show total members in server",
    options: [],
    async execute(interaction) {
        const count = interaction.guild.members.cache.size;
        if (interaction.isChatInputCommand()) {
            await interaction.reply(`Total members: ${count}`);
        } else {
            interaction.channel.send(`Total members: ${count}`);
        }
    }
};
