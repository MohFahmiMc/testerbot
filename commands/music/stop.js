const { SlashCommandBuilder } = require("discord.js");
module.exports = {
    data: new SlashCommandBuilder().setName("stop").setDescription("Stop the player and clear queue"),
    async execute(interaction) {
        await interaction.deferReply();
        const queue = interaction.client.player.nodes.get(interaction.guild.id);
        if (!queue) return interaction.editReply("No music playing.");
        await queue.delete();
        return interaction.editReply("Stopped and cleared queue.");
    }
};
