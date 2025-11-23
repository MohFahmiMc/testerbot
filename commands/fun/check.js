const {
    SlashCommandBuilder,
    EmbedBuilder
} = require("discord.js");
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
        .setName("check")
        .setDescription("Check bot server and command usage statistics.")
        .addSubcommand(sub =>
            sub
                .setName("serverjoin")
                .setDescription("Show every server Zephyr has joined.")
        )
        .addSubcommand(sub =>
            sub
                .setName("topcommand")
                .setDescription("Show global top used commands of Zephyr.")
        ),

    async execute(interaction, client) {
        const sub = interaction.options.getSubcommand();
        const guildName = interaction.guild ? interaction.guild.name : "Unknown Server";

        // Load & update stats
        let stats = loadStats();

        // Track command usage by command + by server
        const cmdKey = sub;
        stats[cmdKey] = stats[cmdKey] || { total: 0, servers: {} };

        stats[cmdKey].total++;
        stats[cmdKey].servers[guildName] =
            (stats[cmdKey].servers[guildName] || 0) + 1;

        saveStats(stats);

        // -----------------------------------
        // 📘 SERVER JOIN LIST
        // -----------------------------------
        if (sub === "serverjoin") {
            const servers = client.guilds.cache;

            const embed = new EmbedBuilder()
                .setTitle("📊 Zephyr Server List")
                .setThumbnail(client.user.displayAvatarURL())
                .setColor("#5865F2")
                .setDescription(
                    `Zephyr is in **${servers.size} servers**.\n\n` +
                    servers
                        .map(g => `• **${g.name}** — \`${g.memberCount} members\``)
                        .join("\n")
                )
                .setFooter({ text: "ScarilyID • Global Server Scanner" })
                .setTimestamp();

            return interaction.reply({ embeds: [embed] });
        }

        // -----------------------------------
        // 🏆 TOP COMMAND
        // -----------------------------------
        if (sub === "topcommand") {
            const stats = loadStats();

            // Format ranking
            const sorted = Object.entries(stats)
                .sort((a, b) => b[1].total - a[1].total)
                .slice(0, 10);

            const embed = new EmbedBuilder()
                .setTitle("🏆 Zephyr Global Top Commands")
                .setThumbnail(client.user.displayAvatarURL())
                .setColor("#FFD700")
                .setTimestamp();

            if (sorted.length === 0) {
                embed.setDescription("No command usage data available yet.");
                return interaction.reply({ embeds: [embed] });
            }

            sorted.forEach(([cmd, data], index) => {
                const serverList = Object.entries(data.servers)
                    .map(([name, count]) => `• ${name}: **${count}x**`)
                    .join("\n");

                embed.addFields({
                    name: `#${index + 1} — **/${cmd}**  (Used ${data.total} times)`,
                    value: serverList || "No server data.",
                });
            });

            return interaction.reply({ embeds: [embed] });
        }
    },
};
