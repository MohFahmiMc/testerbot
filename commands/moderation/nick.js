const { 
    SlashCommandBuilder, 
    PermissionsBitField,
    EmbedBuilder 
} = require("discord.js");

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
                .setRequired(true)
        ),

    async execute(interaction) {
        const member = interaction.options.getMember("member");
        const nickname = interaction.options.getString("nickname");

        // Cek permission user
        if (!interaction.member.permissions.has(PermissionsBitField.Flags.ManageNicknames)) {
            return interaction.reply({
                content: "❌ You do not have permission to change nicknames.",
                ephemeral: true
            });
        }

        // Cek apakah bot bisa ubah nickname
        if (!member.manageable) {
            return interaction.reply({
                content: "❌ I cannot change this member's nickname.",
                ephemeral: true
            });
        }

        try {
            await member.setNickname(nickname);

            const embed = new EmbedBuilder()
                .setColor("#2B2D31")
                .setTitle("Nickname Updated")
                .addFields(
                    { name: "User", value: `${member.user.tag}`, inline: true },
                    { name: "ID", value: `${member.id}`, inline: true },
                    { name: "New Nickname", value: `**${nickname}**` }
                )
                .setFooter({
                    text: interaction.guild.name,
                    iconURL: interaction.guild.iconURL() || undefined
                })
                .setTimestamp();

            return interaction.reply({ embeds: [embed] });

        } catch (error) {
            console.error(error);
            return interaction.reply({
                content: "❌ Failed to change nickname.",
                ephemeral: true
            });
        }
    },
};
