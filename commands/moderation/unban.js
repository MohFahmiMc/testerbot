const {
    SlashCommandBuilder,
    PermissionFlagsBits,
    EmbedBuilder
} = require("discord.js");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("unban")
        .setDescription("Unban a user from the server.")
        .addStringOption(option =>
            option.setName("user_id")
                .setDescription("ID of the user to unban")
                .setRequired(true)
        )
        .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers),

    async execute(interaction) {
        const userId = interaction.options.getString("user_id");

        // Emojis sama dengan ban.js & about.js
        const E = {
            success: "<:utility12:1357261389399593004>",
            mod: "<a:Developer1:1357261458014212116>",
            error: "<:error12:1357260010303918090>",
            unban: "<:Utility1:1357261430684123218>"
        };

        await interaction.deferReply();

        // ----- ERROR EMBED -----
        const errorEmbed = (msg) =>
            new EmbedBuilder()
                .setColor(0xE74C3C)
                .setDescription(`${E.error} **Error:** ${msg}`)
                .setTimestamp();

        try {
            const banList = await interaction.guild.bans.fetch();
            const bannedUser = banList.get(userId);

            if (!bannedUser) {
                return interaction.editReply({
                    embeds: [errorEmbed("User is not banned or invalid ID.")]
                });
            }

            await interaction.guild.members.unban(userId);

            const embed = new EmbedBuilder()
                .setColor(0x2b2d31)
                .setTitle(`${E.unban} User Unbanned`)
                .setThumbnail(bannedUser.user.displayAvatarURL())
                .addFields(
                    {
                        name: `${E.success} User`,
                        value: `${bannedUser.user.tag}\n(\`${bannedUser.user.id}\`)`,
                        inline: true
                    },
                    {
                        name: `${E.mod} Moderator`,
                        value: `${interaction.user.tag}`,
                        inline: true
                    }
                )
                .setFooter({
                    text: `Unban Action • ${interaction.guild.name}`,
                    iconURL: interaction.guild.iconURL() || undefined
                })
                .setTimestamp();

            return interaction.editReply({ embeds: [embed] });

        } catch (error) {
            console.error(error);
            return interaction.editReply({
                embeds: [errorEmbed("Failed to unban this user. Check the ID and my permissions.")]
            });
        }
    },
};
