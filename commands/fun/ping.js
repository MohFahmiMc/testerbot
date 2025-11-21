module.exports = {
    name: "ping",
    description: "Check bot latency",
    options: [],
    async execute(interaction) {
        if (interaction.isChatInputCommand()) {
            await interaction.reply(`🏓 Pong! Latency: ${Date.now() - interaction.createdTimestamp}ms`);
        } else {
            const message = interaction;
            message.reply(`🏓 Pong! Latency: ${Date.now() - message.createdTimestamp}ms`);
        }
    }
};
