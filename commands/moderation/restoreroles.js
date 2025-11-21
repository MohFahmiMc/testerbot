const { EmbedBuilder, PermissionsBitField } = require("discord.js");
const fs = require("fs");
const path = require("path");

module.exports = {
    data: {
        name: "restoreroles",
        description: "Restore a member's previous roles",
        options: [
            {
                name: "user",
                type: 6, // USER
                description: "Member to restore roles",
                required: true
            }
        ]
    },
    async execute(interaction) {
        if (!interaction.member.permissions.has(PermissionsBitField.Flags.ManageRoles)) {
            return interaction.reply({ content: "❌ You don't have permission to manage roles.", ephemeral: true });
        }

        const user = interaction.options.getUser("user");
        const member = interaction.guild.members.cache.get(user.id);

        if (!member) return interaction.reply({ content: "❌ Member not found.", ephemeral: true });

        const filePath = path.join(__dirname, "../data/rolesBackup.json");
        if (!fs.existsSync(filePath)) {
            return interaction.reply({ content: "❌ No roles backup found.", ephemeral: true });
        }

        const rolesData = JSON.parse(fs.readFileSync(filePath, "utf8"));
        const rolesToRestore = rolesData[user.id];
        if (!rolesToRestore) return interaction.reply({ content: "❌ No backup found for this member.", ephemeral: true });

        try {
            const roles = rolesToRestore.filter(roleId => interaction.guild.roles.cache.has(roleId));
            await member.roles.set(roles);

            const embed = new EmbedBuilder()
                .setTitle("✅ Roles Restored")
                .setDescription(`${member.user.tag}'s roles have been restored.`)
                .setColor("Green")
                .setTimestamp();

            interaction.reply({ embeds: [embed] });
        } catch (err) {
            interaction.reply({ content: "❌ Failed to restore roles.", ephemeral: true });
        }
    }
};
