const { Events, EmbedBuilder, PermissionsBitField } = require("discord.js");
const { afkUsers } = require("../utils/afkData");

module.exports = {
    name: Events.InteractionCreate,

    async execute(interaction) {
        if (!interaction.isChatInputCommand()) return;

        // If user is AFK, remove AFK
        if (afkUsers.has(interaction.user.id)) {
            afkUsers.delete(interaction.user.id);

            // Auto-create AFK role if not exists
            let afkRole = interaction.guild.roles.cache.find(r => r.name === "AFK");

            if (!afkRole) {
                afkRole = await interaction.guild.roles.create({
                    name: "AFK",
                    color: "#808080",
                    reason: "Automatically created AFK role"
                });
            }

            // Remove role if user has it
            if (interaction.member.roles.cache.has(afkRole.id)) {
                await interaction.member.roles.remove(afkRole.id);
            }

            const embed = new EmbedBuilder()
                .setColor("#808080")
                .setAuthor({
                    name: `${interaction.user.username} is no longer AFK`,
                    iconURL: interaction.user.displayAvatarURL()
                })
                .setTimestamp()
                .setFooter({ text: "AFK System" });

            return interaction.reply({
                embeds: [embed],
                ephemeral: true
            });
        }
    }
};
