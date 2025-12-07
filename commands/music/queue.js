const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
module.exports = {
    data: new SlashCommandBuilder().setName("queue").setDescription("Show music queue"),
    async execute(interaction) {
        await interaction.deferReply();
        const queue = interaction.client.player.nodes.get(interaction.guild.id);
        if (!queue || !queue.tracks || queue.tracks.length === 0) return interaction.editReply("Queue is empty.");
        const embed = new EmbedBuilder().setTitle("Queue").setDescription(queue.tracks.slice(0,10).map((t,i)=>`${i+1}. ${t.title}`).join("\n"));
        return interaction.editReply({ embeds: [embed] });
    }
};
