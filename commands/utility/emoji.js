const {
    SlashCommandBuilder,
    EmbedBuilder,
} = require("discord.js");
const fetch = require("node-fetch");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("emoji")
        .setDescription("Utility lengkap untuk mengelola emoji")
        .addSubcommand(sub =>
            sub.setName("steal")
                .setDescription("Ambil emoji dari server lain atau URL")
                .addStringOption(opt =>
                    opt.setName("emoji")
                        .setDescription("Emoji custom / URL emoji")
                        .setRequired(true)
                )
                .addStringOption(opt =>
                    opt.setName("nama")
                        .setDescription("Nama emoji (opsional)")
                )
        )
        .addSubcommand(sub =>
            sub.setName("upload")
                .setDescription("Upload emoji dari URL")
                .addStringOption(opt =>
                    opt.setName("url")
                        .setDescription("URL gambar emoji")
                        .setRequired(true)
                )
                .addStringOption(opt =>
                    opt.setName("nama")
                        .setDescription("Nama emoji")
                        .setRequired(true)
                )
        )
        .addSubcommand(sub =>
            sub.setName("delete")
                .setDescription("Hapus emoji dari server")
                .addStringOption(opt =>
                    opt.setName("emoji")
                        .setDescription("Emoji yang ingin dihapus")
                        .setRequired(true)
                )
        )
        .addSubcommand(sub =>
            sub.setName("rename")
                .setDescription("Rename emoji")
                .addStringOption(opt =>
                    opt.setName("emoji")
                        .setDescription("Emoji yang ingin direname")
                        .setRequired(true)
                )
                .addStringOption(opt =>
                    opt.setName("nama")
                        .setDescription("Nama baru emoji")
                        .setRequired(true)
                )
        )
        .addSubcommand(sub =>
            sub.setName("list")
                .setDescription("Melihat semua emoji server")
        )
        .addSubcommand(sub =>
            sub.setName("info")
                .setDescription("Melihat info detail emoji")
                .addStringOption(opt =>
                    opt.setName("emoji")
                        .setDescription("Emoji custom")
                        .setRequired(true)
                )
        )
        .addSubcommand(sub =>
            sub.setName("clone")
                .setDescription("Clone semua emoji dari server lain menggunakan ID server.")
                .addStringOption(opt =>
                    opt.setName("server_id")
                        .setDescription("ID server asal emoji.")
                        .setRequired(true)
                )
        ),

    async execute(interaction) {
        const sub = interaction.options.getSubcommand();
        const guild = interaction.guild;

        // ==========================================================================================
        // FUNGSI PARSE EMOJI CUSTOM
        const parseEmoji = (emojiInput) => {
            const regex = /<?(a)?:?(\w{2,32}):(\d{17,20})>?/;
            const match = emojiInput.match(regex);
            if (!match) return null;

            return {
                animated: match[1] ? true : false,
                name: match[2],
                id: match[3],
                url: `https://cdn.discordapp.com/emojis/${match[3]}.${match[1] ? "gif" : "png"}`
            };
        };
        // ==========================================================================================

        // ========================= STEAL EMOJI =========================
        if (sub === "steal") {
            const emojiInput = interaction.options.getString("emoji");
            const nameInput = interaction.options.getString("nama");

            const parsed = parseEmoji(emojiInput);
            let url, name;

            if (parsed) {
                url = parsed.url;
                name = nameInput || parsed.name;
            } else {
                url = emojiInput;
                name = nameInput || "emoji_" + Date.now();
            }

            try {
                const img = await fetch(url);
                const buffer = Buffer.from(await img.arrayBuffer());

                const newEmoji = await guild.emojis.create({
                    attachment: buffer,
                    name: name
                });

                return interaction.reply(`✅ Emoji berhasil ditambahkan: ${newEmoji}`);
            } catch (err) {
                return interaction.reply("❌ Gagal mencuri emoji.");
            }
        }

        // ========================= UPLOAD EMOJI =========================
        if (sub === "upload") {
            const url = interaction.options.getString("url");
            const name = interaction.options.getString("nama");

            try {
                const img = await fetch(url);
                const buffer = Buffer.from(await img.arrayBuffer());

                const uploaded = await guild.emojis.create({
                    attachment: buffer,
                    name: name
                });

                return interaction.reply(`✅ Emoji berhasil diupload: ${uploaded}`);
            } catch (err) {
                return interaction.reply("❌ Gagal upload emoji.");
            }
        }

        // ========================= DELETE EMOJI =========================
        if (sub === "delete") {
            const emojiInput = interaction.options.getString("emoji");
            const parsed = parseEmoji(emojiInput);

            if (!parsed) return interaction.reply("❌ Emoji tidak valid.");

            const emoji = guild.emojis.cache.get(parsed.id);
            if (!emoji) return interaction.reply("❌ Emoji tidak ada di server ini.");

            await emoji.delete();
            return interaction.reply(`🗑️ Emoji **${parsed.name}** berhasil dihapus.`);
        }

        // ========================= RENAME EMOJI =========================
        if (sub === "rename") {
            const emojiInput = interaction.options.getString("emoji");
            const newName = interaction.options.getString("nama");

            const parsed = parseEmoji(emojiInput);
            if (!parsed) return interaction.reply("❌ Format emoji salah.");

            const emoji = guild.emojis.cache.get(parsed.id);
            if (!emoji) return interaction.reply("❌ Emoji tidak ada di server ini.");

            await emoji.edit({ name: newName });

            return interaction.reply(`✏️ Emoji berhasil direname menjadi **${newName}**.`);
        }

        // ========================= LIST EMOJI =========================
        if (sub === "list") {
            const emojis = guild.emojis.cache.map(e => e.toString()).join(" ");

            const embed = new EmbedBuilder()
                .setTitle(`Emoji List (${guild.emojis.cache.size})`)
                .setDescription(emojis || "Tidak ada emoji di server ini.")
                .setColor("White");

            return interaction.reply({ embeds: [embed] });
        }

        // ========================= INFO EMOJI =========================
        if (sub === "info") {
            const emojiInput = interaction.options.getString("emoji");
            const parsed = parseEmoji(emojiInput);

            if (!parsed) return interaction.reply("❌ Emoji tidak valid.");

            const emoji = guild.emojis.cache.get(parsed.id);
            if (!emoji) return interaction.reply("❌ Emoji tidak ada di server.");

            const embed = new EmbedBuilder()
                .setTitle(`Info Emoji: ${emoji.name}`)
                .setThumbnail(emoji.url)
                .addFields(
                    { name: "ID", value: emoji.id, inline: true },
                    { name: "Animated", value: emoji.animated ? "Ya" : "Tidak", inline: true },
                    { name: "URL", value: emoji.url }
                )
                .setColor("White");

            return interaction.reply({ embeds: [embed] });
        }

        // ========================= CLONE EMOJI =========================
        if (sub === "clone") {
            const targetID = interaction.options.getString("server_id");
            const targetGuild = interaction.client.guilds.cache.get(targetID);

            if (!targetGuild) {
                return interaction.reply("❌ Bot tidak ada di server tersebut atau server ID salah.");
            }

            const emojis = await targetGuild.emojis.fetch();

            if (emojis.size === 0)
                return interaction.reply("❌ Server itu tidak punya emoji.");

            await interaction.reply(`🔁 Mengkloning **${emojis.size}** emoji dari **${targetGuild.name}**...`);

            let success = 0;
            let failed = 0;

            for (const emoji of emojis.values()) {
                try {
                    const res = await fetch(emoji.url);
                    const buffer = Buffer.from(await res.arrayBuffer());

                    await guild.emojis.create({
                        attachment: buffer,
                        name: emoji.name
                    });

                    success++;
                } catch {
                    failed++;
                }
            }

            const embed = new EmbedBuilder()
                .setTitle("Emoji Clone Result")
                .setColor("White")
                .setThumbnail(targetGuild.iconURL({ size: 256 }))
                .setDescription(
`Clone selesai.

**Dari server:**  
${targetGuild.name}

**Total Emoji:**  
${emojis.size}

**Berhasil:**  
${success}

**Gagal:**  
${failed}

> Biasanya gagal karena slot emoji penuh atau ukuran emoji terlalu besar.`
                );

            return interaction.followUp({ embeds: [embed] });
        }
    }
};
