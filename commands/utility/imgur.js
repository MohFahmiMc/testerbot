const axios = require("axios");
const { AttachmentBuilder, EmbedBuilder } = require("discord.js");
const FormData = require("form-data");

module.exports = {
    name: "imgur",
    description: "Upload gambar ke Imgur dan dapatkan link.",
    options: [
        {
            name: "gambar",
            description: "Upload gambar.",
            type: 11, // attachment
            required: true
        }
    ],

    run: async (client, interaction) => {
        const file = interaction.options.getAttachment("gambar");

        // Validasi format image
        if (!file.contentType.startsWith("image/")) {
            return interaction.reply({
                content: "❌ File tersebut bukan gambar!",
                ephemeral: true
            });
        }

        // Kirim embed loading + progres
        const loadingEmbed = new EmbedBuilder()
            .setTitle("📤 Uploading Gambar ke Imgur...")
            .setColor("#FFA500")
            .setDescription("Progres: **0%**")
            .setThumbnail(client.user.displayAvatarURL())
            .setTimestamp();

        const msg = await interaction.reply({ embeds: [loadingEmbed], fetchReply: true });

        // Fungsi update progres palsu (karena Imgur anon tidak punya progres asli)
        async function updateProgress(percent) {
            loadingEmbed.setDescription(`Progres: **${percent}%**`);
            await msg.edit({ embeds: [loadingEmbed] });
        }

        // Simulasi progres upload
        await updateProgress(20);
        await new Promise(r => setTimeout(r, 500));
        await updateProgress(45);
        await new Promise(r => setTimeout(r, 500));
        await updateProgress(70);
        await new Promise(r => setTimeout(r, 400));
        await updateProgress(90);

        try {
            // Upload ke Imgur (tanpa API key)
            const form = new FormData();
            form.append("image", await axios.get(file.url, { responseType: "arraybuffer" }).then(r => Buffer.from(r.data)));

            const upload = await axios.post("https://api.imgur.com/3/image", form, {
                headers: {
                    ...form.getHeaders(),
                    Authorization: "Client-ID 73487f1368e6420" // PUBLIC CLIENT-ID (gratis)
                }
            });

            const link = upload.data.data.link;

            await updateProgress(100);

            const resultEmbed = new EmbedBuilder()
                .setTitle("✅ Berhasil Upload ke Imgur!")
                .setColor("#00FF7F")
                .setThumbnail(client.user.displayAvatarURL())
                .addFields(
                    { name: "📎 Link Gambar", value: link },
                    { name: "🖼 Nama File", value: file.name }
                )
                .setImage(link)
                .setFooter({ text: `Diminta oleh ${interaction.user.username}`, iconURL: interaction.user.displayAvatarURL() })
                .setTimestamp();

            return msg.edit({ embeds: [resultEmbed] });

        } catch (e) {
            console.log(e);
            return msg.edit({
                content: "❌ Gagal upload ke Imgur!",
                embeds: []
            });
        }
    }
};
