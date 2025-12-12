const { PermissionsBitField, EmbedBuilder } = require("discord.js");
const fs = require("fs");
const path = require("path");

// ==============================
// 📊 GLOBAL COMMAND STATS (non-blocking)
// ==============================
const statsPath = path.join(__dirname, "../data/commandStats.json");

function loadStats() {
    if (!fs.existsSync(statsPath)) fs.writeFileSync(statsPath, JSON.stringify({}, null, 2));
    return JSON.parse(fs.readFileSync(statsPath, "utf8"));
}
function saveStats(data) {
    fs.writeFileSync(statsPath, JSON.stringify(data, null, 2));
}
function trackCommand(commandName, guildName) {
    // non-blocking write so we don't delay interactions
    setImmediate(() => {
        try {
            const stats = loadStats();
            stats[commandName] = stats[commandName] || { total: 0, servers: {} };
            stats[commandName].total++;
            stats[commandName].servers[guildName || "DM"] =
                (stats[commandName].servers[guildName || "DM"] || 0) + 1;
            saveStats(stats);
        } catch (e) {
            console.error("trackCommand error:", e);
        }
    });
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

        // ----- BUTTON / MODAL (anonymous) first: these are not chat commands -----
        if (interaction.isButton() || interaction.isModalSubmit()) {
            try {
                await anonymousHandler(interaction);
            } catch (err) {
                console.error("Anonymous handler error:", err);
                // try to reply ephemerally if possible
                if (!interaction.replied && !interaction.deferred) {
                    await interaction.reply({ content: "An internal error occurred.", flags: 64 }).catch(() => {});
                }
            }
            return;
        }

        // ----- SLASH COMMANDS -----
        if (!interaction.isChatInputCommand()) return;

        // track usage async
        trackCommand(interaction.commandName, interaction.guild?.name);

        const command = client.commands.get(interaction.commandName);
        if (!command) {
            return interaction.reply({ content: "Command not found.", flags: 64 });
        }

        // moderation-folder permission check
        const filePath = command.filePath || "";
        if (filePath.includes("moderation")) {
            if (!interaction.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
                return interaction.reply({ content: "You need **Administrator** permission to use this command.", flags: 64 });
            }
        }

        // NOTE: Do NOT auto-defer here. Let commands decide if they need to defer.
        // If a command sets `handlesDefer: true`, it will defer itself inside execute().

        try {
            await command.execute(interaction, client);
        } catch (err) {
            console.error("Command Error:", err);

            // Nice error embed with your emoji + support server link
            const embed = new EmbedBuilder()
                .setColor("#2b2d31")
                .setTitle("<:utility8:1357261385947418644> Command Error")
                .setDescription(
                    "An unexpected error occurred while executing this command.\n\n" +
                    "Please report this on our support server for help:\n" +
                    "**https://discord.gg/FkvM362RJu**"
                )
                .setTimestamp()
                .setFooter({ text: client.user.username, iconURL: client.user.displayAvatarURL() });

            // If the command already deferred, editReply; otherwise send ephemeral reply
            if (interaction.deferred || interaction.replied) {
                await interaction.editReply({ embeds: [embed] }).catch(() => {});
            } else {
                await interaction.reply({ embeds: [embed], flags: 64 }).catch(() => {});
            }
        }
    }
};
