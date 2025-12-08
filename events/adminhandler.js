const fs = require("fs");
const path = require("path");

module.exports = {
    name: "interactionCreate",
    async execute(interaction, client) {
        if (!interaction.isChatInputCommand()) return;

        const command = client.commands.get(interaction.commandName);
        if (!command) return;

        // =========================
        // 🔹 Global permission check
        // =========================
        const commandPath = command.filePath || ""; // simpan path command saat load
        const isModeration = commandPath.includes("moderation");

        if (isModeration) {
            // Cek apakah member memiliki permission Administrator
            if (!interaction.member.permissions.has("Administrator")) {
                return interaction.reply({
                    content: "❌ You need Administrator permission to use this command.",
                    ephemeral: true
                });
            }
        }

        // =========================
        // 🔹 Execute command
        // =========================
        try {
            await command.execute(interaction, client);
        } catch (err) {
            console.error(err);
            if (!interaction.replied)
                await interaction.reply({ content: "❌ Error executing this command.", ephemeral: true });
        }
    }
};
