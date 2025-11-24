const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const axios = require("axios");
const FormData = require("form-data");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("imgur")
        .setDescription("Upload gambar ke hosting cepat dan dapatkan link HD.")
        .addAttachmentOption(opt =>
            opt.setName("image")
                .setDescription("Gambar yang ingin diupload")
                .setRequired(true)
        ),

    async execute(interaction, client) {
        const file = interaction.options.getAttachment("image");

        if (!file || !file.contentType?.startsWith("image/")) {
            return interaction.reply({
                content: "❌ File yang kamu upload bukan gambar!",
                ephemeral: true
            });
        }

        // Kirim pesan awal
        let statusMsg = await interaction.reply({
            content: "⏳ **Sedang memulai upload...**",
            fetchReply: true
        });

        // ➤ Fungsi update progres
        async function updateProgress(persen) {
            const barFilled = Math.round(persen / 10);
            const bar = "█".repeat(barFilled) + "░".repeat(10 - barFilled);

            await statusMsg.edit(`📤 Uploading... **${persen}%**\n\`\`\`[${bar}]\`\`\``);
        }

        try {
            // Step 1: Download gambar (simulasi progress 0–40%)
            for (let p = 0; p <= 40; p += 10) {
                await updateProgress(p);
                await new Promise(r => setTimeout(r, 200));
            }

            const imgBuffer = Buffer.from(
                (await axios.get(file.url, { responseType: "arraybuffer" })).data
            );

            // Step 2: Proses file (40–70%)
            for (let p = 50; p <= 70; p += 10) {
                await updateProgress(p);
                await new Promise(r => setTimeout(r, 150));
            }

            // Step 3: Upload ke hosting (70–100%)
            const form = new FormData();
            form.append("file", imgBuffer, file.name);

            for (let p = 75; p <= 95; p += 10) {
                await updateProgress(p);
                await new Promise(r => setTimeout(r, 150));
            }

            const upload = await axios.post(
                "https://upload.imge.us/api/upload",
                form,
                { headers: form.getHeaders() }
            );

            const link = upload.data.file.url;

            await updateProgress(100);

            // === EMBED AKHIR ===
            const embed = new EmbedBuilder()
                .setTitle("🎉 Upload Berhasil!")
                .setDescription("Gambar berhasil diupload ke hosting cepat.\nKlik link di bawah untuk membuka.")
                .setColor("#00c7ff")
                .addFields(
                    { name: "📎 Link:", value: link },
                    { name: "🖼 File:", value: file.name }
                )
                .setImage(link)
                .setThumbnail(client.user.displayAvatarURL())
                .setFooter({
                    text: `Diminta oleh ${interaction.user.username}`,
                    iconURL: interaction.user.displayAvatarURL()
                })
                .setTimestamp();

            return statusMsg.edit({
                content: "",
                embeds: [embed]
            });

        } catch (err) {
            console.error("UPLOAD ERROR:", err);
            return statusMsg.edit("❌ Upload gagal! Hosting sedang down atau file terlalu besar.");
        }
    }
};
