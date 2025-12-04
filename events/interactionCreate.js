const { EmbedBuilder } = require("discord.js");

module.exports = {
    name: "interactionCreate",

    async execute(interaction, client) {

        // ---------------------------
        // 1. Slash Command Handler
        // ---------------------------
        if (interaction.isChatInputCommand()) {

            const command = client.commands.get(interaction.commandName);
            if (!command) return;

            try {
                await command.execute(interaction, client);
            } catch (err) {
                console.error(err);

                const embed = new EmbedBuilder()
                    .setTitle("⚠️ Command Error")
                    .setDescription(
                        "The command failed to execute.\n" +
                        "If this issue continues, please join our support server:\n" +
                        "🔗 **https://discord.gg/FkvM362RJu**"
                    )
                    .setColor("Red")
                    .setThumbnail(client.user.displayAvatarURL());

                if (interaction.replied || interaction.deferred) {
                    await interaction.editReply({ embeds: [embed], ephemeral: true });
                } else {
                    await interaction.reply({ embeds: [embed], ephemeral: true });
                }
            }

            return;
        }

        // ---------------------------
        // 2. Button Handler
        // ---------------------------
        if (interaction.isButton()) {
            const button = client.buttons.get(interaction.customId);
            if (button) {
                try {
                    await button.execute(interaction, client);
                } catch (err) {
                    console.error(err);
                }
            }

            // Giveaway buttons (join, leave, etc)
            if (interaction.customId.startsWith("gway_")) {
                const handler = require("../utils/giveawayButtonHandler");
                return handler(interaction, client);
            }

            return;
        }

        // ---------------------------
        // 3. Select Menu Handler
        // ---------------------------
        if (interaction.isStringSelectMenu()) {

            if (interaction.customId.startsWith("gway_select")) {
                const handler = require("../utils/giveawaySelectHandler");
                return handler(interaction, client);
            }

            return;
        }

        // ---------------------------
        // 4. Modal Handler
        // ---------------------------
        if (interaction.isModalSubmit()) {

            if (interaction.customId.startsWith("gway_modal")) {
                const handler = require("../utils/giveawayModalHandler");
                return handler(interaction, client);
            }

            return;
        }
    }
};
