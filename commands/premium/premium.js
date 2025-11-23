const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const fs = require("fs");
const path = require("path");

const premiumPath = path.join(__dirname, "../../data/premium.json");
const keysPath = path.join(__dirname, "../../data/keys.json");
const adminsPath = path.join(__dirname, "../../data/admins.json");

if (!fs.existsSync(premiumPath)) fs.writeFileSync(premiumPath, JSON.stringify({}, null, 2));
if (!fs.existsSync(keysPath)) fs.writeFileSync(keysPath, JSON.stringify({}, null, 2));
if (!fs.existsSync(adminsPath)) fs.writeFileSync(adminsPath, JSON.stringify({}, null, 2));

module.exports = {
    data: new SlashCommandBuilder()
        .setName("premium")
        .setDescription("Premium System Commands")
        .addSubcommand(sc =>
            sc.setName("trial")
                .setDescription("Claim trial premium 12 jam (1x per server)")
        )
        .addSubcommand(sc =>
            sc.setName("add")
                .setDescription("Owner/Admin memberi premium manual")
                .addStringOption(opt =>
                    opt.setName("duration")
                        .setDescription("Durasi: 1d / 7d / 30d / lifetime")
                        .setRequired(true)
                )
        )
        .addSubcommand(sc =>
            sc.setName("addkey")
                .setDescription("Buat premium key (Owner/Admin)")
                .addStringOption(opt =>
                    opt.setName("duration")
                        .setDescription("Durasi: 1d / 7d / 30d / lifetime")
                        .setRequired(true)
                )
        )
        .addSubcommand(sc =>
            sc.setName("redeem")
                .setDescription("Redeem premium key")
                .addStringOption(opt =>
                    opt.setName("key")
                        .setDescription("Key premium")
                        .setRequired(true)
                )
        )
        .addSubcommand(sc =>
            sc.setName("keylist")
                .setDescription("Lihat semua premium key (Owner/Admin)")
        ),

    async execute(interaction) {
        const sub = interaction.options.getSubcommand();
        const guildId = interaction.guild.id;
        const userId = interaction.user.id;

        const OWNER_ID = process.env.OWNER_ID;
        const admins = JSON.parse(fs.readFileSync(adminsPath));
        const isAdminCommand = admins[userId] === true;
        const isOwner = (userId === OWNER_ID);

        const premiumDB = JSON.parse(fs.readFileSync(premiumPath));
        const keysDB = JSON.parse(fs.readFileSync(keysPath));

        // ===========================
        //  SUBCOMMAND: TRIAL
        // ===========================
        if (sub === "trial") {
            if (premiumDB[guildId]?.trialUsed) {
                return interaction.reply({
                    content: "❌ Server ini sudah memakai trial sebelumnya.",
                    ephemeral: true
                });
            }

            const expires = Date.now() + 12 * 60 * 60 * 1000; // 12 jam

            premiumDB[guildId] = {
                expires,
                trialUsed: true
            };

            fs.writeFileSync(premiumPath, JSON.stringify(premiumDB, null, 2));

            return interaction.reply({
                content: "🎉 Trial premium 12 jam berhasil diaktifkan!",
            });
        }

        // ===========================
        //  SUBCOMMAND: ADD (Owner/Admin)
        // ===========================
        if (sub === "add") {
            if (!isOwner && !isAdminCommand) {
                return interaction.reply({
                    content: "❌ Kamu bukan Owner/Admin Command.",
                    ephemeral: true
                });
            }

            const duration = interaction.options.getString("duration");
            const now = Date.now();
            let expires = now;

            if (duration === "1d") expires += 86400000;
            else if (duration === "7d") expires += 604800000;
            else if (duration === "30d") expires += 2592000000;
            else if (duration === "lifetime") expires = 0;

            premiumDB[guildId] = {
                expires,
                trialUsed: premiumDB[guildId]?.trialUsed || false
            };

            fs.writeFileSync(premiumPath, JSON.stringify(premiumDB, null, 2));

            return interaction.reply({
                content: `✅ Premium berhasil ditambahkan! Durasi: **${duration}**`
            });
        }

        // ===========================
        //  SUBCOMMAND: ADDKEY
        // ===========================
        if (sub === "addkey") {
            if (!isOwner && !isAdminCommand) {
                return interaction.reply({
                    content: "❌ Hanya owner/admin command.",
                    ephemeral: true
                });
            }

            const duration = interaction.options.getString("duration");
            const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
            let key = "";

            for (let i = 0; i < 20; i++)
                key += chars[Math.floor(Math.random() * chars.length)];

            keysDB[key] = {
                duration,
                used: false
            };

            fs.writeFileSync(keysPath, JSON.stringify(keysDB, null, 2));

            return interaction.reply({
                content: `✅ Key berhasil dibuat!\n\`\`\`${key}\`\`\`\nDurasi: **${duration}**`,
                ephemeral: true
            });
        }

        // ===========================
        //  SUBCOMMAND: REDEEM
        // ===========================
        if (sub === "redeem") {
            const key = interaction.options.getString("key");

            if (!keysDB[key]) {
                return interaction.reply({ content: "❌ Key tidak valid.", ephemeral: true });
            }
            if (keysDB[key].used) {
                return interaction.reply({ content: "❌ Key sudah digunakan.", ephemeral: true });
            }

            const now = Date.now();
            let expires = now;

            if (keysDB[key].duration === "1d") expires += 86400000;
            else if (keysDB[key].duration === "7d") expires += 604800000;
            else if (keysDB[key].duration === "30d") expires += 2592000000;
            else if (keysDB[key].duration === "lifetime") expires = 0;

            premiumDB[guildId] = {
                expires,
                trialUsed: premiumDB[guildId]?.trialUsed || false
            };

            keysDB[key].used = true;

            fs.writeFileSync(premiumPath, JSON.stringify(premiumDB, null, 2));
            fs.writeFileSync(keysPath, JSON.stringify(keysDB, null, 2));

            return interaction.reply({
                content: `🎉 Premium berhasil diaktifkan!\nDurasi: **${keysDB[key].duration}**`
            });
        }

        // ===========================
        //  SUBCOMMAND: KEYLIST
        // ===========================
        if (sub === "keylist") {
            if (!isOwner && !isAdminCommand) {
                return interaction.reply({ content: "❌ Tidak ada akses.", ephemeral: true });
            }

            let text = "📜 **Daftar Keys:**\n\n";

            for (const key in keysDB) {
                text += `\`${key}\` — **${keysDB[key].duration}** — ${keysDB[key].used ? "❌ Used" : "✅ Active"}\n`;
            }

            return interaction.reply({
                content: text || "Tidak ada key.",
                ephemeral: true
            });
        }
    }
};
