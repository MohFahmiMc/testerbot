const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("userinfo")
        .setDescription("Displays detailed information about a user.")
        .addUserOption(option =>
            option
                .setName("target")
                .setDescription("Select a user")
                .setRequired(false)
        ),

    async execute(interaction) {
        const user = interaction.options.getUser("target") || interaction.user;
        const member = await interaction.guild.members.fetch(user.id);

        const roles = member.roles.cache
            .filter(r => r.id !== interaction.guild.id)
            .map(r => r.toString())
            .join(", ") || "No roles";

        const embed = new EmbedBuilder()
            .setColor("#3b82f6")
            .setTitle("User Information")
            .setThumbnail(user.displayAvatarURL({ size: 256 }))
            .addFields(
                {
                    name: "👤 Username",
                    value: `${user.username}`,
                    inline: true
                },
                {
                    name: "🆔 User ID",
                    value: user.id,
                    inline: true
                },
                {
                    name: "📅 Account Created",
                    value: `<t:${Math.floor(user.createdTimestamp / 1000)}:R>`,
                    inline: true
                },
                {
                    name: "📌 Joined Server",
                    value: `<t:${Math.floor(member.joinedTimestamp / 1000)}:R>`,
                    inline: true
                },
                {
                    name: "🎭 Roles",
                    value: roles,
                },
                {
                    name: "📈 Highest Role",
                    value: member.roles.highest.toString(),
                    inline: true
                }
            )
            .setFooter({ text: interaction.guild.name })
            .setTimestamp();

        await interaction.reply({ embeds: [embed] });
    }
};
