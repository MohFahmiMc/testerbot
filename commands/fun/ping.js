const { SlashCommandBuilder } = require("discord.js");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("ping")
        .setDescription("Check the bot's latency."),

    async execute(interaction) {
        // Mengirim reply sementara dan mengambil object pesan
        const sent = await interaction.reply({ content: "Pinging...", fetchReply: true });

        const botLatency = sent.createdTimestamp - interaction.createdTimestamp;
        const apiLatency = interaction.client.ws.ping;

        await interaction.editReply(
            `🏓 **Pong!**\n` +
            `Bot latency: **${botLatency}ms**\n` +
            `API latency: **${apiLatency}ms**`
        );
    },
};
