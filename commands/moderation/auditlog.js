// commands/moderation/auditlog.js
const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require("discord.js");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("auditlog")
        .setDescription("View recent server audit logs.")
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
        .addIntegerOption(opt =>
            opt.setName("limit")
                .setDescription("How many logs to display (max 20)")
                .setRequired(false)
        ),

    async execute(interaction) {
        const limit = interaction.options.getInteger("limit") || 10;

        if (limit > 20) {
            return interaction.reply({
                content: "<:WARN:1447849961491529770> Max limit is **20**.",
                ephemeral: true
            });
        }

        const logs = await interaction.guild.fetchAuditLogs({ limit });

        const entries = logs.entries.map(entry => {
            const executor = entry.executor ? entry.executor.tag : "Unknown";
            const target = entry.target?.name || entry.target?.tag || "Unknown";

            return (
                `**<:box:1447855781205512245> Action:** ${entry.action}\n` +
                `**<:people:1447855732061110406> User:** ${executor}\n` +
                `**🎯 Target:** ${target}\n` +
                `**<:yes:1447855754634858608> Time:** <t:${Math.floor(entry.createdTimestamp / 1000)}:R>\n`
            );
        }).join("\n──────────────\n");

        const embed = new EmbedBuilder()
            .setColor("#4A90E2")
            .setTitle(`<:utility8:1357261385947418644> Server Audit Log`)
            .setDescription(entries || "No audit logs found.")
            .setTimestamp()
            .setFooter({
                text: `Requested by ${interaction.user.tag}`,
                iconURL: interaction.user.displayAvatarURL()
            });

        await interaction.reply({ embeds: [embed] });
    }
};
