const { ButtonBuilder, ButtonStyle, ActionRowBuilder } = require("discord.js");
const fs = require("fs");
const path = require("path");

// ============================
// 🔹 PATH & DATABASE HANDLER
// ============================
const dataPath = path.join(__dirname, "../giveaways/data.json");
const statsPath = path.join(__dirname, "../data/commandStats.json");

// ----- Giveaway Database -----
function loadData() {
    if (!fs.existsSync(dataPath)) {
        fs.writeFileSync(dataPath, JSON.stringify({ giveaways: [] }, null, 2));
    }
    return JSON.parse(fs.readFileSync(dataPath, "utf8"));
}

function saveData(data) {
    fs.writeFileSync(dataPath, JSON.stringify(data, null, 2));
}

// ----- Command Stats -----
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

    stats[commandName] = stats[commandName] || {
        total: 0,
        servers: {}
    };

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

        // ============================
        // 🔹 SLASH COMMAND
        // ============================
        if (interaction.isChatInputCommand()) {
            trackCommand(interaction.commandName, interaction.guild?.name);

            const command = client.commands.get(interaction.commandName);

            if (!command) {
                if (interaction.replied || interaction.deferred) {
                    return interaction.followUp({ content: "Command not found.", ephemeral: true });
                } else {
                    return interaction.reply({ content: "Command not found.", ephemeral: true });
                }
            }

            try {
                await command.execute(interaction, client);
            } catch (err) {
                console.error("Command Execution Error:", err);

                if (interaction.replied || interaction.deferred) {
                    return interaction.followUp({
                        content: "An unexpected error occurred.",
                        ephemeral: true
                    });
                } else {
                    return interaction.reply({
                        content: "An unexpected error occurred.",
                        ephemeral: true
                    });
                }
            }
        }

        // ============================
        // 🔹 GIVEAWAY JOIN BUTTON
        // ============================
        if (interaction.isButton() && interaction.customId.startsWith("gw_join_")) {
            const id = interaction.customId.replace("gw_join_", "");
            const data = loadData();
            const gw = data.giveaways.find(g => g.id === id);

            // Helper untuk hindari error 40060
            const safeReply = async (options) => {
                if (interaction.replied || interaction.deferred) {
                    return interaction.followUp(options);
                } else {
                    return interaction.reply(options);
                }
            };

            if (!gw) {
                return safeReply({ content: "Giveaway not found.", ephemeral: true });
            }

            if (gw.paused) {
                return safeReply({ content: "This giveaway is currently paused.", ephemeral: true });
            }

            // Cek role requirement
            if (gw.requiredRoleId && !interaction.member.roles.cache.has(gw.requiredRoleId)) {
                return safeReply({
                    content: "You do not meet the required role to join this giveaway.",
                    ephemeral: true
                });
            }

            // Tambah peserta
            if (!gw.entrants.includes(interaction.user.id)) {
                gw.entrants.push(interaction.user.id);

                // Extra chance
                if (gw.extraRoleId && interaction.member.roles.cache.has(gw.extraRoleId)) {
                    gw.entrants.push(interaction.user.id);
                }

                saveData(data);

                trackCommand("giveaway_join", interaction.guild?.name);
            }

            // Update button text
            try {
                const msg = await interaction.channel.messages.fetch(gw.messageId);

                if (msg) {
                    const count = new Set(gw.entrants).size;

                    const button = new ButtonBuilder()
                        .setCustomId(`gw_join_${gw.id}`)
                        .setLabel(`Join Giveaway (${count} joined)`)
                        .setStyle(ButtonStyle.Primary);

                    const row = new ActionRowBuilder().addComponents(button);
                    await msg.edit({ components: [row] }).catch(() => {});
                }
            } catch (err) {
                console.log("Button Update Error:", err.message);
            }

            return safeReply({
                content: "You have successfully joined the giveaway!",
                ephemeral: true
            });
        }
    }
};
