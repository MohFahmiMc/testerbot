const { EmbedBuilder } = require("discord.js");
const fs = require("fs");
const path = require("path");

const dataPath = path.join(__dirname, "../giveaways/data.json");

function loadData() {
    if (!fs.existsSync(dataPath)) {
        fs.writeFileSync(dataPath, JSON.stringify({ giveaways: [] }, null, 2));
    }
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
                return interaction.reply({
                    content: "❌ This command is not available.",
                    ephemeral: true,
                });
            }

            try {
                await command.execute(interaction, client);
            } catch (err) {
                console.error(err);

                return interaction.reply({
                    content: "⚠️ An error occurred. Join support: https://discord.gg/FkvM362RJu",
                    ephemeral: true,
                });
            }
        }

        // =====================
        // BUTTON (Giveaway join)
        // =====================
        if (interaction.isButton()) {
            if (!interaction.customId.startsWith("gw_join_")) return;

            const id = interaction.customId.replace("gw_join_", "");
            const data = loadData();
            const gw = data.giveaways.find((g) => g.id === id);

            if (!gw) {
                return interaction.reply({ content: "❌ Giveaway not found.", ephemeral: true });
            }

            if (gw.paused) {
                return interaction.reply({
                    content: "⏸️ This giveaway is currently paused.",
                    ephemeral: true,
                });
            }

            if (!gw.entrants.includes(interaction.user.id)) {
                gw.entrants.push(interaction.user.id);
                saveData(data);
            }

            return interaction.reply({
                content: "🎉 You joined the giveaway!",
                ephemeral: true,
            });
        }
    },
};
