const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const fs = require("fs");
const path = require("path");

const warnsFile = path.join(__dirname, "../../data/warns.json");

// Pastikan file JSON ada
if (!fs.existsSync(warnsFile)) fs.writeFileSync(warnsFile, "{}");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("clearwarnings")
        .setDescription("Clears all warnings of a user.")
        .addUserOption(option =>
            option.setName("user")
                .setDescription("Select a user to clear warnings")
                .setRequired(true)
        ),
    async execute(interaction) {
        const user = interaction.options.getUser("user");

        const warnsData = JSON.parse(fs.readFileSync(warnsFile));

        if (!warnsData[user.id] || warnsData[user.id].length === 0) {
            return interaction.reply({ content: `❌ ${user.tag} has no warnings.`, ephemeral: true });
        }

        warnsData[user.id] = [];
        fs.writeFileSync(warnsFile, JSON.stringify(warnsData, null, 2));

        const embed = new EmbedBuilder()
            .setTitle("✅ Warnings Cleared")
            .setDescription(`All warnings for **${user.tag}** have been cleared.`)
            .setColor("#22c55e")
            .setTimestamp();

        interaction.reply({ embeds: [embed] });
    }
};
