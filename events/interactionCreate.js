const { ButtonBuilder, ButtonStyle, ActionRowBuilder } = require("discord.js");
const fs = require("fs");
const path = require("path");

// ============================
// 🔹 SAFE REPLY (ANTI 40060)
// ============================
async function safeReply(interaction, options) {
    try {
        if (interaction.replied || interaction.deferred) {
            return await interaction.followUp(options);
        }
        return await interaction.reply(options);
    } catch (err) {
        console.error("SafeReply Error:", err.message);
    }
}

// ============================
// 🔹 PATH DATABASE
// ============================
const dataPath = path.join(__dirname, "../giveaways/data.json");
const statsPath = path.join(__dirname, "../data/commandStats.json");

// ============================
// 🔹 LOAD & SAVE UTILITIES
// ============================
function loadData() {
    if (!fs.existsSync(dataPath)) {
        fs.writeFileSync(dataPath, JSON.stringify({ giveaways: [] }, null, 2));
    }
    return JSON.parse(fs.readFileSync(dataPath, "utf8"));
}

function saveData(data) {
    fs.writeFileSync(dataPath, JSON.stringify(data, null, 2));
}

function loadStats() {
    if (!fs.existsSync(statsPath)) {
        fs.writeFileSync(statsPath, JSON.stringify({}, null, 2));
    }
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
// 🔹 MAIN EVENT HANDLER
// ============================
module.exports = {
    name: "interactionCreate",

    async execute(interaction, client) {

        // ======================================================
        // 🔹 HANDLE SLASH COMMAND
        // ======================================================
        if (interaction.isChatInputCommand()) {

            trackCommand(interaction.commandName, interaction.guild?.name);

            const command = client.commands.get(interaction.commandName);

            if (!command) {
                return safeReply(interaction, {
                    content: "Command not found.",
                    flags: 64
                });
            }

            try {
                await command.execute(interaction, client);
            } catch (err) {
                console.error("Command Execution Error:", err);
                return safeReply(interaction, {
                    content: "An unexpected error occurred.",
                    flags: 64
                });
            }
        }

        // ======================================================
        // 🔹 GIVEAWAY JOIN BUTTON
        // ======================================================
        if (interaction.isButton() && interaction.customId.startsWith("gw_join_")) {

            const id = interaction.customId.replace("gw_join_", "");
            const data = loadData();
            const gw = data.giveaways.find(g => g.id === id);

            if (!gw)
                return safeReply(interaction, { content: "Giveaway not found.", flags: 64 });

            if (gw.paused)
                return safeReply(interaction, { content: "This giveaway is paused.", flags: 64 });

            if (gw.requiredRoleId && !interaction.member.roles.cache.has(gw.requiredRoleId)) {
                return safeReply(interaction, {
                    content: "You do not meet the role requirement.",
                    flags: 64
                });
            }

            // Add entrant
            if (!gw.entrants.includes(interaction.user.id)) {

                gw.entrants.push(interaction.user.id);

                // Extra chance
                if (gw.extraRoleId && interaction.member.roles.cache.has(gw.extraRoleId)) {
                    gw.entrants.push(interaction.user.id);
                }

                saveData(data);

                trackCommand("giveaway_join", interaction.guild?.name);
            }

            // Update button counter
            try {
                const msg = await interaction.channel.messages.fetch(gw.messageId);
                if (msg) {
                    const uniqueCount = new Set(gw.entrants).size;

                    const button = new ButtonBuilder()
                        .setCustomId(`gw_join_${gw.id}`)
                        .setLabel(`Join Giveaway (${uniqueCount} joined)`)
                        .setStyle(ButtonStyle.Primary);

                    const row = new ActionRowBuilder().addComponents(button);

                    await msg.edit({ components: [row] });
                }
            } catch (err) {
                console.log("Failed to update button:", err.message);
            }

            return safeReply(interaction, {
                content: "You joined the giveaway!",
                flags: 64
            });
        }
    }
};
