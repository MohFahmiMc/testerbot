const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const fs = require("fs");
const path = require("path");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("check")
        .setDescription("Check bot server info or command usage")
        .addSubcommand(sub =>
            sub
                .setName("serverjoin")
                .setDescription("Shows servers the bot has joined"))
        .addSubcommand(sub =>
            sub
                .setName("topcommand")
                .setDescription("Shows top servers by command usage")),

    async execute(interaction) {
        const bot = interaction.client;
        const subcommand = interaction.options.getSubcommand();

        if (subcommand === "serverjoin") {
            const embed = new EmbedBuilder()
                .setTitle("Bot Server Join Info")
                .setColor(0x00FFFF)
                .setFooter({ text: "Zephyr Bot Server Info", iconURL: bot.user.displayAvatarURL() })
                .setTimestamp();

            let desc = "";
            bot.guilds.cache.forEach((guild, i) => {
                desc += `**${i + 1}. ${guild.name}** - ${guild.memberCount} members\n`;
            });

            embed.setDescription(desc || "No servers found.");
            embed.addFields({ name: "Total Servers", value: `${bot.guilds.cache.size}`, inline: true });

            await interaction.reply({ embeds: [embed] });
        }

        else if (subcommand === "topcommand") {
            const commandLogsPath = path.join(__dirname, "../../data/commandLogs.json");
            let commandLogs = {};
            if (fs.existsSync(commandLogsPath)) {
                commandLogs = JSON.parse(fs.readFileSync(commandLogsPath, "utf-8"));
            }

            // Hitung per server
            const serverUsage = {};
            for (const log of Object.values(commandLogs)) {
                if (!log.guildId) continue;
                if (!serverUsage[log.guildId]) serverUsage[log.guildId] = 0;
                serverUsage[log.guildId] += 1;
            }

            // Sort descending
            const sorted = Object.entries(serverUsage).sort((a, b) => b[1] - a[1]).slice(0, 10);

            const embed = new EmbedBuilder()
                .setTitle("Top Servers by Command Usage")
                .setColor(0xFFD700)
                .setFooter({ text: "Zephyr Bot Command Stats", iconURL: bot.user.displayAvatarURL() })
                .setTimestamp();

            let desc = "";
            sorted.forEach(([guildId, count], i) => {
                const guild = bot.guilds.cache.get(guildId);
                desc += `**${i + 1}. ${guild ? guild.name : "Unknown"}** - ${count} commands used\n`;
            });

            embed.setDescription(desc || "No command usage data.");
            await interaction.reply({ embeds: [embed] });
        }
    },
};
