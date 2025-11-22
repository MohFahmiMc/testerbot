const { SlashCommandBuilder, PermissionsBitField, EmbedBuilder } = require("discord.js");
const fs = require("fs");
const path = require("path");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("restoreroles")
        .setDescription("Restore a member's previously saved roles")
        .addUserOption(option =>
            option.setName("member")
                .setDescription("Member to restore roles for")
                .setRequired(true)
        ),

    async execute(interaction) {
        if (!interaction.member.permissions.has(PermissionsBitField.Flags.ManageRoles)) {
            return interaction.reply({ content: "❌ You do not have permission to restore roles.", ephemeral: true });
        }

        const member = interaction.options.getMember("member");
        const filePath = path.join(__dirname, "../data/roles.json");

        if (!fs.existsSync(filePath)) {
            return interaction.reply({ content: "❌ No saved roles data found.", ephemeral: true });
        }

        const rolesData = JSON.parse(fs.readFileSync(filePath, "utf8"));
        const savedRoles = rolesData[member.id];

        if (!savedRoles) {
            return interaction.reply({ content: `❌ No saved roles found for ${member.user.tag}.`, ephemeral: true });
        }

        try {
            // Remove all current roles except @everyone
            const currentRoles = member.roles.cache.filter(r => r.id !== interaction.guild.id);
            await member.roles.remove(currentRoles);

            // Restore saved roles
            const rolesToAdd = savedRoles.filter(roleId => interaction.guild.roles.cache.has(roleId));
            if (rolesToAdd.length > 0) await member.roles.add(rolesToAdd);

            const embed = new EmbedBuilder()
                .setTitle("Roles Restored")
                .setDescription(`✅ Roles for ${member.user.tag} have been restored.`)
                .setColor("Green")
                .setFooter({ text: "Restoreroles command executed" })
                .setTimestamp();

            return interaction.reply({ embeds: [embed] });
        } catch (error) {
            console.error(error);
            return interaction.reply({ content: "❌ An error occurred while restoring roles.", ephemeral: true });
        }
    },
};
