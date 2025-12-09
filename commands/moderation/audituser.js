const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("audituser")
        .setDescription("View a user's audit log actions.")
        .addUserOption(option =>
            option
                .setName("user")
                .setDescription("Select a user to view their audit logs.")
                .setRequired(true)
        ),

    async execute(interaction) {
        await interaction.deferReply({ ephemeral: true });

        const guild = interaction.guild;
        const user = interaction.options.getUser("user");

        const E = {
            title: "<:premium_crown:1357260010303918090>",
            user: "<:utility1:1357261562938790050>",
            action: "<:Utility1:1357261430684123218>",
            id: "<:blueutility4:1357261525387182251>",
        };

        const logs = await guild.fetchAuditLogs({ limit: 25 });
        const userLogs = logs.entries.filter(e => e.executorId === user.id);

        if (!userLogs.size) {
            return interaction.editReply({
                content: `${user.tag} has **no audit log actions**.`,
            });
        }

        const embed = new EmbedBuilder()
            .setColor(0x2b2d31)
            .setTitle(`${E.title} Audit Logs — ${user.tag}`)
            .setThumbnail(user.displayAvatarURL())
            .setDescription(`Here are the recent audit log actions done by **${user.tag}**.`)
            .setTimestamp();

        for (const entry of userLogs.values()) {
            embed.addFields({
                name: `${E.action} ${entry.action}`,
                value:
                    `${E.id} Target: **${entry.target?.name || entry.target?.tag || "Unknown"}**\n` +
                    `🕒 <t:${Math.floor(entry.createdTimestamp / 1000)}:R>`,
                inline: false,
            });
        }

        await interaction.editReply({ embeds: [embed] });
    },
};
