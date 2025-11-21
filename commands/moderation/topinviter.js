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
            // Fetch all invites for the guild
            const invites = await interaction.guild.invites.fetch();

            if (!invites || invites.size === 0) {
                return interaction.editReply("There are no invites found in this server.");
            }

            // Count usage per inviter
            const inviterMap = {};

            invites.forEach(inv => {
                const inviterId = inv.inviter ? inv.inviter.id : null;
                if (!inviterId) return;

                if (!inviterMap[inviterId]) {
                    inviterMap[inviterId] = 0;
                }

                inviterMap[inviterId] += inv.uses;
            });

            // Convert to array and sort
            const sorted = Object.entries(inviterMap)
                .sort((a, b) => b[1] - a[1])
                .slice(0, 10);

            if (sorted.length === 0) {
                return interaction.editReply("No invite usage data available.");
            }

            // Build leaderboard text
            let description = "";

            for (let i = 0; i < sorted.length; i++) {
                const [userId, uses] = sorted[i];
                const user = await interaction.client.users.fetch(userId).catch(() => null);

                description += `**${i + 1}. ${user ? user.tag : "Unknown User"}** — ${uses} uses\n`;
            }

            // Build embed
            const embed = new EmbedBuilder()
                .setTitle("Top Inviters")
                .setDescription(description)
                .setColor("#4A90E2")
                .setTimestamp()
                .setFooter({
                    text: interaction.guild.name
                });

            interaction.editReply({ embeds: [embed] });

        } catch (error) {
            console.error(error);
            interaction.editReply("Failed to fetch inviter data. Please try again later.");
        }
    },
};
