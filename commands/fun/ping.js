const {
    SlashCommandBuilder,
    EmbedBuilder
} = require("discord.js");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("ping")
        .setDescription("Cek kecepatan respon bot."),

    async execute(interaction) {

        const ping1 = "<:ping1:1447452221699784715>";
        const ping2 = "<:ping2:1447452235503239178>";
        const ping3 = "<:ping3:1447452238275416168>";
        const verify = "<:verify:1357254182356385852>";
        const attention = "<a:AttentionAnimated:1357258884162785360>";
        const crown = "<:premium_crown:1357260010303918090>";
        const developer = "<a:Developer:1357261458014212116>";

        const now = Date.now();
        const msg = await interaction.reply({ content: `${ping1} Testing ping...`, fetchReply: true });

        const wsPing = interaction.client.ws.ping;
        const apiPing = msg.createdTimestamp - interaction.createdTimestamp;

        // warna status
        const statusEmoji =
            wsPing <= 80 ? ping3 :
            wsPing <= 150 ? ping2 :
            ping1;

        const statusText =
            wsPing <= 80 ? "Sangat Cepat" :
            wsPing <= 150 ? "Stabil" :
            "Lambat";

        const uptime = formatTime(interaction.client.uptime);

        const embed = new EmbedBuilder()
            .setColor("#2b2d31")
            .setTitle(`${crown} Zephyr Ping Status`)
            .setDescription(`Bot operational. Berikut detail latency:`)
            .addFields(
                {
                    name: `${statusEmoji} WebSocket Ping`,
                    value: `\`${wsPing}ms\` — **${statusText}**`,
                    inline: true
                },
                {
                    name: `${verify} API Latency`,
                    value: `\`${apiPing}ms\``,
                    inline: true
                },
                {
                    name: `${developer} Uptime`,
                    value: uptime,
                    inline: true
                }
            )
            .setThumbnail(interaction.client.user.displayAvatarURL({ size: 256 }))
            .setFooter({
                text: "Zephyr Utility • Ping Checker",
                iconURL: interaction.client.user.displayAvatarURL()
            })
            .setTimestamp();

        await interaction.editReply({ content: null, embeds: [embed] });
    }
};

// Format uptime menjadi teks cantik
function formatTime(ms) {
    const s = Math.floor(ms / 1000);
    const h = Math.floor(s / 3600);
    const m = Math.floor((s % 3600) / 60);
    const sec = s % 60;
    return `\`${h}h ${m}m ${sec}s\``;
}
