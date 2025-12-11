const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");

// Validate HEX color (#ffffff)
function validateHexColor(color) {
    return /^#?[0-9A-Fa-f]{6}$/.test(color);
}

module.exports = {
    data: new SlashCommandBuilder()
        .setName("announcement")
        .setDescription("Send a customizable announcement.")

        // EMBED 1
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
                .setDescription("Embed color (#2b2d31).")
                .setRequired(true)
        )
        .addAttachmentOption(o =>
            o.setName("image")
                .setDescription("Image for embed 1.")
                .setRequired(false)
        )
        .addStringOption(o =>
            o.setName("footer")
                .setDescription("Footer text.")
                .setRequired(true)
        )
        .addStringOption(o =>
            o.setName("footer_icon_source")
                .setDescription("Footer icon source.")
                .addChoices(
                    { name: "Server Icon", value: "server" },
                    { name: "Bot Profile", value: "bot" },
                    { name: "None", value: "none" }
                )
                .setRequired(true)
        )

        // EMBED 2 (OPTIONAL)
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
                .setDescription("Second embed footer (optional).")
                .setRequired(false)
        )
        .addStringOption(o =>
            o.setName("footer2_icon_source")
                .setDescription("Footer icon for embed 2.")
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

        // --- Get main embed options ---
        const title = interaction.options.getString("title");
        const description = interaction.options.getString("description");
        const colorInput = interaction.options.getString("color");
        const footer = interaction.options.getString("footer");
        const footerSource = interaction.options.getString("footer_icon_source");
        const image = interaction.options.getAttachment("image");

        // Color validation
        if (!validateHexColor(colorInput)) {
            return interaction.editReply({
                content: "❌ Invalid HEX color! Use format like `#2b2d31`.",
                ephemeral: true
            });
        }

        const color = colorInput.startsWith("#") ? colorInput : `#${colorInput}`;

        // Footer icon resolver
        let footerIcon =
            footerSource === "server" ? interaction.guild.iconURL() :
            footerSource === "bot" ? interaction.client.user.displayAvatarURL() :
            null;

        // --- EMBED 1 ---
        const embed1 = new EmbedBuilder()
            .setColor(color)
            .setTitle(title)
            .setDescription(description)
            .setTimestamp();

        if (footer)
            embed1.setFooter({
                text: footer,
                iconURL: footerIcon || undefined
            });

        if (image)
            embed1.setImage(image.url);

        const embeds = [embed1];

        // --- Get embed 2 options ---
        const title2 = interaction.options.getString("title2");
        const description2 = interaction.options.getString("description2");
        const footer2 = interaction.options.getString("footer2");
        const footer2Source = interaction.options.getString("footer2_icon_source");
        const image2 = interaction.options.getAttachment("image2");

        // If user fills at least one → build Embed 2
        if (title2 || description2 || footer2 || image2) {
            const embed2 = new EmbedBuilder().setColor(color).setTimestamp();

            if (title2) embed2.setTitle(title2);
            if (description2) embed2.setDescription(description2);

            // footer icon resolver (embed 2)
            let footer2Icon = null;
            if (footer2Source === "server") footer2Icon = interaction.guild.iconURL();
            if (footer2Source === "bot") footer2Icon = interaction.client.user.displayAvatarURL();

            if (footer2) {
                embed2.setFooter({
                    text: footer2,
                    iconURL: footer2Icon || undefined
                });
            }

            if (image2)
                embed2.setImage(image2.url);

            embeds.push(embed2);
        }

        // Send to channel
        await interaction.channel.send({ embeds });

        await interaction.editReply("Announcement sent successfully!");
    }
};
