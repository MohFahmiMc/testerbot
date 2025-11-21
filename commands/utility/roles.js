const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("roles")
        .setDescription("Show all server roles with member counts."),

    async execute(interaction) {

        await interaction.deferReply();

        const roles = interaction.guild.roles.cache
            .filter(role => role.name !== "@everyone")
            .sort((a, b) => b.position - a.position);

        if (roles.size === 0)
            return interaction.editReply("❌ This server has no roles.");

        const roleList = roles
            .map(role => `• **${role.name}** — ${role.members.size} members`)
            .join("\n");

        const embed = new EmbedBuilder()
            .setColor("#3498db")
            .setTitle("📘 Server Roles")
            .setDescription(roleList.slice(0, 3990)) // safety limit
            .setThumbnail(interaction.guild.iconURL({ size: 256 }))
            .setFooter({ text: interaction.guild.name })
            .setTimestamp();

        await interaction.editReply({ embeds: [embed] });
    }
};
