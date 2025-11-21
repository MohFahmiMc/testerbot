module.exports = {
    name: "avatar",
    description: "Get a user's avatar",
    options: [
        { name: "user", type: 6, description: "User to get avatar for", required: false }
    ],
    async execute(interaction) {
        const user = interaction.isChatInputCommand() ? 
            interaction.options.getUser("user") || interaction.user :
            interaction.mentions.users.first() || interaction.author;
        await interaction.reply(user.displayAvatarURL({ dynamic: true, size: 1024 }));
    }
};
