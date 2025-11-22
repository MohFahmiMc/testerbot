const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const fs = require("fs");
const path = require("path");

// Path untuk menyimpan prefix
const prefixesPath = path.join(__dirname, "../../data/prefixes.json");

// Pastikan file ada
if (!fs.existsSync(prefixesPath)) fs.writeFileSync(prefixesPath, JSON.stringify({}));

module.exports = {
    data: new SlashCommandBuilder()
        .setName("setprefix")
        .setDescription("Set a custom prefix for this server")
        .addStringOption(option =>
            option.setName("prefix")
                .setDescription("The new prefix")
                .setRequired(true)
        ),

    async execute(interaction) {
        const newPrefix = interaction.options.getString("prefix").trim();

        // Load existing prefixes
        const prefixes = JSON.parse(fs.readFileSync(prefixesPath, "utf8"));
        prefixes[interaction.guild.id] = newPrefix;

        // Save updated prefixes
        fs.writeFileSync(prefixesPath, JSON.stringify(prefixes, null, 4));

        const embed = new EmbedBuilder()
            .setTitle("✅ Prefix Updated")
            .setDescription(`New prefix for this server is: \`${newPrefix}\``)
            .setColor("#00FF00");

        await interaction.reply({ embeds: [embed], ephemeral: true });
    }
};
