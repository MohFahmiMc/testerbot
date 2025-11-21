const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('auditlog')
        .setDescription('Shows the latest audit log entry in this server.')
        .setDefaultMemberPermissions(PermissionFlagsBits.ViewAuditLog),

    async execute(interaction) {
        try {
            const logs = await interaction.guild.fetchAuditLogs({ limit: 1 });
            const entry = logs.entries.first();

            if (!entry) {
                return interaction.reply({
                    content: 'No audit log entries found.',
                    ephemeral: true
                });
            }

            const embed = new EmbedBuilder()
                .setTitle('📜 Latest Audit Log Entry')
                .addFields(
                    { name: 'Action', value: entry.actionType || 'Unknown', inline: true },
                    { name: 'Target', value: String(entry.target) || 'Unknown', inline: true },
                    { name: 'Executor', value: entry.executor ? `<@${entry.executor.id}>` : 'Unknown', inline: true },
                    { name: 'Reason', value: entry.reason || 'No reason provided.' }
                )
                .setColor(0x00ADEF)
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
