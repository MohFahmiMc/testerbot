const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const fs = require("fs");
const path = require("path");

const warnsFile = path.join(__dirname, "../../data/warns.json");

if (!fs.existsSync(warnsFile)) fs.writeFileSync(warnsFile, "{}");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("removewarn")
        .setDescription("Removes a specific warning from a user.")
        .addUserOption(option =>
            option.setName("user")
                .setDescription("Select a user")
                .setRequired(true)
        )
        .addIntegerOption(option =>
            option.setName("index")
                .setDescription("Warning number to remove (starting from 1)")
                .setRequired(true)
        ),
    async execute(interaction) {
        const user = interaction.options.getUser("user");
        const index = interaction.options.getInteger("index") - 1;

        const warnsData = JSON.parse(fs.readFileSync(warnsFile));

        if (!warnsData[user.id] || warnsData[user.id].length === 0) {
            return interaction.reply({ content: `❌ ${user.tag} has no warnings.`, ephemeral: true });
        }

        if (index < 0 || index >= warnsData[user.id].length) {
            return interaction.reply({ content: `❌ Invalid warning number.`, ephemeral: true });
        }

        const removed = warnsData[user.id].splice(index, 1);
        fs.writeFileSync(warnsFile, JSON.stringify(warnsData, null, 2));

        const embed = new EmbedBuilder()
            .setTitle("✅ Warning Removed")
            .setDescription(`Removed warning #${index + 1} for **${user.tag}**:\n\`${removed[0]}\``)
            .setColor("#f59e0b")
            .setTimestamp();

        interaction.reply({ embeds: [embed] });
    }
};
