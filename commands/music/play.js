// commands/music/play.js
const { SlashCommandBuilder } = require("discord.js");
module.exports = {
    data: new SlashCommandBuilder()
        .setName("play")
        .setDescription("Play a song from YouTube/Spotify")
        .addStringOption(o => o.setName("query").setDescription("URL or search keywords").setRequired(true)),
    async execute(interaction) {
        await interaction.deferReply();
        const query = interaction.options.getString("query");
        const { channel } = interaction.member.voice;
        if (!channel) return interaction.editReply("You must be in a voice channel.");
        const player = interaction.client.player;
        const res = await player.search(query, { requestedBy: interaction.user });
        if (!res || !res.tracks.length) return interaction.editReply("No results found.");
        const queue = await player.nodes.create(interaction.guild, { metadata: { channel: interaction.channel, requestedBy: interaction.user } });
        try {
            if (!queue.connection) await queue.connect(channel);
        } catch (e) {
            player.nodes.delete(interaction.guild.id);
            return interaction.editReply("Could not join your voice channel.");
        }
        queue.addTrack(res.tracks);
        if (!queue.isPlaying()) await queue.node.play();
        return interaction.editReply({ content: `Enqueued: ${res.tracks[0].title}` });
    }
};
