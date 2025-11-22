const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const fetch = require("node-fetch");
const admins = require("../../data/admins.json");
require("dotenv").config();

module.exports = {
    data: new SlashCommandBuilder()
        .setName("botrestart2")
        .setDescription("Restart bot di Railway dengan progress bar (Owner/Admin Only)"),

    async execute(interaction) {
        const ownerId = process.env.OWNER_ID;
        const userId = interaction.user.id;

        // Permission Check
        if (userId !== ownerId && !admins.includes(userId)) {
            return interaction.reply({
                content: "❌ Kamu tidak memiliki izin menggunakan perintah ini.",
                flags: 64
            });
        }

        // Embed progress awal
        let progress = 0;
        const embed = new EmbedBuilder()
            .setTitle("🔄 Restarting Bot…")
            .setDescription(this.progressBar(progress))
            .setColor("Yellow")
            .setTimestamp();

        await interaction.reply({ embeds: [embed] });

        // PROGRESS ANIMASI
        const interval = setInterval(async () => {
            progress += 10;
            const updateEmbed = new EmbedBuilder()
                .setTitle("🔄 Restarting Bot…")
                .setDescription(this.progressBar(progress))
                .setColor("Yellow");

            await interaction.editReply({ embeds: [updateEmbed] });

            if (progress >= 50) {
                clearInterval(interval);
                // Mulai restart Railway
                this.restartRailway(interaction);
            }
        }, 1000);
    },

    // PROGRESS BAR FUNCTION
    progressBar(percent) {
        const total = 20;
        const filled = Math.round((percent / 100) * total);
        const empty = total - filled;

        return `Progress: [${"█".repeat(filled)}${"░".repeat(empty)}] ${percent}%`;
    },

    // RAILWAY RESTART FUNCTION
    async restartRailway(interaction) {
        const SERVICE_ID = process.env.RAILWAY_SERVICE_ID;
        const TOKEN = process.env.RAILWAY_TOKEN;

        try {
            // Trigger restart
            const res = await fetch(
                `https://backboard.railway.app/v2/services/${SERVICE_ID}/deploy`,
                {
                    method: "POST",
                    headers: {
                        "Authorization": `Bearer ${TOKEN}`,
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({})
                }
            );

            if (!res.ok) {
                throw new Error("Gagal menjalankan restart Railway.");
            }

            // Progress ke 100%
            const finalEmbed = new EmbedBuilder()
                .setTitle("✅ Bot Restarting")
                .setDescription(
                    "Progress: [████████████████████] 100%\n\n" +
                    "Bot sedang restart di Railway...\n⏳ Tunggu ±10–20 detik."
                )
                .setColor("Green")
                .setFooter({ text: "Railway Deployment Triggered" })
                .setTimestamp();

            await interaction.editReply({ embeds: [finalEmbed] });

        } catch (err) {
            console.error(err);

            return interaction.editReply({
                content: "❌ Terjadi kesalahan saat restart Railway.",
            });
        }
    }
};
