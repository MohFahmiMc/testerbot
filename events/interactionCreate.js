const { EmbedBuilder } = require("discord.js");

module.exports = {
    name: "interactionCreate",
    execute: async (interaction, client) => {

        // ==========================
        // 1. Slash Command Handler
        // ==========================
        if (interaction.isChatInputCommand()) {

            const command = client.commands.get(interaction.commandName);
            if (!command) return;

            try {
                await command.execute(interaction, client);

            } catch (err) {
                console.error(err);

                // --- ERROR EMBED ---
                const errorEmbed = new EmbedBuilder()
                    .setTitle("❌ Command Execution Failed")
                    .setDescription(
                        `Something went wrong while processing your command.\n\n` +
                        `If this issue continues, please join our support server for assistance:\n` +
                        `🔗 **https://discord.gg/FkvM362RJu**`
                    )
                    .setColor("Red")
                    .setTimestamp()
                    .setThumbnail(client.user.displayAvatarURL());

                try {
                    if (interaction.replied || interaction.deferred) {
                        await interaction.editReply({ embeds: [errorEmbed] });
                    } else {
                        await interaction.reply({ embeds: [errorEmbed], ephemeral: true });
                    }
                } catch (err2) {
                    console.error("Reply error:", err2);
                }
            }

            return; // biar tidak turun ke button
        }

        // ==========================
        // 2. Button Handler (Giveaway)
        // ==========================
        if (interaction.isButton()) {
            try {
                const g = require("../commands/moderation/giveaway.js");

                if (typeof g.buttonHandler === "function") {
                    return g.buttonHandler(interaction, client);
                } else {
                    console.log("❌ giveaway.js missing buttonHandler");
                }

            } catch (e) {
                console.error("❌ Giveaway button error:", e);
                return interaction.reply({
                    content: "❌ Error processing this button.",
                    ephemeral: true
                });
            }
        }
    }
};
