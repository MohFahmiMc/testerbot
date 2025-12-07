const { SlashCommandBuilder } = require("discord.js");
module.exports = {
    data: new SlashCommandBuilder().setName("skip").setDescription("Skip current track"),
    async execute(interaction) {
        await interaction.deferReply();
        const queue = interaction.client.player.nodes.get(interaction.guild.id);
        if (!queue) return interaction.editReply("No music playing.");
        await queue.node.skip();
        return interaction.editReply("Skipped.");
    }
};
