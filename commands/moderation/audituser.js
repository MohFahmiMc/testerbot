const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('audituser')
        .setDescription('Shows the latest audit log entry related to a specific user.')
        .setDefaultMemberPermissions(PermissionFlagsBits.ViewAuditLog)
        .addUserOption(option =>
            option
                .setName('target')
                .setDescription('Select the user to check audit logs for.')
                .setRequired(true)
        ),

    async execute(interaction) {
        try {
            const targetUser = interaction.options.getUser('target');

            // Fetch audit logs involving this user
            const logs = await interaction.guild.fetchAuditLogs({ limit: 20 });

            const entry = logs.entries.find(
                e => String(e.target?.id) === targetUser.id
            );

            if (!entry) {
                return interaction.reply({
                    content: `No audit log entries found for **${targetUser.tag}**.`,
                    ephemeral: true
                });
            }

            const embed = new EmbedBuilder()
                .setTitle(`📜 Audit Log for ${targetUser.tag}`)
                .addFields(
                    { name: 'Action', value: entry.actionType || 'Unknown', inline: true },
                    {
                        name: 'Executor',
                        value: entry.executor ? `<@${entry.executor.id}>` : 'Unknown',
                        inline: true
                    },
                    { name: 'Reason', value: entry.reason || 'No reason provided.' }
                )
                .setColor(0xffcc00)
                .setTimestamp(entry.createdAt);

            await interaction.reply({ embeds: [embed] });

        } catch (err) {
            console.error(err);
            return interaction.reply({
                content: '❌ Failed to fetch audit logs.',
                ephemeral: true
            });
        }
    }
};
