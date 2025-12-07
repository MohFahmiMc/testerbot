const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const fs = require("fs");
const path = require("path");

const UPDATES_FILE = path.join(__dirname, "../../data/updates.json");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("latestupdate")
        .setDescription("Show the most recent bot update."),

    async execute(interaction) {
        await interaction.deferReply();

        if (!fs.existsSync(UPDATES_FILE)) {
            return interaction.editReply("No update history found.");
        }

        const updates = JSON.parse(fs.readFileSync(UPDATES_FILE, "utf8"));
        const latest = updates[0];

        const embed = new EmbedBuilder()
            .setTitle(`Latest Update — ${latest.version}`)
            .setColor("#0099ff")
            .addFields({
                name: latest.title,
                value: `Category: ${latest.category}\nDate: ${latest.date}\n${latest.url}`
            })
            .setTimestamp();

        interaction.editReply({ embeds: [embed] });
    }
};
