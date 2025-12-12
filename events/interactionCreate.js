const { PermissionsBitField, EmbedBuilder } = require("discord.js");
const fs = require("fs");
const path = require("path");

// ==============================
// 📊 GLOBAL COMMAND STATS
// ==============================
const statsPath = path.join(__dirname, "../data/commandStats.json");

function loadStats() {
    if (!fs.existsSync(statsPath))
        fs.writeFileSync(statsPath, JSON.stringify({}, null, 2));

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

// ==============================
// 🕵️ ANONYMOUS HANDLER
// ==============================
const anonymousHandler = require("../anonymousHandler");

// ==============================
// 📌 MAIN INTERACTION HANDLER
// ==============================
module.exports = {
    name: "interactionCreate",

    async execute(interaction, client) {

        // =========================================================
        // 🔹 SLASH COMMAND HANDLER
        // =========================================================
        if (interaction.isChatInputCommand()) {

            trackCommand(interaction.commandName, interaction.guild?.name);

            const command = client.commands.get(interaction.commandName);
            if (!command) {
                return interaction.reply({
                    content: "Command not found.",
                    flags: 64
                });
            }

            // Permission check
            const filePath = command.filePath || "";
            if (filePath.includes("moderation")) {
                if (!interaction.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
                    return interaction.reply({
                        content: "You need **Administrator** permission to use this command.",
                        flags: 64
                    });
                }
            }

            // AUTO DEFER — prevent 10062 error
            try {
                if (!interaction.deferred && !interaction.replied) {
                    await interaction.deferReply(); // SAFE
                }
            } catch (e) {
                console.error("Defer error:", e);
                return;
            }

            // EXECUTE COMMAND
            try {
                await command.execute(interaction, client);
            } catch (err) {
                console.error("Command Error:", err);

                const embed = new EmbedBuilder()
                    .setColor("#2b2d31")
                    .setTitle("<:utility8:1357261385947418644> Command Error")
                    .setDescription(
                        "An unexpected error occurred while executing this command.\n" +
                        "Please report this using **/report**."
                    )
                    .setTimestamp();

                // Always editReply after defer
                if (interaction.deferred) {
                    await interaction.editReply({ embeds: [embed] });
                } else {
                    await interaction.reply({ embeds: [embed], flags: 64 });
                }
            }
        }

        // =========================================================
        // 🔹 ANONYMOUS BUTTON / MODAL
        // =========================================================
        if (interaction.isButton() || interaction.isModalSubmit()) {
            try {
                await anonymousHandler(interaction);
            } catch (err) {
                console.error("Anonymous handler error:", err);
            }
        }
    }
};
