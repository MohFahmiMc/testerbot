const { SlashCommandBuilder, PermissionsBitField } = require("discord.js");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("nick")
        .setDescription("Change a member's nickname")
        .addUserOption(option =>
            option.setName("member")
                .setDescription("Member to change nickname")
                .setRequired(true))
        .addStringOption(option =>
            option.setName("nickname")
                .setDescription("New nickname")
                .setRequired(true)),

    async execute(interaction) {
        const member = interaction.options.getMember("member");
        const nickname = interaction.options.getString("nickname");

        if (!interaction.member.permissions.has(PermissionsBitField.Flags.ManageNicknames)) {
            return interaction.reply({ content: "❌ You do not have permission to change nicknames.", ephemeral: true });
        }

        if (!member.manageable) {
            return interaction.reply({ content: "❌ I cannot change this member's nickname.", ephemeral: true });
        }

        await member.setNickname(nickname);
        await interaction.reply({ content: `✅ Nickname changed for ${member.user.tag} to **${nickname}**.` });
    },
};
