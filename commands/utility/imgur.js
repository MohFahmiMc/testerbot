const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const axios = require("axios");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("imgur")
        .setDescription("Upload an image to Imgur and get the HD link.")
        .addAttachmentOption(opt =>
            opt.setName("image")
                .setDescription("Select the image to upload")
                .setRequired(true)
        ),

    async execute(interaction, client) {
        const file = interaction.options.getAttachment("image");

        if (!file || !file.contentType?.startsWith("image/")) {
            return interaction.reply({
                content: "The uploaded file is not an image.",
                ephemeral: true
            });
        }

        await interaction.deferReply();

        try {
            // Download image
            const imgBuffer = Buffer.from(
                (await axios.get(file.url, { responseType: "arraybuffer" })).data
            );

            // Upload to Imgur
            const upload = await axios.post(
                "https://api.imgur.com/3/image",
                imgBuffer,
                {
                    headers: {
                        Authorization: `Client-ID ${process.env.IMGUR_CLIENT_ID}`,
                        "Content-Type": "application/octet-stream"
                    }
                }
            );

            const link = upload.data.data.link;

            // Create embed
            const embed = new EmbedBuilder()
                .setTitle("Image Uploaded Successfully")
                .setDescription(`Your image has been uploaded to Imgur.`)
                .setColor("#2b2d31") // grey/dark
                .addFields(
                    { name: "File Name", value: file.name, inline: true },
                    { name: "Imgur Link", value: `[Click here to view](${link})`, inline: true }
                )
                .setImage(link)
                .setThumbnail(client.user.displayAvatarURL())
                .setFooter({ text: client.user.username, iconURL: client.user.displayAvatarURL() })
                .setTimestamp();

            return interaction.editReply({ embeds: [embed] });

        } catch (err) {
            console.error("IMGUR UPLOAD ERROR:", err);
            return interaction.editReply("Upload failed! Please try again or check the file size.");
        }
    }
};
