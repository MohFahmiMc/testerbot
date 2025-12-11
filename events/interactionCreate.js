const { PermissionsBitField, EmbedBuilder } = require("discord.js");

// ----- GLOBAL COMMAND STATS -----
const fs = require("fs");
const path = require("path");

const statsPath = path.join(__dirname, "../data/commandStats.json");

function loadStats() {
    if (!fs.existsSync(statsPath)) fs.writeFileSync(statsPath, JSON.stringify({}, null, 2));
    return JSON.parse(fs.readFileSync(statsPath, "utf8"));
}

function saveStats(data) {
    fs.writeFileSync(statsPath, JSON.stringify(data, null, 2));
}

function trackCommand(commandName, guildName) {
    let stats = loadStats();
    stats[commandName] = stats[commandName] || { total: 0, servers: {} };
    stats[commandName].total++;
    stats[commandName].servers[guildName || "DM"] =
        (stats[commandName].servers[guildName || "DM"] || 0) + 1;
    saveStats(stats);
}

// ============================
module.exports = {
    name: "interactionCreate",
    async execute(interaction, client) {

        // ============================
        // 🔹 SLASH COMMAND
        // ============================
        if (interaction.isChatInputCommand()) {

            trackCommand(interaction.commandName, interaction.guild?.name);

            const command = client.commands.get(interaction.commandName);
            if (!command) {
                return interaction.replied || interaction.deferred
                    ? interaction.followUp({ content: "Command not found.", ephemeral: true })
                    : interaction.reply({ content: "Command not found.", ephemeral: true });
            }

            // 🔹 Restrict moderation folder commands to Admin only
            const commandPath = command.filePath || "";
            if (commandPath.includes("moderation")) {
                if (!interaction.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
                    return interaction.reply({
                        content: "You need Administrator permission to use this command.",
                        ephemeral: true
                    });
                }
            }

            try {
                await command.execute(interaction, client);
            } catch (err) {
                console.error(err);

                // === Embed error message ===
                const embed = new EmbedBuilder()
                    .setTitle("<:utility8:1357261385947418644> Command Error")
                    .setDescription(`An unexpected error occurred while executing this command.\nPlease join our support server for assistance: [Support Server](https://discord.gg/FkvM362RJu)`)
                    .setColor("#2b2d31") // grey/dark
                    .setTimestamp()
                    .setFooter({ text: client.user.username, iconURL: client.user.displayAvatarURL() });

                return interaction.replied || interaction.deferred
                    ? interaction.followUp({ embeds: [embed], ephemeral: true })
                    : interaction.reply({ embeds: [embed], ephemeral: true });
            }
        }
    }
};
