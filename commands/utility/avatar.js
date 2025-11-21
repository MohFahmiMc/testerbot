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
            size: 1024
        });

        const embed = new EmbedBuilder()
            .setTitle(`${user.username}'s Avatar`)
            .setImage(avatarURL)
            .setColor("#4A90E2")
            .setFooter({
                text: interaction.guild.name
            })
            .setTimestamp();

        await interaction.reply({
            embeds: [embed]
        });
    },
};
