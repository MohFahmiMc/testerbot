const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
module.exports = {
    data: new SlashCommandBuilder().setName("nowplaying").setDescription("Show current track"),
    async execute(interaction) {
        await interaction.deferReply();
        const queue = interaction.client.player.nodes.get(interaction.guild.id);
        if (!queue || !queue.currentTrack) return interaction.editReply("Nothing is playing.");
        const t = queue.currentTrack;
        const embed = new EmbedBuilder().setTitle("Now Playing").setDescription(`${t.title}\nRequested by: ${t.requestedBy?.username || 'Unknown'}`);
        return interaction.editReply({ embeds: [embed] });
    }
};
