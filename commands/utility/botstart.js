const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const fs = require("fs");
const path = require("path");
const { exec } = require("child_process");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("botstart")
    .setDescription("Restart bot dengan progress (owner/admin only)"),

  async execute(interaction) {
    await interaction.deferReply({ ephemeral: true });

    const OWNER_ID = process.env.OWNER_ID;
    const adminsPath = path.join(process.cwd(), "data", "admins.json");

    // Load admin list
    let admins = [];
    try {
      if (fs.existsSync(adminsPath)) {
        const raw = fs.readFileSync(adminsPath, "utf8");
        const parsed = JSON.parse(raw);
        admins = Array.isArray(parsed) ? parsed : parsed.admins || [];
      }
    } catch (err) {
      console.error("Load admins error:", err);
    }

    const userId = interaction.user.id;
    if (userId !== OWNER_ID && !admins.includes(userId)) {
      return interaction.editReply({
        content: "❌ Kamu bukan owner/admin.",
        ephemeral: true
      });
    }

    // Embed awal
    const embed = new EmbedBuilder()
      .setTitle("🔄 Restart Bot")
      .setDescription("Memulai proses restart...")
      .setColor("Yellow");

    const msg = await interaction.editReply({ embeds: [embed], fetchReply: true });

    // Progress bar
    function bar(percent) {
      const total = 20;
      const filled = Math.round((percent / 100) * total);
      const empty = total - filled;
      return `\`${"█".repeat(filled)}${"░".repeat(empty)}\` ${percent}%`;
    }

    async function step(p, text) {
      const e = EmbedBuilder.from(embed)
        .setColor(p >= 100 ? "Green" : "Yellow")
        .setDescription(`${bar(p)}\n${text}`);
      try { await msg.edit({ embeds: [e] }); } catch {}
    }

    try {
      await step(10, "Menyiapkan restart...");
      await new Promise(r => setTimeout(r, 600));

      await step(35, "Mengecek PM2...");
      await new Promise(r => setTimeout(r, 600));

      let pm2_available = false;
      let pm2_success = false;

      // Cek apakah pm2 tersedia
      await new Promise(resolve => {
        exec("pm2 -v", (err) => {
          if (!err) pm2_available = true;
          resolve();
        });
      });

      if (pm2_available) {
        await step(60, "Menjalankan `pm2 restart`...");
        await new Promise(r => setTimeout(r, 500));

        await new Promise(resolve => {
          exec("pm2 restart bot || pm2 restart index || pm2 restart 0", (err) => {
            if (!err) pm2_success = true;
            resolve();
          });
        });

        if (pm2_success) {
          await step(80, "PM2 restart sukses!");
        } else {
          await step(80, "PM2 ditemukan, tapi gagal restart. Pindah ke exit()...");
        }

      } else {
        await step(60, "PM2 tidak ditemukan. Gunakan fallback restart...");
      }

      await new Promise(r => setTimeout(r, 600));
      await step(95, "Finalisasi restart...");
      await new Promise(r => setTimeout(r, 600));

      await step(100, "Bot akan restart sekarang...");

      // Restart bot (Railway akan auto-restart karena crash)
      process.exit(0);

    } catch (err) {
      const e = new EmbedBuilder()
        .setTitle("❌ Restart Gagal")
        .setDescription("Terjadi error saat restart bot:\n```" + err.message + "```")
        .setColor("Red");
      try { await msg.edit({ embeds: [e] }); } catch {}
    }
  }
};
