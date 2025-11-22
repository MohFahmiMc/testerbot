module.exports = {
    name: "interactionCreate",
    execute: async (interaction, client) => {
        if (!interaction.isChatInputCommand()) return;

        const command = client.commands.get(interaction.commandName);
        if (!command) return;

        try {
            await command.execute(interaction, client);
        } catch (err) {
            console.error(err);
            await interaction.reply({
                content: "❌ Error executing command.",
                ephemeral: true
            });
        }
    }
};
