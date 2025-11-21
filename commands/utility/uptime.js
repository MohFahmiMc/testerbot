const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("uptime")
        .setDescription("Shows how long the bot has been running."),

    async execute(interaction, client) {

        // Convert ms → D, H, M, S
        function formatUptime(ms) {
            let seconds = Math.floor(ms / 1000);
            let minutes = Math.floor(seconds / 60);
            let hours = Math.floor(minutes / 60);
            let days = Math.floor(hours / 24);

            seconds %= 60;
            minutes %= 60;
            hours %= 24;

            return {
                days,
                hours,
                minutes,
                seconds
            };
        }

        const uptime = formatUptime(client.uptime);

        const embed = new EmbedBuilder()
            .setColor("#22c55e")
            .setTitle("⏳ Bot Uptime")
            .setDescription(
                `**The bot has been running for:**\n` +
                `\`${uptime.days}d ${uptime.hours}h ${uptime.minutes}m ${uptime.seconds}s\``
            )
            .setThumbnail(client.user.displayAvatarURL({ size: 256 }))
            .setFooter({ text: `${interaction.guild.name}` })
            .setTimestamp();

        await interaction.reply({ embeds: [embed] });

    }
};
