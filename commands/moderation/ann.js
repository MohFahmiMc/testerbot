const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("announcement")
        .setDescription("Send an announcement in this server.")
        .addStringOption(option =>
            option.setName("type")
                .setDescription("Choose the announcement type.")
                .setRequired(true)
                .addChoices(
                    { name: "Embed", value: "embed" },
                    { name: "Chat", value: "chat" }
                )
        )
        .addStringOption(option =>
            option.setName("message")
                .setDescription("The announcement content.")
                .setRequired(true)
        )
        .addRoleOption(option =>
            option.setName("role")
                .setDescription("Ping a role (optional).")
                .setRequired(false)
        ),

    async execute(interaction) {
        await interaction.deferReply({ ephemeral: true }); // 🔒 SAFE → Tidak error lagi

        const type = interaction.options.getString("type");
        const messageContent = interaction.options.getString("message");
        const role = interaction.options.getRole("role");

        // 🔊 Emoji baru yang profesional
        const announceEmoji = "📢";
        const successEmoji = "📨";

        // ============================
        //        EMBED MODE
        // ============================
        if (type === "embed") {
            const embed = new EmbedBuilder()
                .setColor("#2B7BFF")
                .setTitle(`${announceEmoji} Announcement`)
                .setDescription(messageContent)
                .setThumbnail(interaction.client.user.displayAvatarURL())
                .setFooter({
                    text: `Sent by ${interaction.user.tag}`,
                    iconURL: interaction.user.displayAvatarURL()
                })
                .setTimestamp();

            // Kirim pengumuman
            await interaction.channel.send({
                content: role ? `${role}` : null,
                embeds: [embed]
            });

            return interaction.editReply({
                content: `${successEmoji} Your announcement has been delivered successfully!`
            });
        }

        // ============================
        //         CHAT MODE
        // ============================
        if (type === "chat") {
            await interaction.channel.send(
                role ? `${role} ${messageContent}` : messageContent
            );

            return interaction.editReply({
                content: `${successEmoji} Your announcement has been delivered successfully!`
            });
        }
    }
};
