const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("announce")
        .setDescription("Send a customizable announcement.")

        // ===== EMBED 1 =====
        .addStringOption(o =>
            o.setName("title")
                .setDescription("Embed title.")
                .setRequired(true)
        )
        .addStringOption(o =>
            o.setName("description")
                .setDescription("Embed description.")
                .setRequired(true)
        )
        .addStringOption(o =>
            o.setName("color")
                .setDescription("Embed color (HEX format, ex: #2b2d31).")
                .setRequired(true)
        )
        .addAttachmentOption(o =>
            o.setName("image")
                .setDescription("Attach an image for this embed.")
                .setRequired(false)
        )
        .addStringOption(o =>
            o.setName("footer")
                .setDescription("Footer text.")
                .setRequired(true)
        )
        .addStringOption(o =>
            o.setName("footer_icon_source")
                .setDescription("Choose footer icon source.")
                .addChoices(
                    { name: "Server Icon", value: "server" },
                    { name: "Bot Profile", value: "bot" },
                    { name: "None", value: "none" }
                )
                .setRequired(true)
        )

        // ===== EMBED 2 (OPTIONAL) =====
        .addStringOption(o =>
            o.setName("title2")
                .setDescription("Second embed title (optional).")
                .setRequired(false)
        )
        .addStringOption(o =>
            o.setName("description2")
                .setDescription("Second embed description (optional).")
                .setRequired(false)
        )
        .addStringOption(o =>
            o.setName("footer2")
                .setDescription("Second embed footer text (optional).")
                .setRequired(false)
        )
        .addStringOption(o =>
            o.setName("footer2_icon_source")
                .setDescription("Second embed footer icon source.")
                .addChoices(
                    { name: "Server Icon", value: "server" },
                    { name: "Bot Profile", value: "bot" },
                    { name: "None", value: "none" }
                )
                .setRequired(false)
        )
        .addAttachmentOption(o =>
            o.setName("image2")
                .setDescription("Second embed image (optional).")
                .setRequired(false)
        ),

    async execute(interaction) {
        await interaction.deferReply({ ephemeral: true });

        const title = interaction.options.getString("title");
        const description = interaction.options.getString("description");
        const color = interaction.options.getString("color");
        const footer = interaction.options.getString("footer");
        const footerIconSource = interaction.options.getString("footer_icon_source");
        const image = interaction.options.getAttachment("image");

        // Resolve footer icon 1
        let footerIcon =
            footerIconSource === "server" ? interaction.guild.iconURL() :
            footerIconSource === "bot" ? interaction.client.user.displayAvatarURL() :
            null;

        // ===== EMBED 1 =====
        const embed1 = new EmbedBuilder()
            .setColor(color)
            .setTitle(title)
            .setDescription(description)
            .setTimestamp();

        if (footer) embed1.setFooter({ text: footer, iconURL: footerIcon || undefined });
        if (image) embed1.setImage(image.url);

        // ===== EMBED 2 (optional) =====
        const title2 = interaction.options.getString("title2");
        const description2 = interaction.options.getString("description2");
        const footer2 = interaction.options.getString("footer2");
        const footer2Source = interaction.options.getString("footer2_icon_source");
        const image2 = interaction.options.getAttachment("image2");

        const embedsToSend = [embed1];

        if (title2 || description2 || footer2 || image2) {
            const embed2 = new EmbedBuilder()
                .setColor(color)
                .setTimestamp();

            if (title2) embed2.setTitle(title2);
            if (description2) embed2.setDescription(description2);

            let footer2Icon =
                footer2Source === "server" ? interaction.guild.iconURL() :
                footer2Source === "bot" ? interaction.client.user.displayAvatarURL() :
                null;

            if (footer2) embed2.setFooter({ text: footer2, iconURL: footer2Icon || undefined });
            if (image2) embed2.setImage(image2.url);

            embedsToSend.push(embed2);
        }

        await interaction.channel.send({ embeds: embedsToSend });

        await interaction.editReply("Announcement sent successfully.");
    }
};
