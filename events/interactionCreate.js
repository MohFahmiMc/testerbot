const { ButtonBuilder, ButtonStyle, ActionRowBuilder } = require("discord.js");
const fs = require("fs");
const path = require("path");

const dataPath = path.join(__dirname, "../giveaways/data.json");
const statsPath = path.join(__dirname, "../data/commandStats.json");

// ----- GIVEAWAY DATABASE -----
function loadData() {
    if (!fs.existsSync(dataPath)) {
        fs.writeFileSync(dataPath, JSON.stringify({ giveaways: [] }, null, 2));
    }
    return JSON.parse(fs.readFileSync(dataPath, "utf8"));
}

function saveData(data) {
    fs.writeFileSync(dataPath, JSON.stringify(data, null, 2));
}

// ----- GLOBAL COMMAND STATS -----
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
            // --- TRACKER ---
            trackCommand(interaction.commandName, interaction.guild?.name);

            const command = client.commands.get(interaction.commandName);

            if (!command) {
                return interaction.replied || interaction.deferred
                    ? interaction.followUp({ content: "Command not found.", ephemeral: true })
                    : interaction.reply({ content: "Command not found.", ephemeral: true });
            }

            try {
                await command.execute(interaction, client);
            } catch (err) {
                console.error(err);
                return interaction.replied || interaction.deferred
                    ? interaction.followUp({ content: "An unexpected error occurred.", ephemeral: true })
                    : interaction.reply({ content: "An unexpected error occurred.", ephemeral: true });
            }
        }

        // ============================
        // 🔹 GIVEAWAY JOIN BUTTON
        // ============================
        if (interaction.isButton() && interaction.customId.startsWith("gw_join_")) {
            const id = interaction.customId.replace("gw_join_", "");
            const data = loadData();
            const gw = data.giveaways.find(g => g.id === id);

            if (!gw) return interaction.reply({ content: "Giveaway not found.", ephemeral: true });
            if (gw.paused) return interaction.reply({ content: "This giveaway is paused.", ephemeral: true });
            if (gw.requiredRoleId && !interaction.member.roles.cache.has(gw.requiredRoleId)) {
                return interaction.reply({ content: "You do not meet the role requirement.", ephemeral: true });
            }

            if (!gw.entrants.includes(interaction.user.id)) {
                gw.entrants.push(interaction.user.id);

                if (gw.extraRoleId && interaction.member.roles.cache.has(gw.extraRoleId)) {
                    gw.entrants.push(interaction.user.id); // extra chance
                }

                saveData(data);

                // --- TRACKER untuk tombol join giveaway ---
                trackCommand(`giveaway_join`, interaction.guild?.name);
            }

            // Update button
            try {
                const msg = await interaction.channel.messages.fetch(gw.messageId);
                if (msg) {
                    const uniqueCount = new Set(gw.entrants).size;

                    const button = new ButtonBuilder()
                        .setCustomId(`gw_join_${gw.id}`)
                        .setLabel(`Join Giveaway (${uniqueCount} joined)`)
                        .setStyle(ButtonStyle.Primary);

                    const row = new ActionRowBuilder().addComponents(button);
                    await msg.edit({ components: [row] }).catch(() => {});
                }
            } catch (e) {
                console.log("Failed updating button:", e.message);
            }

            return interaction.reply({ content: "You have joined the giveaway.", ephemeral: true });
        }
    }
};
