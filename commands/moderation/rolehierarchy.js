const { EmbedBuilder } = require("discord.js");

module.exports = {
    data: {
        name: "rolehierarchy",
        description: "Show the server role hierarchy"
    },
    async execute(interaction) {
        const roles = interaction.guild.roles.cache
            .sort((a, b) => b.position - a.position)
            .map(role => role.name)
            .join("\n");

        const embed = new EmbedBuilder()
            .setTitle("📊 Server Role Hierarchy")
            .setDescription(roles || "No roles found")
            .setColor("Blue")
            .setTimestamp();

        interaction.reply({ embeds: [embed] });
    }
};
