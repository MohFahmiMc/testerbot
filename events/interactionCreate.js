const { InteractionResponseFlags, ButtonBuilder, ButtonStyle, ActionRowBuilder } = require("discord.js");
const fs = require("fs");
const path = require("path");

const dataPath = path.join(__dirname, "../giveaways/data.json");

function loadData() {
    if (!fs.existsSync(dataPath)) fs.writeFileSync(dataPath, JSON.stringify({ giveaways: [] }, null, 2));
    return JSON.parse(fs.readFileSync(dataPath, "utf8"));
}

function saveData(data) {
    fs.writeFileSync(dataPath, JSON.stringify(data, null, 2));
}

module.exports = {
    name: "interactionCreate",
    async execute(interaction, client) {

        // =====================
        // SLASH COMMAND
        // =====================
        if (interaction.isChatInputCommand()) {
            const command = client.commands.get(interaction.commandName);
            if (!command) {
                if (interaction.replied || interaction.deferred) {
                    return interaction.followUp({ content: "❌ Command not found", flags: InteractionResponseFlags.Ephemeral });
                } else {
                    return interaction.reply({ content: "❌ Command not found", flags: InteractionResponseFlags.Ephemeral });
                }
            }

            try {
                await command.execute(interaction, client);
            } catch (err) {
                console.error(err);
                if (interaction.replied || interaction.deferred) {
                    await interaction.followUp({ content: "⚠️ An error occurred", flags: InteractionResponseFlags.Ephemeral });
                } else {
                    await interaction.reply({ content: "⚠️ An error occurred", flags: InteractionResponseFlags.Ephemeral });
                }
            }
        }

        // =====================
        // BUTTON JOIN GIVEAWAY
        // =====================
        if (interaction.isButton() && interaction.customId.startsWith("gw_join_")) {
            const id = interaction.customId.replace("gw_join_", "");
            const data = loadData();
            const gw = data.giveaways.find(g => g.id === id);

            if (!gw) return interaction.reply({ content: "❌ Giveaway not found", ephemeral: true });
            if (gw.paused) return interaction.reply({ content: "⏸️ This giveaway is currently paused", ephemeral: true });

            // Check required role
            if (gw.requiredRoleId && !interaction.member.roles.cache.has(gw.requiredRoleId)) {
                return interaction.reply({ content: "🔒 You don't have the required role to join this giveaway.", ephemeral: true });
            }

            // Check if already joined
            if (!gw.entrants.includes(interaction.user.id)) {
                gw.entrants.push(interaction.user.id);

                // Extra entries role -> duplicate ID for extra chance
                if (gw.extraRoleId && interaction.member.roles.cache.has(gw.extraRoleId)) {
                    gw.entrants.push(interaction.user.id);
                }

                saveData(data);
            }

            // Update button label with current participant count
            const msg = await interaction.channel.messages.fetch(gw.messageId).catch(() => null);
            if (msg) {
                const button = new ButtonBuilder()
                    .setCustomId(`gw_join_${gw.id}`)
                    .setLabel(`Join Giveaway (${new Set(gw.entrants).size} joined)`)
                    .setStyle(ButtonStyle.Primary);

                const row = new ActionRowBuilder().addComponents(button);
                await msg.edit({ components: [row] }).catch(() => null);
            }

            return interaction.reply({ content: "🎉 You joined the giveaway!", ephemeral: true });
        }
    }
};
