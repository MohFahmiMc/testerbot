const {
    SlashCommandBuilder,
    EmbedBuilder
} = require("discord.js");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("avatar")
        .setDescription("Display the avatar of yourself or another user.")
        .addUserOption(option =>
            option.setName("user")
                .setDescription("Select a user")
                .setRequired(false)
        ),

    async execute(interaction) {
        const user = interaction.options.getUser("user") || interaction.user;

        const avatarURL = user.displayAvatarURL({
            dynamic: true,
            size: 4096
        });

        const embed = new EmbedBuilder()
            .setColor("#2b2d31")
            .setAuthor({
                name: `${user.username}'s Avatar`,
                iconURL: user.displayAvatarURL({ size: 256 })
            })
            .setImage(avatarURL)
            .setThumbnail(user.displayAvatarURL({ size: 256 }))
            .setDescription(`Here is the avatar of **${user.tag}**.`)
            .addFields(
                {
                    name: "🔗 Avatar Links",
                    value:
                        `[PNG](${user.displayAvatarURL({ format: "png", size: 4096 })}) | ` +
                        `[JPG](${user.displayAvatarURL({ format: "jpg", size: 4096 })}) | ` +
                        `[WEBP](${user.displayAvatarURL({ format: "webp", size: 4096 })})`,
                    inline: false
                }
            )
            .setFooter({
                text: `${interaction.guild.name} • Avatar Viewer`,
                iconURL: interaction.guild.iconURL()
            })
            .setTimestamp();

        await interaction.reply({ embeds: [embed] });
    },
};
