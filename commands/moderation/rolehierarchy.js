const {
    SlashCommandBuilder,
    EmbedBuilder,
    PermissionsBitField
} = require("discord.js");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("rolehierarchy")
        .setDescription("Show the server's role hierarchy"),

    async execute(interaction) {
        // Permission check
        if (!interaction.member.permissions.has(PermissionsBitField.Flags.ManageRoles)) {
            return interaction.reply({
                content: "❌ You do not have permission to view the role hierarchy.",
                ephemeral: true
            });
        }

        try {
            // Ambil semua role, urutkan dari paling tinggi
            let roleList = interaction.guild.roles.cache
                .sort((a, b) => b.position - a.position)
                .map(r => `${r} — \`ID: ${r.id}\``)
                .join("\n");

            // Batas embed (4096 chars), antisipasi server besar
            if (roleList.length > 4000) {
                roleList = roleList.slice(0, 4000) + "\n...and more";
            }

            const embed = new EmbedBuilder()
                .setColor("#2B2D31")
                .setTitle(`📜 Role Hierarchy`)
                .setDescription(roleList || "*No roles found*")
                .setFooter({
                    text: interaction.guild.name,
                    iconURL: interaction.guild.iconURL() || undefined
                })
                .setTimestamp();

            return interaction.reply({ embeds: [embed] });

        } catch (err) {
            console.error(err);
            return interaction.reply({
                content: "❌ An error occurred while fetching the role hierarchy.",
                ephemeral: true
            });
        }
    },
};
