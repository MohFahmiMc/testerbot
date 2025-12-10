const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("serverroles") // 🔥 Biar beda dari moderation roles
        .setDescription("Show all server roles with member counts."),

    async execute(interaction) {

        await interaction.deferReply();

        const roles = interaction.guild.roles.cache
            .filter(role => role.name !== "@everyone")
            .sort((a, b) => b.position - a.position);

        if (roles.size === 0)
            return interaction.editReply("❌ This server has no roles.");

        const roleList = roles
            .map(role => `> <@&${role.id}> — **${role.members.size}** members`)
            .join("\n");

        const embed = new EmbedBuilder()
            .setColor("#1e1f22")
            .setAuthor({
                name: `${interaction.guild.name} — Roles`,
                iconURL: interaction.guild.iconURL({ size: 256 })
            })
            .setDescription(
                roleList.length > 3900
                    ? roleList.slice(0, 3900) + "\n\n**…and more roles**"
                    : roleList
            )
            .addFields({
                name: "📌 Total Roles",
                value: `**${roles.size} roles**`,
                inline: true
            })
            .setThumbnail(interaction.guild.iconURL({ size: 256 }))
            .setFooter({
                text: `Requested by ${interaction.user.username}`,
                iconURL: interaction.user.displayAvatarURL()
            })
            .setTimestamp();

        await interaction.editReply({ embeds: [embed] });
    }
};
