const {
    SlashCommandBuilder,
    EmbedBuilder,
    PermissionsBitField
} = require("discord.js");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("unmute")
        .setDescription("Unmute a member in the server")
        .addUserOption(option =>
            option.setName("member")
                .setDescription("Member to unmute")
                .setRequired(true)
        ),

    async execute(interaction) {
        const member = interaction.options.getMember("member");

        // Permission check
        if (!interaction.member.permissions.has(PermissionsBitField.Flags.ModerateMembers)) {
            return interaction.reply({
                content: "<:utility8:1357261385947418644> You do not have permission to unmute members.",
                ephemeral: true
            });
        }

        const mutedRole = interaction.guild.roles.cache.find(
            r => r.name.toLowerCase() === "muted"
        );

        if (!mutedRole) {
            return interaction.reply({
                content: "<:utility8:1357261385947418644> No **Muted** role found on this server.",
                ephemeral: true
            });
        }

        if (!member.roles.cache.has(mutedRole.id)) {
            return interaction.reply({
                content: "<:utility8:1357261385947418644> This user is **not muted**.",
                ephemeral: true
            });
        }

        // Remove muted role
        await member.roles.remove(mutedRole);

        // Fancy embed (same style as about.js)
        const embed = new EmbedBuilder()
            .setColor("#2b2d31")
            .setAuthor({
                name: `Member Unmuted`,
                iconURL: interaction.guild.iconURL({ size: 256 })
            })
            .setThumbnail(member.user.displayAvatarURL({ size: 256 }))
            .setDescription(`🔊 **${member.user.tag}** has been successfully **unmuted**.`)
            .addFields(
                {
                    name: "👤 Unmuted User",
                    value: `${member}`,
                    inline: true
                },
                {
                    name: "🛠️ Action by",
                    value: `${interaction.user}`,
                    inline: true
                }
            )
            .setFooter({
                text: `${interaction.guild.name} • Moderation`,
                iconURL: interaction.guild.iconURL()
            })
            .setTimestamp();

        await interaction.reply({ embeds: [embed] });
    },
};
