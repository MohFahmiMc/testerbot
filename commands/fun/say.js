const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('say')
        .setDescription('Make the bot say something.')
        .addStringOption(option =>
            option.setName('message')
                .setDescription('The message you want the bot to say')
                .setRequired(true)
        ),

    async execute(interaction) {
        const text = interaction.options.getString('message');

        // Respond to the interaction first
        await interaction.reply({
            content: `Message sent!`,
            ephemeral: true
        });

        // Send message to channel
        await interaction.channel.send(text);
    }
};
