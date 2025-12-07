const {
    InteractionResponseFlags,
    ButtonBuilder,
    ButtonStyle,
    ActionRowBuilder
} = require("discord.js");
const fs = require("fs");
const path = require("path");

const dataPath = path.join(__dirname, "../giveaways/data.json");

// Load database
function loadData() {
    if (!fs.existsSync(dataPath)) {
        fs.writeFileSync(dataPath, JSON.stringify({ giveaways: [] }, null, 2));
    }
    return JSON.parse(fs.readFileSync(dataPath, "utf8"));
}

// Save database
function saveData(data) {
    fs.writeFileSync(dataPath, JSON.stringify(data, null, 2));
}

module.exports = {
    name: "interactionCreate",
    async execute(interaction, client) {

        // ============================
        // 🔹 SLASH COMMAND
        // ============================
        if (interaction.isChatInputCommand()) {
            const command = client.commands.get(interaction.commandName);

            if (!command) {
                const errorMsg = { content: "Command not found.", flags: InteractionResponseFlags.Ephemeral };

                return interaction.replied || interaction.deferred
                    ? interaction.followUp(errorMsg)
                    : interaction.reply(errorMsg);
            }

            try {
                await command.execute(interaction, client);
            } catch (err) {
                console.error(err);

                const errorMsg = { content: "An unexpected error occurred.", flags: InteractionResponseFlags.Ephemeral };

                return interaction.replied || interaction.deferred
                    ? interaction.followUp(errorMsg)
                    : interaction.reply(errorMsg);
            }
        }

        // ============================
        // 🔹 GIVEAWAY JOIN BUTTON
        // ============================
        if (interaction.isButton() && interaction.customId.startsWith("gw_join_")) {
            const id = interaction.customId.replace("gw_join_", "");
            const data = loadData();
            const gw = data.giveaways.find(g => g.id === id);

            if (!gw)
                return interaction.reply({ content: "Giveaway not found.", ephemeral: true });

            if (gw.paused)
                return interaction.reply({ content: "This giveaway is currently paused.", ephemeral: true });

            // Required role check
            if (gw.requiredRoleId && !interaction.member.roles.cache.has(gw.requiredRoleId)) {
                return interaction.reply({
                    content: "You do not meet the role requirement for this giveaway.",
                    ephemeral: true
                });
            }

            // Add entrant if new
            if (!gw.entrants.includes(interaction.user.id)) {
                gw.entrants.push(interaction.user.id);

                // Extra role entry
                if (gw.extraRoleId && interaction.member.roles.cache.has(gw.extraRoleId)) {
                    gw.entrants.push(interaction.user.id); // duplicate for extra winning chance
                }

                saveData(data);
            }

            // ============================
            // 🔹 UPDATE BUTTON COUNT
            // ============================
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

            return interaction.reply({
                content: "You have joined the giveaway.",
                ephemeral: true
            });
        }
    }
};
