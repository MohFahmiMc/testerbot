const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("uptime")
        .setDescription("Shows how long the bot has been running."),

    async execute(interaction, client) {

        const ping3 = "<:ping3:1447452238275416168>";
        const verify = "<:verify:1357254182356385852>";
        const developer = "<a:Developer:1357261458014212116>";
        const crown = "<:premium_crown:1357260010303918090>";

        const uptime = formatTime(client.uptime);

        const embed = new EmbedBuilder()
            .setColor("#2b2d31")
            .setTitle(`${crown} Zephyr Uptime Status`)
            .setDescription(`Bot is running without interruption. Here is the uptime information:`)
            .addFields(
                {
                    name: `${ping3} Current Uptime`,
                    value: uptime,
                    inline: true
                },
                {
                    name: `${verify} Running Since`,
                    value: `<t:${Math.floor((Date.now() - client.uptime) / 1000)}:R>`,
                    inline: true
                },
                {
                    name: `${developer} System Status`,
                    value: "All systems operational.",
                    inline: true
                }
            )
            .setThumbnail(client.user.displayAvatarURL({ size: 256 }))
            .setFooter({
                text: "Zephyr Utility • Uptime Monitor",
                iconURL: client.user.displayAvatarURL()
            })
            .setTimestamp();

        await interaction.reply({ embeds: [embed] });
    }
};

// Format uptime sama seperti ping.js
function formatTime(ms) {
    const s = Math.floor(ms / 1000);
    const h = Math.floor(s / 3600);
    const m = Math.floor((s % 3600) / 60);
    const sec = s % 60;
    return `\`${h}h ${m}m ${sec}s\``;
}
