const {
    ModalBuilder,
    TextInputBuilder,
    TextInputStyle,
    ActionRowBuilder,
    EmbedBuilder,
    ButtonBuilder,
    ButtonStyle
} = require("discord.js");

module.exports = async (interaction) => {

    // ================================
    // CREATE NEW ANONYMOUS CHAT
    // ================================
    if (interaction.customId === "anon_create") {

        const modal = new ModalBuilder()
            .setCustomId("modal_anon_create")
            .setTitle("Create Anonymous Message");

        const userIdInput = new TextInputBuilder()
            .setCustomId("targetId")
            .setLabel("Target User ID")
            .setPlaceholder("123456789012345678")
            .setStyle(TextInputStyle.Short)
            .setRequired(true);

        const messageInput = new TextInputBuilder()
            .setCustomId("messageContent")
            .setLabel("Message Content")
            .setPlaceholder("Type your anonymous message...")
            .setStyle(TextInputStyle.Paragraph)
            .setRequired(true);

        modal.addComponents(
            new ActionRowBuilder().addComponents(userIdInput),
            new ActionRowBuilder().addComponents(messageInput)
        );

        return await interaction.showModal(modal);
    }

    // ================================
    // SEND ANONYMOUS MESSAGE
    // ================================
    if (interaction.customId === "modal_anon_create") {

        const targetId = interaction.fields.getTextInputValue("targetId");
        const messageContent = interaction.fields.getTextInputValue("messageContent");

        const targetUser = await interaction.client.users.fetch(targetId).catch(() => null);

        if (!targetUser) {
            return interaction.reply({
                content: "❌ Invalid user ID.",
                ephemeral: true
            });
        }

        const anonChannel = interaction.guild.channels.cache.find(
            ch => ch.name === "anonymous-chat"
        );

        if (!anonChannel) {
            return interaction.reply({
                content: "❌ Channel `anonymous-chat` tidak ditemukan.",
                ephemeral: true
            });
        }

        const embed = new EmbedBuilder()
            .setColor(0x2b2d31)
            .setTitle("📨 Anonymous Message")
            .setDescription(messageContent)
            .setTimestamp()
            .setFooter({
                text: "Anonymous",
                iconURL: interaction.client.user.displayAvatarURL()
            });

        const row = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setCustomId("anon_reply")
                .setLabel("Reply")
                .setStyle(ButtonStyle.Secondary),
            new ButtonBuilder()
                .setCustomId("anon_create")
                .setLabel("Create New")
                .setStyle(ButtonStyle.Secondary)
        );

        await anonChannel.send({ embeds: [embed], components: [row] });

        return interaction.reply({
            content: "Your anonymous message has been sent.",
            ephemeral: true
        });
    }

    // ================================
    // OPEN REPLY MODAL
    // ================================
    if (interaction.customId === "anon_reply") {

        const modal = new ModalBuilder()
            .setCustomId("modal_anon_reply")
            .setTitle("Reply to Anonymous Message");

        const replyInput = new TextInputBuilder()
            .setCustomId("replyMessage")
            .setLabel("Your Reply")
            .setStyle(TextInputStyle.Paragraph)
            .setRequired(true);

        modal.addComponents(
            new ActionRowBuilder().addComponents(replyInput)
        );

        return await interaction.showModal(modal);
    }

    // ================================
    // SEND REPLY
    // ================================
    if (interaction.customId === "modal_anon_reply") {

        const replyMsg = interaction.fields.getTextInputValue("replyMessage");

        const anonChannel = interaction.guild.channels.cache.find(
            ch => ch.name === "anonymous-chat"
        );

        if (!anonChannel) {
            return interaction.reply({
                content: "❌ Channel `anonymous-chat` tidak ditemukan.",
                ephemeral: true
            });
        }

        const embed = new EmbedBuilder()
            .setColor(0x2b2d31)
            .setTitle("💬 Anonymous Reply")
            .setDescription(replyMsg)
            .setTimestamp()
            .setFooter({
                text: "Anonymous",
                iconURL: interaction.client.user.displayAvatarURL()
            });

        const row = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setCustomId("anon_reply")
                .setLabel("Reply Again")
                .setStyle(ButtonStyle.Secondary),
            new ButtonBuilder()
                .setCustomId("anon_create")
                .setLabel("Create New Chat")
                .setStyle(ButtonStyle.Secondary)
        );

        await anonChannel.send({ embeds: [embed], components: [row] });

        return interaction.reply({
            content: "Reply sent anonymously.",
            ephemeral: true
        });
    }
};
