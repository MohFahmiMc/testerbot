const {
    SlashCommandBuilder,
    EmbedBuilder,
    PermissionFlagsBits
} = require("discord.js");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("topinviter")
        .setDescription("Show the top inviters in this server.")
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild),

    async execute(interaction) {
        await interaction.deferReply();

        try {
            const invites = await interaction.guild.invites.fetch();

            if (!invites || invites.size === 0) {
                return interaction.editReply("<:utility8:1357261385947418644> No invites found in this server.");
            }

            // Count invites by inviter
            const inviterMap = {};

            invites.forEach(inv => {
                const inviterId = inv.inviter ? inv.inviter.id : null;
                if (!inviterId) return;

                if (!inviterMap[inviterId]) {
                    inviterMap[inviterId] = 0;
                }

                inviterMap[inviterId] += inv.uses;
            });

            const sorted = Object.entries(inviterMap)
                .sort((a, b) => b[1] - a[1])
                .slice(0, 10);

            if (sorted.length === 0) {
                return interaction.editReply("<:utility8:1357261385947418644> No invite usage data available.");
            }

            // Build leaderboard
            let description = "";

            for (let i = 0; i < sorted.length; i++) {
                const [userId, uses] = sorted[i];

                const user = await interaction.client.users.fetch(userId).catch(() => null);

                description += `**${i + 1}. ${user ? user.tag : "Unknown User"}** — **${uses} uses**\n`;
            }

            // Build premium embed
            const embed = new EmbedBuilder()
                .setColor("#2b2d31") // Premium dark
                .setAuthor({
                    name: `Top Inviters — ${interaction.guild.name}`,
                    iconURL: interaction.guild.iconURL({ size: 256 })
                })
                .setDescription(description)
                .setThumbnail(interaction.guild.iconURL({ size: 256 }))
                .setFooter({
                    text: `Requested by ${interaction.user.tag}`,
                    iconURL: interaction.user.displayAvatarURL({ size: 256 })
                })
                .setTimestamp();

            interaction.editReply({ embeds: [embed] });

        } catch (error) {
            console.error(error);

            return interaction.editReply(
                "<:utility8:1357261385947418644> Failed to fetch inviter data. Please try again later."
            );
        }
    },
};
