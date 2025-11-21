const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("trigger")
        .setDescription("Set a trigger to make the bot reply automatically")
        .addStringOption(option =>
            option.setName("trigger")
                .setDescription("The word or phrase to trigger")
                .setRequired(true))
        .addStringOption(option =>
            option.setName("chat")
                .setDescription("The bot's reply when triggered")
                .setRequired(true)),

    async execute(interaction) {
        const triggerText = interaction.options.getString("trigger");
        const replyText = interaction.options.getString("chat");

        // Simpan trigger di memory sementara (atau bisa di JSON/file/database)
        if (!interaction.client.triggers) interaction.client.triggers = [];
        interaction.client.triggers.push({
            trigger: triggerText.toLowerCase(),
            reply: replyText
        });

        const embed = new EmbedBuilder()
            .setTitle("Trigger Set!")
            .setDescription(`✅ Trigger: \`${triggerText}\`\nReply: \`${replyText}\``)
            .setColor("Green")
            .setFooter({ text: "ScarilyId Bot", iconURL: interaction.client.user.displayAvatarURL() });

        await interaction.reply({ embeds: [embed], ephemeral: true });
    }
};
