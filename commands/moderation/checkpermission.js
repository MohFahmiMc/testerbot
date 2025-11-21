const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require("discord.js");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("checkpermission")
        .setDescription("Check a member's permissions")
        .addUserOption(option =>
            option.setName("target")
                  .setDescription("The user you want to check")
                  .setRequired(true)
        ),

    async execute(interaction) {
        const target = interaction.options.getMember("target");

        if (!target) {
            return interaction.reply({
                content: "❌ User not found!",
                ephemeral: true
            });
        }

        // List of permissions to check
        const permissionsToCheck = [
            { name: "Administrator", flag: PermissionFlagsBits.Administrator },
            { name: "Manage Server", flag: PermissionFlagsBits.ManageGuild },
            { name: "Manage Roles", flag: PermissionFlagsBits.ManageRoles },
            { name: "Manage Channels", flag: PermissionFlagsBits.ManageChannels },
            { name: "Kick Members", flag: PermissionFlagsBits.KickMembers },
            { name: "Ban Members", flag: PermissionFlagsBits.BanMembers },
            { name: "Manage Messages", flag: PermissionFlagsBits.ManageMessages },
            { name: "Mute Members", flag: PermissionFlagsBits.MuteMembers },
            { name: "Deafen Members", flag: PermissionFlagsBits.DeafenMembers },
            { name: "Move Members", flag: PermissionFlagsBits.MoveMembers }
        ];

        let permList = permissionsToCheck.map(perm => {
            const hasPerm = target.permissions.has(perm.flag);
            return `• **${perm.name}** — ${hasPerm ? "✅ Allowed" : "❌ Denied"}`;
        }).join("\n");

        const embed = new EmbedBuilder()
            .setTitle(`Permissions for ${target.user.tag}`)
            .setThumbnail(target.user.displayAvatarURL())
            .setColor("Blue")
            .setDescription(permList)
            .setFooter({ text: `Requested by ${interaction.user.tag}` })
            .setTimestamp();

        await interaction.reply({ embeds: [embed] });
    }
};
