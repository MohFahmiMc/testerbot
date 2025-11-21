const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("joininfo")
        .setDescription("Show information about when a user joined the server")
        .addUserOption(option =>
            option.setName("member")
                  .setDescription("Select a user to view join info")
                  .setRequired(true)
        ),

    async execute(interaction) {
        const user = interaction.options.getUser("member");
        const member = await interaction.guild.members.fetch(user.id);

        const embed = new EmbedBuilder()
            .setColor("Blue")
            .setTitle(`📥 Join Information`)
            .setThumbnail(user.displayAvatarURL({ dynamic: true }))
            .addFields(
                {
                    name: "👤 User",
                    value: `${user.tag}`,
                    inline: true
                },
                {
                    name: "🆔 User ID",
                    value: `${user.id}`,
                    inline: true
                },
                {
                    name: "📅 Joined Server",
                    value: `<t:${Math.floor(member.joinedTimestamp / 1000)}:F>\n<t:${Math.floor(member.joinedTimestamp / 1000)}:R>`,
                    inline: false
                }
            )
            .setFooter({
                text: interaction.guild.name,
                iconURL: interaction.guild.iconURL() || undefined
            })
            .setTimestamp();

        return interaction.reply({ embeds: [embed] });
    }
};
