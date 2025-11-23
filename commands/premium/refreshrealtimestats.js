const { SlashCommandBuilder } = require("discord.js");
const fs = require("fs");
const path = require("path");

const statsFile = path.join(__dirname, "../../data/realtimeStats.json");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("refreshrealtimestats")
        .setDescription("Refresh realtime stats berdasarkan Message ID")
        .addStringOption(opt =>
            opt.setName("messageid")
                .setDescription("Masukkan Message ID stats")
                .setRequired(true)
        ),

    async execute(interaction) {
        const messageId = interaction.options.getString("messageid");
        const guildId = interaction.guild.id;

        if (!fs.existsSync(statsFile)) {
            return interaction.reply({ content: "❌ Tidak ada file stats.", ephemeral: true });
        }

        const stats = JSON.parse(fs.readFileSync(statsFile));

        if (!stats[guildId]) {
            return interaction.reply({ content: "❌ Server ini belum pernah membuat realtime stats.", ephemeral: true });
        }

        stats[guildId].messageId = messageId;

        fs.writeFileSync(statsFile, JSON.stringify(stats, null, 2));

        return interaction.reply({ content: "✅ Message ID realtime stats berhasil diperbarui.", ephemeral: true });
    }
};
