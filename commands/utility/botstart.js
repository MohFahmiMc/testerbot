const {
    SlashCommandBuilder,
    EmbedBuilder
} = require("discord.js");
const fs = require("fs");
const path = require("path");
const fetch = require("node-fetch");

// Load admins
const adminsPath = path.join(process.cwd(), "data", "admins.json");
let admins = [];
try {
    admins = JSON.parse(fs.readFileSync(adminsPath, "utf8"));
} catch {
    admins = [];
}

// ENV
const OWNER_ID = process.env.OWNER_ID;
const RAILWAY_PROJECT_ID = process.env.RAILWAY_PROJECT_ID;
const RAILWAY_TOKEN = process.env.RAILWAY_TOKEN;

module.exports = {
    data: new SlashCommandBuilder()
        .setName("botrestart")
        .setDescription("Restart bot (Admin & Owner Only)"),

    async execute(interaction) {
        const userId = interaction.user.id;

        if (userId !== OWNER_ID && !admins.includes(userId)) {
            return interaction.reply({
                content: "❌ Kamu tidak memiliki akses.",
                ephemeral: true
            });
        }

        // Progress indicator
        const progress = [
            { p: 10, t: "Menyiapkan permintaan restart…" },
            { p: 35, t: "Menghubungi Railway API…" },
            { p: 55, t: "Railway sedang memproses restart…" },
            { p: 75, t: "Menunggu server mati & hidup kembali…" },
            { p: 100, t: "Bot berhasil direstart!" }
        ];

        function makeBar(percent) {
            const filled = Math.round(percent / 10);
            const empty = 10 - filled;
            return `[${"▓".repeat(filled)}${"░".repeat(empty)}] ${percent}%`;
        }

        const embed = new EmbedBuilder()
            .setTitle("🔄 Bot Restart In Progress")
            .setColor("Yellow")
            .setDescription(makeBar(0) + "\nMenyiapkan…");

        let msg = await interaction.reply({ embeds: [embed], fetchReply: true });

        async function updateProgress(step) {
            const p = progress[step].p;
            const t = progress[step].t;

            embed.setDescription(`${makeBar(p)}\n${t}`);
            await msg.edit({ embeds: [embed] });
        }

        try {
            // Step 1
            await updateProgress(0);
            await new Promise(r => setTimeout(r, 1200));

            // Step 2 — call Railway restart
            await updateProgress(1);

            const url = `https://backboard.railway.app/v2/projects/${RAILWAY_PROJECT_ID}/restart`;

            const res = await fetch(url, {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${RAILWAY_TOKEN}`,
                    "Content-Type": "application/json"
                }
            });

            if (!res.ok) throw new Error("Railway API returned error: " + res.status);

            // Step 3
            await updateProgress(2);
            await new Promise(r => setTimeout(r, 1500));

            // Step 4
            await updateProgress(3);
            await new Promise(r => setTimeout(r, 2000));

            // Step 5 — Done
            embed
                .setColor("Green")
                .setTitle("✅ Bot Restarted Successfully");

            await updateProgress(4);

        } catch (err) {
            embed
                .setTitle("❌ Restart Gagal")
                .setDescription(
                    "Terjadi error saat restart bot:\n```" + err.message + "```"
                )
                .setColor("Red");
            await msg.edit({ embeds: [embed] });
        }
    }
};
