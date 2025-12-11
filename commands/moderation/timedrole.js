const { SlashCommandBuilder, EmbedBuilder, PermissionsBitField } = require("discord.js");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("temprole")
        .setDescription("Give a role to a user for a limited time")
        .addUserOption(option =>
            option.setName("user")
                .setDescription("User to give the role")
                .setRequired(true)
        )
        .addRoleOption(option =>
            option.setName("role")
                .setDescription("Role to give temporarily")
                .setRequired(true)
        )
        .addIntegerOption(option =>
            option.setName("duration")
                .setDescription("Duration in minutes")
                .setRequired(true)
        ),

    async execute(interaction) {
        // Check permission
        if (!interaction.member.permissions.has(PermissionsBitField.Flags.ManageRoles)) {
            return interaction.reply({
                content: "❌ You need the **Manage Roles** permission to use this command.",
                ephemeral: true
            });
        }

        const targetUser = interaction.options.getUser("user");
        const role = interaction.options.getRole("role");
        const duration = interaction.options.getInteger("duration"); // in minutes
        const member = await interaction.guild.members.fetch(targetUser.id);

        if (!member) return interaction.reply({ content: "User not found.", ephemeral: true });
        if (!role) return interaction.reply({ content: "Role not found.", ephemeral: true });

        try {
            await member.roles.add(role);

            const embed = new EmbedBuilder()
                .setTitle("⏳ Temporary Role Assigned")
                .setDescription(`${targetUser} has been given the role **${role.name}** for **${duration} minutes**.`)
                .setColor("#2b2d31")
                .setTimestamp()
                .setFooter({ text: interaction.client.user.username, iconURL: interaction.client.user.displayAvatarURL() });

            await interaction.reply({ embeds: [embed] });

            // Remove the role after duration
            setTimeout(async () => {
                if (member.roles.cache.has(role.id)) {
                    await member.roles.remove(role);

                    const endEmbed = new EmbedBuilder()
                        .setTitle("⌛ Temporary Role Removed")
                        .setDescription(`The role **${role.name}** has been removed from ${targetUser}.`)
                        .setColor("#2b2d31")
                        .setTimestamp()
                        .setFooter({ text: interaction.client.user.username, iconURL: interaction.client.user.displayAvatarURL() });

                    interaction.channel.send({ embeds: [endEmbed] });
                }
            }, duration * 60 * 1000); // convert minutes to ms

        } catch (err) {
            console.error(err);
            return interaction.reply({ content: "❌ Failed to assign the role. Make sure I have permissions.", ephemeral: true });
        }
    }
};
