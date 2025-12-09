// commands/moderation/audituser.js
const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require("discord.js");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("audituser")
        .setDescription("View audit logs for a specific user.")
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
        .addUserOption(opt =>
            opt.setName("user")
                .setDescription("Select the user to view logs from")
                .setRequired(true)
        )
        .addIntegerOption(opt =>
            opt.setName("limit")
                .setDescription("How many logs to display (max 20)")
                .setRequired(false)
        ),

    async execute(interaction) {
        const user = interaction.options.getUser("user");
        const limit = interaction.options.getInteger("limit") || 10;

        if (limit > 20) {
            return interaction.reply({
                content: "<:WARN:1447849961491529770> Max limit is **20**.",
                ephemeral: true
            });
        }

        const logs = await interaction.guild.fetchAuditLogs({ limit: 50 });

        const filtered = logs.entries.filter(entry =>
            entry.executor?.id === user.id
        ).first(limit);

        if (!filtered || filtered.length === 0) {
            return interaction.reply({
                content: `<:WARN:1447849961491529770> No audit logs found for **${user.tag}**.`,
                ephemeral: true
            });
        }

        const entries = filtered.map(entry => {
            const target = entry.target?.name || entry.target?.tag || "Unknown";

            return (
                `**<:blueutility4:1357261525387182251> Action:** ${entry.action}\n` +
                `**🎯 Target:** ${target}\n` +
                `**<:yes:1447855754634858608> Time:** <t:${Math.floor(entry.createdTimestamp / 1000)}:R>\n`
            );
        }).join("\n──────────────\n");

        const embed = new EmbedBuilder()
            .setColor("#4A90E2")
            .setTitle(`<:utility8:1357261385947418644> Audit Log — ${user.tag}`)
            .setThumbnail(user.displayAvatarURL())
            .setDescription(entries)
            .setTimestamp()
            .setFooter({
                text: `Requested by ${interaction.user.tag}`,
                iconURL: interaction.user.displayAvatarURL()
            });

        await interaction.reply({ embeds: [embed] });
    }
};
