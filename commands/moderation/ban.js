const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('ban')
        .setDescription('Ban a member from the server.')
        .addUserOption(option =>
            option.setName('user')
                .setDescription('The user to ban')
                .setRequired(true)
        )
        .addStringOption(option =>
            option.setName('reason')
                .setDescription('Reason for the ban')
                .setRequired(false)
        )
        .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers),

    async execute(interaction) {
        const target = interaction.options.getUser('user');
        const reason = interaction.options.getString('reason') || 'No reason provided.';
        const member = interaction.guild.members.cache.get(target.id);

        // Defer reply to avoid "interaction failed"
        await interaction.deferReply({ ephemeral: false });

        // ----- VALIDATION -----

        if (!member) {
            return interaction.editReply(`❌ User **${target.tag}** is not in this server.`);
        }

        if (!interaction.guild.members.me.permissions.has(PermissionFlagsBits.BanMembers)) {
            return interaction.editReply('❌ I do not have permission to ban members.');
        }

        if (!member.bannable) {
            return interaction.editReply(`❌ I cannot ban **${target.tag}**. Their role may be higher than mine.`);
        }

        if (member.id === interaction.user.id) {
            return interaction.editReply('❌ You cannot ban yourself.');
        }

        if (member.id === interaction.guild.ownerId) {
            return interaction.editReply(`❌ You cannot ban the server owner.`);
        }

        // ----- BAN -----
        try {
            await member.ban({ reason });

            await interaction.editReply(
                `✅ **${target.tag}** has been banned.\n**Reason:** ${reason}`
            );

        } catch (err) {
            console.error(err);
            return interaction.editReply('❌ Failed to ban this user.');
        }
    }
};
