const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
require("dotenv").config();

module.exports = {
    data: new SlashCommandBuilder()
        .setName("restart")
        .setDescription("Restart bot (Owner only)"),

    async execute(interaction) {

        // Ambil owner dari .env
        const owners = process.env.OWNERS
            ? process.env.OWNERS.split(",")
            : [process.env.OWNER_ID];

        // Cek apakah user adalah owner
        if (!owners.includes(interaction.user.id)) {
            return interaction.reply({
                content: "❌ | Kamu **bukan owner** bot.",
                ephemeral: true
            });
        }

        // Embed status restart
        const embed = new EmbedBuilder()
            .setTitle("🔄 Restarting Bot…")
            .setDescription("Bot akan restart dalam beberapa detik.\nSilakan tunggu…")
            .setColor("#ffcc00")
            .setFooter({ text: `Diminta oleh ${interaction.user.tag}` })
            .setTimestamp();

        await interaction.reply({ embeds: [embed] });

        console.log("⚠ Restart requested by owner:", interaction.user.id);

        // Delay biar embed sempat terkirim
        setTimeout(() => {
            process.exit(1); // Railway / PM2 / Termux akan auto start lagi
        }, 3000);
    }
};
