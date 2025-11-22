const { SlashCommandBuilder } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("restart")
    .setDescription("Restart the bot (Owner only)."),

  async execute(interaction, client) {
    const ownerId = process.env.OWNER_ID; // Masukkan ID Discord kamu di env

    if (interaction.user.id !== ownerId) {
      return interaction.reply({ content: "❌ You are not allowed to restart the bot.", ephemeral: true });
    }

    await interaction.reply({ content: "♻️ Restarting bot...", ephemeral: true });

    // Logout dan login ulang
    client.destroy();
    client.login(process.env.TOKEN).catch(err => {
      console.error("Failed to relogin:", err);
    });
  },
};
