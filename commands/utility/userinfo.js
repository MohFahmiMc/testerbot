module.exports = {
    name: "userinfo",
    description: "Get info about a user",
    options: [
        { name: "user", type: 6, description: "User to get info for", required: false }
    ],
    async execute(interaction) {
        const user = interaction.isChatInputCommand() ? 
            interaction.options.getUser("user") || interaction.user :
            interaction.mentions.users.first() || interaction.author;
        await interaction.reply(`User: ${user.tag}\nID: ${user.id}`);
    }
};
