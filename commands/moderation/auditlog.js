const { SlashCommandBuilder, EmbedBuilder, AuditLogEvent } = require("discord.js");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("auditlog")
        .setDescription("View the most recent server audit logs."),

    async execute(interaction) {
        await interaction.deferReply({ ephemeral: true });

        const guild = interaction.guild;

        // Emoji set
        const E = {
            title: "<:premium_crown:1357260010303918090>",
            id: "<:blueutility4:1357261525387182251>",
            user: "<:utility1:1357261562938790050>",
            action: "<:Utility1:1357261430684123218>",
        };

        const logs = await guild.fetchAuditLogs({ limit: 10 });
        const entries = logs.entries.map(e => e);

        if (!entries.length) {
            return interaction.editReply("There are no audit logs available.");
        }

        const embed = new EmbedBuilder()
            .setColor(0x2b2d31)
            .setTitle(`${E.title} Recent Audit Logs`)
            .setDescription(`Here are the **10** latest audit logs in **${guild.name}**.`)
            .setTimestamp();

        for (const entry of entries) {
            embed.addFields({
                name: `${E.action} ${entry.action}`,
                value:
                    `${E.user} Executor: **${entry.executor?.tag || "Unknown"}**\n` +
                    `${E.id} Target: **${entry.target?.name || entry.target?.tag || "Unknown"}**\n` +
                    `🕒 <t:${Math.floor(entry.createdTimestamp / 1000)}:R>`,
                inline: false
            });
        }

        await interaction.editReply({ embeds: [embed] });
    },
};
