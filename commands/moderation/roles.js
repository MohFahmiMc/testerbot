const {
    SlashCommandBuilder,
    PermissionFlagsBits,
    PermissionsBitField,
    EmbedBuilder
} = require("discord.js");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("role")
        .setDescription("Role management commands")
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)

        .addSubcommand(sub =>
            sub.setName("create")
               .setDescription("Create a new role")
               .addStringOption(opt =>
                    opt.setName("name")
                       .setDescription("Role name")
                       .setRequired(true)
                )
               .addStringOption(opt =>
                    opt.setName("color")
                       .setDescription("Hex color, e.g. #FF0000")
                )
               .addStringOption(opt =>
                    opt.setName("permissions")
                       .setDescription("Comma separated permissions, e.g. ManageChannels,KickMembers")
                )
        )

        .addSubcommand(sub =>
            sub.setName("add")
               .setDescription("Add a role to a member")
               .addUserOption(opt =>
                    opt.setName("user")
                       .setDescription("Member to give role")
                       .setRequired(true)
                )
               .addRoleOption(opt =>
                    opt.setName("role")
                       .setDescription("Role to give")
                       .setRequired(true)
                )
        )

        .addSubcommand(sub =>
            sub.setName("remove")
               .setDescription("Remove a role from a member")
               .addUserOption(opt =>
                    opt.setName("user")
                       .setDescription("Member to remove role from")
                       .setRequired(true)
                )
               .addRoleOption(opt =>
                    opt.setName("role")
                       .setDescription("Role to remove")
                       .setRequired(true)
                )
        )

        .addSubcommand(sub =>
            sub.setName("permission")
               .setDescription("Update permissions of a role")
               .addRoleOption(opt =>
                    opt.setName("role")
                       .setDescription("Role to edit")
                       .setRequired(true)
                )
               .addStringOption(opt =>
                    opt.setName("permissions")
                       .setDescription("Comma separated permissions")
                       .setRequired(true)
                )
        ),

    async execute(interaction) {
        const bot = interaction.client;
        const sub = interaction.options.getSubcommand();

        const E = {
            success: "<:premium_crown:1357260010303918090>",
            error: "<:error1:1357261403834077264>",
            role: "<:utility7:1357261523335426048>",
            edit: "<:utility12:1357261389399593004>",
            add: "<:utility5:1357261508212293652>",
            remove: "<:utility3:1357261492687511692>"
        };

        // Helper: Create embed
        const makeEmbed = (title, description) =>
            new EmbedBuilder()
                .setColor(0x2b2d31)
                .setTitle(title)
                .setDescription(description)
                .setThumbnail(bot.user.displayAvatarURL())
                .setFooter({
                    text: interaction.guild.name,
                    iconURL: interaction.guild.iconURL() || undefined
                })
                .setTimestamp();

        // -----------------------
        // CREATE ROLE
        // -----------------------
        if (sub === "create") {
            const name = interaction.options.getString("name");
            const color = interaction.options.getString("color") || null;
            const perms = interaction.options.getString("permissions") || "";

            let permissions = new PermissionsBitField();

            if (perms) {
                const arr = perms.split(",").map(p => p.trim());
                arr.forEach(p => {
                    if (PermissionsBitField.Flags[p]) permissions.add(PermissionsBitField.Flags[p]);
                });
            }

            try {
                const role = await interaction.guild.roles.create({
                    name,
                    color,
                    permissions
                });

                return interaction.reply({
                    embeds: [
                        makeEmbed(
                            `${E.success} Role Created`,
                            `Role **${role.name}** has been successfully created.\n` +
                            `Color: \`${color || "Default"}\`\nPermissions: \`${perms || "None"}\``
                        )
                    ]
                });

            } catch (err) {
                return interaction.reply({
                    embeds: [
                        makeEmbed(
                            `${E.error} Failed`,
                            `Error creating role:\n\`\`\`${err.message}\`\`\``
                        )
                    ],
                    ephemeral: true
                });
            }
        }

        // -----------------------
        // ADD ROLE
        // -----------------------
        else if (sub === "add") {
            const member = interaction.options.getUser("user");
            const role = interaction.options.getRole("role");

            try {
                const guildMember = await interaction.guild.members.fetch(member.id);
                await guildMember.roles.add(role);

                return interaction.reply({
                    embeds: [
                        makeEmbed(
                            `${E.add} Role Added`,
                            `Successfully added role ${role} to **${member.tag}**.`
                        )
                    ]
                });

            } catch (err) {
                return interaction.reply({
                    embeds: [
                        makeEmbed(
                            `${E.error} Failed`,
                            `Error adding role:\n\`\`\`${err.message}\`\`\``
                        )
                    ],
                    ephemeral: true
                });
            }
        }

        // -----------------------
        // REMOVE ROLE
        // -----------------------
        else if (sub === "remove") {
            const member = interaction.options.getUser("user");
            const role = interaction.options.getRole("role");

            try {
                const guildMember = await interaction.guild.members.fetch(member.id);
                await guildMember.roles.remove(role);

                return interaction.reply({
                    embeds: [
                        makeEmbed(
                            `${E.remove} Role Removed`,
                            `Successfully removed role ${role} from **${member.tag}**.`
                        )
                    ]
                });

            } catch (err) {
                return interaction.reply({
                    embeds: [
                        makeEmbed(
                            `${E.error} Failed`,
                            `Error removing role:\n\`\`\`${err.message}\`\`\``
                        )
                    ],
                    ephemeral: true
                });
            }
        }

        // -----------------------
        // UPDATE ROLE PERMISSIONS
        // -----------------------
        else if (sub === "permission") {
            const role = interaction.options.getRole("role");
            const perms = interaction.options.getString("permissions");

            const permissions = new PermissionsBitField();
            const arr = perms.split(",").map(p => p.trim());

            arr.forEach(p => {
                if (PermissionsBitField.Flags[p]) permissions.add(PermissionsBitField.Flags[p]);
            });

            try {
                await role.setPermissions(permissions);

                return interaction.reply({
                    embeds: [
                        makeEmbed(
                            `${E.edit} Permissions Updated`,
                            `Updated permissions for role ${role}.\n\nNew Permissions:\n\`\`\`${perms}\`\`\``
                        )
                    ]
                });

            } catch (err) {
                return interaction.reply({
                    embeds: [
                        makeEmbed(
                            `${E.error} Failed`,
                            `Error updating permissions:\n\`\`\`${err.message}\`\`\``
                        )
                    ],
                    ephemeral: true
                });
            }
        }
    }
};
