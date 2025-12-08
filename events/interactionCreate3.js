module.exports = {
    name: "interactionCreate",
    async execute(interaction, client) {
        if (!interaction.isChatInputCommand()) return;

        const command = client.commands.get(interaction.commandName);
        if (!command) return;

        if (command.folder === "moderation" && !interaction.member.permissions.has("Administrator"))
            return interaction.reply({ content: "❌ You need Administrator permission.", ephemeral: true });
        if (command.ownerOnly && interaction.user.id !== process.env.OWNER_ID)
            return interaction.reply({ content: "❌ Only bot owner can use this command.", ephemeral: true });

        try {
            await command.execute(interaction, client);
        } catch (err) {
            console.error(err);
            if (!interaction.replied) interaction.reply({ content: "❌ Something went wrong!", ephemeral: true });
        }
    }
};
