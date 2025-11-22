const { SlashCommandBuilder, EmbedBuilder, PermissionsBitField } = require("discord.js");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("rolehierarchy")
        .setDescription("Show the server's role hierarchy"),

    async execute(interaction) {
        // Periksa permission member
        if (!interaction.member.permissions.has(PermissionsBitField.Flags.ManageRoles)) {
            return interaction.reply({ content: "❌ You do not have permission to view the role hierarchy.", ephemeral: true });
        }

        try {
            // Ambil semua role, urutkan berdasarkan posisi (descending)
            const roles = interaction.guild.roles.cache
                .sort((a, b) => b.position - a.position)
                .map(r => `${r.name} - ID: ${r.id}`)
                .join("\n");

            const embed = new EmbedBuilder()
                .setTitle(`Role Hierarchy for ${interaction.guild.name}`)
                .setDescription(roles || "No roles found")
                .setColor("Blue")
                .setFooter({ text: `Requested by ${interaction.user.tag}` })
                .setTimestamp();

            await interaction.reply({ embeds: [embed] });
        } catch (err) {
            console.error(err);
            return interaction.reply({ content: "❌ An error occurred while fetching the role hierarchy.", ephemeral: true });
        }
    },
};
