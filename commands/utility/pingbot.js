const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("pingbot")
        .setDescription("Check bot latency."),

    async execute(interaction, client) {

        const ping = client.ws.ping;

        const embed = new EmbedBuilder()
            .setColor("#3498db")
            .setTitle("🏓 Bot Ping")
            .setThumbnail(interaction.guild.iconURL({ size: 256 }))
            .addFields(
                { name: "📡 WebSocket Ping", value: `${ping}ms`, inline: true },
                { name: "⏱️ Response Time", value: "Testing...", inline: true }
            )
            .setFooter({ text: interaction.guild.name })
            .setTimestamp();

        const msg = await interaction.reply({ embeds: [embed], fetchReply: true });

        // Update response time setelah pesan terkirim
        const responseTime = msg.createdTimestamp - interaction.createdTimestamp;

        embed.data.fields[1].value = `${responseTime}ms`;

        await interaction.editReply({ embeds: [embed] });
    }
};
