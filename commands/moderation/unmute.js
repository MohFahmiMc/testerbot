const { EmbedBuilder, PermissionsBitField } = require("discord.js");

module.exports = {
    data: {
        name: "unmute",
        description: "Unmute a member",
        options: [
            {
                name: "user",
                type: 6,
                description: "Member to unmute",
                required: true
            }
        ]
    },
    async execute(interaction) {
        if (!interaction.member.permissions.has(PermissionsBitField.Flags.ModerateMembers)) {
            return interaction.reply({ content: "❌ You don't have permission to unmute members.", ephemeral: true });
        }

        const user = interaction.options.getUser("user");
        const member = interaction.guild.members.cache.get(user.id);
        if (!member) return interaction.reply({ content: "❌ Member not found.", ephemeral: true });

        try {
            await member.timeout(null); // remove mute
            const embed = new EmbedBuilder()
                .setTitle("✅ Member Unmuted")
                .setDescription(`${member.user.tag} has been unmuted.`)
                .setColor("Green")
                .setTimestamp();

            interaction.reply({ embeds: [embed] });
        } catch (err) {
            interaction.reply({ content: "❌ Cannot unmute this member.", ephemeral: true });
        }
    }
};
