const {
    SlashCommandBuilder,
    EmbedBuilder,
    PermissionFlagsBits
} = require("discord.js");
const fetch = require("node-fetch");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("emoji")
        .setDescription("Utility lengkap untuk mengelola emoji")
        .addSubcommand(sub =>
            sub.setName("steal")
                .setDescription("Ambil banyak emoji dari server lain atau URL")
                .addStringOption(opt =>
                    opt.setName("emoji")
                        .setDescription("Emoji custom / URL emoji (bisa lebih dari 1)")
                        .setRequired(true)
                )
        )
        .addSubcommand(sub =>
            sub.setName("upload")
                .setDescription("Upload emoji dari URL")
                .addStringOption(opt =>
                    opt.setName("url").setDescription("URL gambar emoji").setRequired(true)
                )
                .addStringOption(opt =>
                    opt.setName("nama").setDescription("Nama emoji").setRequired(true)
                )
        )
        .addSubcommand(sub =>
            sub.setName("delete")
                .setDescription("Hapus emoji dari server")
                .addStringOption(opt =>
                    opt.setName("emoji").setDescription("Emoji yang ingin dihapus").setRequired(true)
                )
        )
        .addSubcommand(sub =>
            sub.setName("rename")
                .setDescription("Rename emoji")
                .addStringOption(opt =>
                    opt.setName("emoji").setDescription("Emoji yang ingin direname").setRequired(true)
                )
                .addStringOption(opt =>
                    opt.setName("nama").setDescription("Nama baru emoji").setRequired(true)
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
                    opt.setName("emoji").setDescription("Emoji custom").setRequired(true)
                )
        )
        .addSubcommand(sub =>
            sub.setName("clone")
                .setDescription("Clone semua emoji dari server lain menggunakan ID server.")
                .addStringOption(opt =>
                    opt.setName("server_id").setDescription("ID server asal emoji.").setRequired(true)
                )
        ),

    async execute(interaction) {
        const sub = interaction.options.getSubcommand();
        const guild = interaction.guild;

        // ==========================================================================================
        // FUNGSI PARSE EMOJI
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

        // =====================================================================
        // STEAL MULTIPLE EMOJI
        // =====================================================================
        if (sub === "steal") {
            const input = interaction.options.getString("emoji");

            const items = input.split(/\s+/); // pisah spasi
            let success = [];
            let failed = [];

            await interaction.reply("⏳ **Processing emojis...**");

            for (const item of items) {
                try {
                    let parsed = parseEmoji(item);
                    let url, name;

                    if (parsed) {
                        url = parsed.url;
                        name = parsed.name;
                    } else if (item.startsWith("http")) {
                        url = item;
                        name = "emoji_" + Date.now();
                    } else {
                        failed.push(item);
                        continue;
                    }

                    const img = await fetch(url);
                    const buffer = Buffer.from(await img.arrayBuffer());

                    const newEmoji = await guild.emojis.create({
                        attachment: buffer,
                        name: name
                    });

                    success.push(newEmoji.toString());
                } catch {
                    failed.push(item);
                }
            }

            const embed = new EmbedBuilder()
                .setTitle("✨ Emoji Stealer Result")
                .setColor("#ffffff")
                .addFields(
                    {
                        name: "✅ Berhasil",
                        value: success.length ? success.join(" ") : "*Tidak ada*"
                    },
                    {
                        name: "❌ Gagal",
                        value: failed.length ? failed.join(" ") : "*Tidak ada*"
                    }
                )
                .setFooter({ text: `Zephyr Emoji Utility • ${interaction.user.username}` })
                .setTimestamp();

            return interaction.editReply({ embeds: [embed] });
        }

        // =====================================================================
        // UPLOAD EMOJI
        // =====================================================================
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
            } catch {
                return interaction.reply("❌ Gagal upload emoji.");
            }
        }

        // =====================================================================
        // DELETE EMOJI
        // =====================================================================
        if (sub === "delete") {
            const emojiInput = interaction.options.getString("emoji");
            const parsed = parseEmoji(emojiInput);

            if (!parsed) return interaction.reply("❌ Emoji tidak valid.");

            const emoji = guild.emojis.cache.get(parsed.id);
            if (!emoji) return interaction.reply("❌ Emoji tidak ada di server ini.");

            await emoji.delete();
            return interaction.reply(`🗑️ Emoji **${parsed.name}** berhasil dihapus.`);
        }

        // =====================================================================
        // RENAME EMOJI
        // =====================================================================
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

        // =====================================================================
        // LIST EMOJI
        // =====================================================================
        if (sub === "list") {
            const emojis = guild.emojis.cache.map(e => e.toString()).join(" ");

            const embed = new EmbedBuilder()
                .setTitle(`🧩 Emoji List (${guild.emojis.cache.size})`)
                .setDescription(emojis || "*Tidak ada emoji di server ini.*")
                .setColor("#ffffff")
                .setFooter({ text: "Zephyr Emoji Utility" });

            return interaction.reply({ embeds: [embed] });
        }

        // =====================================================================
        // INFO EMOJI
        // =====================================================================
        if (sub === "info") {
            const emojiInput = interaction.options.getString("emoji");
            const parsed = parseEmoji(emojiInput);

            if (!parsed) return interaction.reply("❌ Emoji tidak valid.");

            const emoji = guild.emojis.cache.get(parsed.id);
            if (!emoji) return interaction.reply("❌ Emoji tidak ada di server.");

            const embed = new EmbedBuilder()
                .setTitle(`ℹ️ Info Emoji: ${emoji.name}`)
                .setThumbnail(emoji.url)
                .addFields(
                    { name: "ID", value: emoji.id, inline: true },
                    { name: "Animated", value: emoji.animated ? "Ya" : "Tidak", inline: true },
                    { name: "URL", value: emoji.url }
                )
                .setColor("#ffffff")
                .setFooter({ text: "Zephyr Emoji Utility" });

            return interaction.reply({ embeds: [embed] });
        }

        // =====================================================================
        // CLONE EMOJI
        // =====================================================================
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
                .setTitle("🔁 Emoji Clone Result")
                .setColor("#ffffff")
                .setDescription(
`Clone selesai!

**Server Asal:** ${targetGuild.name}
**Total Emoji:** ${emojis.size}
**Berhasil:** ${success}
**Gagal:** ${failed}

> Gagal biasanya karena slot penuh atau ukuran file terlalu besar.`
                )
                .setFooter({ text: "Zephyr Emoji Utility" })
                .setTimestamp();

            return interaction.followUp({ embeds: [embed] });
        }
    }
};
