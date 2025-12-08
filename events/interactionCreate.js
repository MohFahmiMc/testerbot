const { Events } = require("discord.js");

module.exports = {
    name: Events.InteractionCreate,
    async execute(interaction) {
        const client = interaction.client;

        // Slash Command
        if (interaction.isChatInputCommand()) {
            const command = client.commands.get(interaction.commandName);
            if (!command) return;

            try {
                // Cegah error reply dua kali
                if (!interaction.replied && !interaction.deferred) {
                    await interaction.deferReply({ flags: 64 }); // ephemeral = 64
                }

                await command.execute(interaction);

            } catch (error) {
                console.error("Command Execution Error:", error);

                if (!interaction.replied) {
                    await interaction.editReply({
                        content: "❌ An unexpected error occurred."
                    });
                }
            }
        }

        // Buttons
        else if (interaction.isButton()) {
            const btn = client.buttons?.get(interaction.customId);
            if (!btn) return;

            try {
                if (!interaction.replied && !interaction.deferred) {
                    await interaction.deferReply({ flags: 64 });
                }

                await btn.execute(interaction);

            } catch (error) {
                console.error("Button Error:", error);

                if (!interaction.replied) {
                    await interaction.editReply({
                        content: "❌ Button execution failed."
                    });
                }
            }
        }

        // Select Menu
        else if (interaction.isStringSelectMenu()) {
            const menu = client.menus?.get(interaction.customId);
            if (!menu) return;

            try {
                if (!interaction.replied && !interaction.deferred) {
                    await interaction.deferReply({ flags: 64 });
                }

                await menu.execute(interaction);

            } catch (error) {
                console.error("Menu Error:", error);

                if (!interaction.replied) {
                    await interaction.editReply({
                        content: "❌ Menu execution failed."
                    });
                }
            }
        }
    }
};
