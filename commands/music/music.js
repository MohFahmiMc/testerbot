const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");

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

        try {
            // Defer reply sekali saja
            if (!interaction.deferred && !interaction.replied) {
                await interaction.deferReply({ ephemeral: false });
            }

            const E = {
                music: "<:utility12:1357261389399593004>",
                done: "<:blueutility4:1357261525387182251>"
            };

            const { channel } = interaction.member.voice;
            const queue = player.nodes.get(interaction.guild.id);

            if (["play", "stop", "skip"].includes(subcommand) && !channel) {
                return await safeReply(interaction, "You must be in a voice channel.");
            }

            if (subcommand === "play") {
                const query = interaction.options.getString("query");
                const res = await player.search(query, { requestedBy: interaction.user });
                if (!res || !res.tracks.length) return safeReply(interaction, "No results found.");

                const q = queue || await player.nodes.create(interaction.guild, {
                    metadata: { channel: interaction.channel, requestedBy: interaction.user },
                    selfDeaf: true,
                    volume: 100
                });

                try { if (!q.connection) await q.connect(channel); }
                catch (err) { player.nodes.delete(interaction.guild.id); return safeReply(interaction, "Could not join your voice channel."); }

                q.addTrack(res.tracks);
                if (!q.isPlaying()) await q.node.play();

                const embed = new EmbedBuilder()
                    .setTitle(`${E.music} Added to Queue`)
                    .setColor(0x2b2d31)
                    .setDescription(res.playlist ?
                        `Playlist **${res.playlist.title}** (${res.tracks.length} tracks) added by ${interaction.user.tag}` :
                        `Track **${res.tracks[0].title}** added by ${interaction.user.tag}`)
                    .setFooter({ text: `Requested by ${interaction.user.tag}`, iconURL: interaction.user.displayAvatarURL() })
                    .setTimestamp();

                return safeReply(interaction, { embeds: [embed] });
            }

            if (subcommand === "stop") {
                if (!queue) return safeReply(interaction, "No music playing.");
                await queue.delete();
                const embed = new EmbedBuilder()
                    .setTitle(`${E.done} Player Stopped`)
                    .setColor(0x2b2d31)
                    .setDescription("Stopped the player and cleared the queue.")
                    .setTimestamp();
                return safeReply(interaction, { embeds: [embed] });
            }

            if (subcommand === "skip") {
                if (!queue || !queue.currentTrack) return safeReply(interaction, "No music playing.");
                await queue.node.skip();
                const embed = new EmbedBuilder()
                    .setTitle(`${E.done} Skipped`)
                    .setColor(0x2b2d31)
                    .setDescription("Skipped the current track.")
                    .setTimestamp();
                return safeReply(interaction, { embeds: [embed] });
            }

            if (subcommand === "queue") {
                if (!queue || !queue.tracks.length) return safeReply(interaction, "Queue is empty.");
                const embed = new EmbedBuilder()
                    .setTitle(`${E.music} Music Queue`)
                    .setColor(0x2b2d31)
                    .setDescription(queue.tracks.slice(0, 10).map((t, i) =>
                        `${i + 1}. ${t.title} | Requested by: ${t.requestedBy?.tag || 'Unknown'}`
                    ).join("\n"))
                    .setFooter({ text: `Total Tracks: ${queue.tracks.length}` })
                    .setTimestamp();
                return safeReply(interaction, { embeds: [embed] });
            }

            if (subcommand === "nowplaying") {
                if (!queue || !queue.currentTrack) return safeReply(interaction, "Nothing is playing.");
                const t = queue.currentTrack;
                const embed = new EmbedBuilder()
                    .setTitle(`${E.music} Now Playing`)
                    .setColor(0x2b2d31)
                    .setDescription(`${t.title}\nRequested by: ${t.requestedBy?.tag || 'Unknown'}`)
                    .setTimestamp();
                return safeReply(interaction, { embeds: [embed] });
            }

        } catch (err) {
            console.error(err);
            // Jika defer gagal atau interaction sudah expired
            if (!interaction.replied && !interaction.deferred) {
                try { await interaction.reply("Something went wrong!"); } catch {}
            } else {
                try { await interaction.followUp("Something went wrong!"); } catch {}
            }
        }

        // Helper: safe reply untuk mencegah double reply
        async function safeReply(inter, content) {
            try {
                if (inter.replied || inter.deferred) return inter.followUp(content);
                return inter.editReply(content);
            } catch { return; }
        }
    }
};
