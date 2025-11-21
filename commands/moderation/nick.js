const { EmbedBuilder, PermissionsBitField } = require("discord.js");

module.exports = {
    data: {
        name: "nick",
        description: "Change a member's nickname",
        options: [
            {
                name: "user",
                type: 6, // USER
                description: "Member to change nickname",
                required: true
            },
            {
                name: "nickname",
                type: 3, // STRING
                description: "New nickname",
                required: true
            }
        ]
    },
    async execute(interaction) {
        if (!interaction.member.permissions.has(PermissionsBitField.Flags.ManageNicknames)) {
            return interaction.reply({ content: "❌ You don't have permission to manage nicknames.", ephemeral: true });
        }

        const user = interaction.options.getUser("user");
        const member = interaction.guild.members.cache.get(user.id);
        const nickname = interaction.options.getString("nickname");

        if (!member) return interaction.reply({ content: "❌ Member not found.", ephemeral: true });

        try {
            await member.setNickname(nickname);
            const embed = new EmbedBuilder()
                .setTitle("✅ Nickname Changed")
                .setDescription(`${member.user.tag}'s nickname has been changed to **${nickname}**`)
                .setColor("Green")
                .setTimestamp();

            interaction.reply({ embeds: [embed] });
        } catch (err) {
            interaction.reply({ content: "❌ Cannot change nickname.", ephemeral: true });
        }
    }
};
