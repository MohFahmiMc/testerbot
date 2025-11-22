const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const fs = require("fs");
const UPDATES_FILE = "./data/updates.json";

module.exports = {
    data: new SlashCommandBuilder()
        .setName("update")
        .setDescription("Show the latest bot updates from GitHub."),

    async execute(interaction) {
        if (!fs.existsSync(UPDATES_FILE)) {
            return interaction.reply({ content: "No updates found.", ephemeral: true });
        }

        const updates = JSON.parse(fs.readFileSync(UPDATES_FILE));
        const embed = new EmbedBuilder()
            .setTitle("📜 Bot Updates")
            .setColor("#00FFFF")
            .setFooter({ text: "Powered by GitHub commits" })
            .setTimestamp();

        const latest = updates.slice(0, 5); // tampilkan 5 terbaru
        latest.forEach(u => {
            embed.addFields({
                name: u.message.split("\n")[0], // baris pertama pesan commit
                value: `[View Commit](${u.url}) • ${new Date(u.date).toLocaleString()} • ${u.author}`,
            });
        });

        await interaction.reply({ embeds: [embed] });
    },
};
