const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const axios = require("axios");
const FormData = require("form-data");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("imgur")
        .setDescription("Upload gambar ke Imgur dan mendapatkan link.")
        .addAttachmentOption(opt =>
            opt.setName("image")
                .setDescription("Gambar yang ingin kamu upload")
                .setRequired(true)
        ),

    async execute(interaction, client) {
        const file = interaction.options.getAttachment("image");

        if (!file || !file.contentType?.startsWith("image/")) {
            return interaction.reply({
                content: "❌ File tersebut bukan gambar!",
                ephemeral: true
            });
        }

        // Embed progress awal
        const embed = new EmbedBuilder()
            .setTitle("📤 Uploading ke Imgur...")
            .setColor("Orange")
            .setDescription("Progres: **0%**")
            .setThumbnail(client.user.displayAvatarURL())
            .setTimestamp();

        const msg = await interaction.reply({ embeds: [embed], fetchReply: true });

        const updateProgress = async (p) => {
            embed.setDescription(`Progres: **${p}%**`);
            await msg.edit({ embeds: [embed] });
        };

        // Fake progress (karena Imgur tidak support real-time progress)
        await updateProgress(20); await new Promise(r => setTimeout(r, 250));
        await updateProgress(55); await new Promise(r => setTimeout(r, 250));
        await updateProgress(80); await new Promise(r => setTimeout(r, 250));

        try {
            // Download file
            const imgBuffer = Buffer.from(
                (await axios.get(file.url, { responseType: "arraybuffer" })).data
            );

            const form = new FormData();
            form.append("image", imgBuffer);

            // Upload ke Imgur (anonymous API Client-ID)
            const upload = await axios.post("https://api.imgur.com/3/image", form, {
                headers: {
                    ...form.getHeaders(),
                    Authorization: "Client-ID 73487f1368e6420"
                },
            });

            const link = upload.data.data.link;

            await updateProgress(100);

            const finish = new EmbedBuilder()
                .setTitle("✅ Upload Berhasil!")
                .setColor("Green")
                .addFields(
                    { name: "📎 Link Gambar", value: link },
                    { name: "🖼 Nama File", value: file.name }
                )
                .setImage(link)
                .setThumbnail(client.user.displayAvatarURL())
                .setFooter({
                    text: `Diminta oleh ${interaction.user.username}`,
                    iconURL: interaction.user.displayAvatarURL()
                })
                .setTimestamp();

            return msg.edit({ embeds: [finish] });

        } catch (err) {
            console.error("Imgur Upload Error:", err);
            return msg.edit({
                content: "❌ Upload gagal.",
                embeds: []
            });
        }
    }
};
