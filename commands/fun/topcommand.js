const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const fs = require("fs");
const path = require("path");

const statsPath = path.join(__dirname, "../../data/commandStats.json");

// Load stats file
function loadStats() {
    if (!fs.existsSync(statsPath)) return {};
    return JSON.parse(fs.readFileSync(statsPath, "utf8"));
}

// Save stats file
function saveStats(data) {
    fs.writeFileSync(statsPath, JSON.stringify(data, null, 2));
}

module.exports = {
    data: new SlashCommandBuilder()
        .setName("topcommands")
        .setDescription("Show global top used commands of Zephyr."),

    async execute(interaction) {
        const stats = loadStats();

        // Sort & take top 10
        const sorted = Object.entries(stats)
            .sort((a, b) => b[1].total - a[1].total)
            .slice(0, 10);

        const embed = new EmbedBuilder()
            .setTitle("🏆 Zephyr Global Top Commands")
            .setColor("#FFD700")
            .setThumbnail(interaction.client.user.displayAvatarURL())
            .setTimestamp();

        if (sorted.length === 0) {
            embed.setDescription("No command usage data available yet.");
            return interaction.reply({ embeds: [embed] });
        }

        sorted.forEach(([cmd, data], index) => {
            const servers = Object.entries(data.servers)
                .map(([name, count]) => `• ${name}: **${count}x**`)
                .join("\n");

            embed.addFields({
                name: `#${index + 1} — **/${cmd}** (Used ${data.total} times)`,
                value: servers || "No server data.",
            });
        });

        return interaction.reply({ embeds: [embed] });
    },
};
