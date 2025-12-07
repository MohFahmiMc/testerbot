const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('invite')
        .setDescription('Dapatkan link untuk mengundang bot ke server kamu!'),

    async execute(interaction) {

        const embed = new EmbedBuilder()
            .setTitle('🔗 Undang Bot ke Server Kamu!')
            .setDescription('Klik tombol di bawah untuk menambahkan bot atau masuk ke support server.')
            .setColor('#2f3136')
            .setFooter({ text: 'Made by Zephyr Bot', iconURL: interaction.client.user.displayAvatarURL() })
            .setTimestamp();

        const row = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setLabel('➕ Invite Bot')
                    .setStyle(ButtonStyle.Link)
                    .setURL('https://discord.com/oauth2/authorize?client_id=1441022662699909182&permissions=8&integration_type=0&scope=bot'),

                new ButtonBuilder()
                    .setLabel('💬 Support Server')
                    .setStyle(ButtonStyle.Link)
                    .setURL('https://discord.gg/FkvM362RJu')
            );

        await interaction.reply({
            embeds: [embed],
            components: [row],
            ephemeral: false
        });
    }
};
