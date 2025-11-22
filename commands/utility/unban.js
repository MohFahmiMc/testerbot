const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('unban')
        .setDescription('Unban a user from the server.')
        .addStringOption(option => 
            option.setName('user_id')
            .setDescription('ID of the user to unban')
            .setRequired(true))
        .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers), // Hanya bisa untuk yang punya permission ban

    async execute(interaction) {
        const userId = interaction.options.getString('user_id');

        try {
            const banList = await interaction.guild.bans.fetch();
            const bannedUser = banList.get(userId);

            if (!bannedUser) {
                return interaction.reply({ content: '❌ User is not banned.', ephemeral: true });
            }

            await interaction.guild.members.unban(userId);

            const embed = new EmbedBuilder()
                .setTitle('✅ User Unbanned')
                .setDescription(`User <@${userId}> has been unbanned.`)
                .setColor('Green')
                .setFooter({ text: `Unbanned by ${interaction.user.tag}`, iconURL: interaction.user.displayAvatarURL() });

            await interaction.reply({ embeds: [embed] });
        } catch (error) {
            console.error(error);
            interaction.reply({ content: '❌ Failed to unban user.', ephemeral: true });
        }
    }
};
