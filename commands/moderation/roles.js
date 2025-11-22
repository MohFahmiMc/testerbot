const { SlashCommandBuilder, PermissionFlagsBits, PermissionsBitField } = require("discord.js");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("role")
        .setDescription("Role management commands")
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
        .addSubcommand(sub =>
            sub.setName("create")
               .setDescription("Create a new role")
               .addStringOption(opt => opt.setName("name").setDescription("Role name").setRequired(true))
               .addStringOption(opt => opt.setName("color").setDescription("Hex color code, e.g. #FF0000").setRequired(false))
               .addStringOption(opt => opt.setName("permissions").setDescription("Comma separated permissions, e.g. ManageChannels,KickMembers").setRequired(false))
        )
        .addSubcommand(sub =>
            sub.setName("add")
               .setDescription("Add a role to a member")
               .addUserOption(opt => opt.setName("user").setDescription("Member to give role").setRequired(true))
               .addRoleOption(opt => opt.setName("role").setDescription("Role to give").setRequired(true))
        )
        .addSubcommand(sub =>
            sub.setName("remove")
               .setDescription("Remove a role from a member")
               .addUserOption(opt => opt.setName("user").setDescription("Member to remove role").setRequired(true))
               .addRoleOption(opt => opt.setName("role").setDescription("Role to remove").setRequired(true))
        )
        .addSubcommand(sub =>
            sub.setName("permission")
               .setDescription("Update permissions of a role")
               .addRoleOption(opt => opt.setName("role").setDescription("Role to edit").setRequired(true))
               .addStringOption(opt => opt.setName("permissions").setDescription("Comma separated permissions").setRequired(true))
        ),

    async execute(interaction) {
        const sub = interaction.options.getSubcommand();

        if (sub === "create") {
            const name = interaction.options.getString("name");
            const color = interaction.options.getString("color") || null;
            const perms = interaction.options.getString("permissions") || "";

            let permissions = new PermissionsBitField();
            if (perms) {
                const permArray = perms.split(",").map(p => p.trim());
                permArray.forEach(p => {
                    if (PermissionsBitField.Flags[p]) permissions.add(PermissionsBitField.Flags[p]);
                });
            }

            try {
                const role = await interaction.guild.roles.create({
                    name,
                    color,
                    permissions
                });
                await interaction.reply({ content: `✅ Role **${role.name}** created successfully!` });
            } catch (err) {
                console.error(err);
                await interaction.reply({ content: `❌ Failed to create role: ${err.message}`, ephemeral: true });
            }
        }

        else if (sub === "add") {
            const member = interaction.options.getUser("user");
            const role = interaction.options.getRole("role");

            try {
                const guildMember = await interaction.guild.members.fetch(member.id);
                await guildMember.roles.add(role);
                await interaction.reply(`✅ Added role **${role.name}** to **${member.tag}**`);
            } catch (err) {
                console.error(err);
                await interaction.reply({ content: `❌ Failed to add role: ${err.message}`, ephemeral: true });
            }
        }

        else if (sub === "remove") {
            const member = interaction.options.getUser("user");
            const role = interaction.options.getRole("role");

            try {
                const guildMember = await interaction.guild.members.fetch(member.id);
                await guildMember.roles.remove(role);
                await interaction.reply(`✅ Removed role **${role.name}** from **${member.tag}**`);
            } catch (err) {
                console.error(err);
                await interaction.reply({ content: `❌ Failed to remove role: ${err.message}`, ephemeral: true });
            }
        }

        else if (sub === "permission") {
            const role = interaction.options.getRole("role");
            const perms = interaction.options.getString("permissions");

            const permissions = new PermissionsBitField();
            const permArray = perms.split(",").map(p => p.trim());
            permArray.forEach(p => {
                if (PermissionsBitField.Flags[p]) permissions.add(PermissionsBitField.Flags[p]);
            });

            try {
                await role.setPermissions(permissions);
                await interaction.reply(`✅ Permissions updated for role **${role.name}**`);
            } catch (err) {
                console.error(err);
                await interaction.reply({ content: `❌ Failed to update permissions: ${err.message}`, ephemeral: true });
            }
        }
    }
};
