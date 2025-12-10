const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require("discord.js");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("music")
        .setDescription("Music commands: play, stop, skip, queue, nowplaying")
        .addSubcommand(sub =>
            sub.setName("play")
                .setDescription("Play a song from YouTube/Spotify")
                .addStringOption(o => o.setName("query").setDescription("URL or search keywords").setRequired(true))
        )
        .addSubcommand(sub =>
            sub.setName("stop")
                .setDescription("Stop the player and clear queue")
        )
        .addSubcommand(sub =>
            sub.setName("skip")
                .setDescription("Skip the current track")
        )
        .addSubcommand(sub =>
            sub.setName("queue")
                .setDescription("Show the music queue")
        )
        .addSubcommand(sub =>
            sub.setName("nowplaying")
                .setDescription("Show the current track playing")
        ),

    async execute(interaction) {
        const client = interaction.client;
        const player = client.player;
        const subcommand = interaction.options.getSubcommand();
        await interaction.deferReply();

        const E = {
            title: "<:premium_crown:1357260010303918090>",
            music: "<:utility12:1357261389399593004>",
            done: "<:blueutility4:1357261525387182251>"
        };

        const { channel } = interaction.member.voice;

        if (["play", "stop", "skip", "queue", "nowplaying"].includes(subcommand) && !channel && subcommand !== "queue" && subcommand !== "nowplaying") {
            return interaction.editReply("You must be in a voice channel.");
        }

        const queue = player.nodes.get(interaction.guild.id);

        if (subcommand === "play") {
            const query = interaction.options.getString("query");

            // Search track/playlist
            const res = await player.search(query, { requestedBy: interaction.user });
            if (!res || !res.tracks.length) return interaction.editReply("No results found.");

            // Create queue if doesn't exist
            const q = queue || await player.nodes.create(interaction.guild, {
                metadata: { channel: interaction.channel, requestedBy: interaction.user },
                selfDeaf: true,
                volume: 100
            });

            // Connect to voice channel
            try { if (!q.connection) await q.connect(channel); }
            catch (err) { player.nodes.delete(interaction.guild.id); return interaction.editReply("Could not join your voice channel."); }

            // Add tracks (single or playlist)
            q.addTrack(res.tracks);
            if (!q.isPlaying()) await q.node.play();

            // Build embed
            const embed = new EmbedBuilder()
                .setTitle(`${E.music} Added to Queue`)
                .setColor(0x2b2d31)
                .setDescription(res.playlist ? 
                    `Playlist **${res.playlist.title}** (${res.tracks.length} tracks) added by ${interaction.user.tag}` :
                    `Track **${res.tracks[0].title}** added by ${interaction.user.tag}`)
                .setFooter({ text: `Requested by ${interaction.user.tag}`, iconURL: interaction.user.displayAvatarURL() })
                .setTimestamp();

            return interaction.editReply({ embeds: [embed] });
        }

        if (subcommand === "stop") {
            if (!queue) return interaction.editReply("No music playing.");
            await queue.delete();
            const embed = new EmbedBuilder()
                .setTitle(`${E.done} Player Stopped`)
                .setColor(0x2b2d31)
                .setDescription("Stopped the player and cleared the queue.")
                .setTimestamp();
            return interaction.editReply({ embeds: [embed] });
        }

        if (subcommand === "skip") {
            if (!queue) return interaction.editReply("No music playing.");
            await queue.node.skip();
            const embed = new EmbedBuilder()
                .setTitle(`${E.done} Skipped`)
                .setColor(0x2b2d31)
                .setDescription("Skipped the current track.")
                .setTimestamp();
            return interaction.editReply({ embeds: [embed] });
        }

        if (subcommand === "queue") {
            if (!queue || !queue.tracks.length) return interaction.editReply("Queue is empty.");
            const embed = new EmbedBuilder()
                .setTitle(`${E.music} Music Queue`)
                .setColor(0x2b2d31)
                .setDescription(queue.tracks.slice(0, 10).map((t,i) => `${i+1}. ${t.title}`).join("\n"))
                .setFooter({ text: `Total Tracks: ${queue.tracks.length}` })
                .setTimestamp();
            return interaction.editReply({ embeds: [embed] });
        }

        if (subcommand === "nowplaying") {
            if (!queue || !queue.currentTrack) return interaction.editReply("Nothing is playing.");
            const t = queue.currentTrack;
            const embed = new EmbedBuilder()
                .setTitle(`${E.music} Now Playing`)
                .setColor(0x2b2d31)
                .setDescription(`${t.title}\nRequested by: ${t.requestedBy?.username || 'Unknown'}`)
                .setTimestamp();
            return interaction.editReply({ embeds: [embed] });
        }
    }
};
