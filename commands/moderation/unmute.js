const { SlashCommandBuilder, PermissionsBitField } = require("discord.js");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("unmute")
        .setDescription("Unmute a member in the server")
        .addUserOption(option =>
            option.setName("member")
                .setDescription("Member to unmute")
                .setRequired(true)),

    async execute(interaction) {
        const member = interaction.options.getMember("member");

        if (!interaction.member.permissions.has(PermissionsBitField.Flags.ModerateMembers)) {
            return interaction.reply({ content: "❌ You do not have permission to unmute members.", ephemeral: true });
        }

        const mutedRole = interaction.guild.roles.cache.find(r => r.name.toLowerCase() === "muted");
        if (!mutedRole) {
            return interaction.reply({ content: "❌ No muted role found on this server.", ephemeral: true });
        }

        if (!member.roles.cache.has(mutedRole.id)) {
            return interaction.reply({ content: "❌ This member is not muted.", ephemeral: true });
        }

        await member.roles.remove(mutedRole);
        await interaction.reply({ content: `✅ ${member.user.tag} has been unmuted.` });
    },
};
