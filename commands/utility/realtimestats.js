const fs = require("fs");
const path = require("path");
const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");

const statsFile = path.join(__dirname, "../../data/realtimestats.json");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("realtimestats")
        .setDescription("Manage real-time server & bot stats")
        .addSubcommand(sub =>
            sub.setName("set")
               .setDescription("Set the channel to post real-time stats"))
        .addSubcommand(sub =>
            sub.setName("show")
               .setDescription("Show current stats manually")),
    
    async execute(interaction, client) {
        const ownerId = process.env.OWNER_ID;
        if (interaction.user.id !== ownerId) {
            return interaction.reply({ content: "❌ Only the bot owner can use this command.", ephemeral: true });
        }

        const sub = interaction.options.getSubcommand();
        let statsData = {};
        try {
            statsData = JSON.parse(fs.readFileSync(statsFile, "utf8"));
        } catch (err) {
            statsData = { channels: {} };
        }

        if (sub === "set") {
            statsData.channels[interaction.guild.id] = interaction.channel.id;
            fs.writeFileSync(statsFile, JSON.stringify(statsData, null, 4));
            return interaction.reply({ content: `✅ This channel is now set for real-time stats!`, ephemeral: true });
        }

        if (sub === "show") {
            const embed = new EmbedBuilder()
                .setTitle("Real-Time Stats")
                .addFields(
                    { name: "Server Name", value: interaction.guild.name, inline: true },
                    { name: "Total Members", value: `${interaction.guild.memberCount}`, inline: true },
                    { name: "Bot Ping", value: `${client.ws.ping}ms`, inline: true },
                    { name: "Uptime", value: `${Math.floor(client.uptime / 1000 / 60)} minutes`, inline: true }
                )
                .setColor("Blue")
                .setTimestamp();
            return interaction.reply({ embeds: [embed] });
        }
    }
};

// Real-Time Interval Sender
setInterval(async () => {
    let statsData = {};
    try {
        statsData = JSON.parse(fs.readFileSync(statsFile, "utf8"));
    } catch {}
    
    for (const guildId in statsData.channels) {
        const channelId = statsData.channels[guildId];
        const guild = client.guilds.cache.get(guildId);
        const channel = client.channels.cache.get(channelId);
        if (!guild || !channel) continue;

        const embed = new EmbedBuilder()
            .setTitle("Real-Time Stats")
            .addFields(
                { name: "Server Name", value: guild.name, inline: true },
                { name: "Total Members", value: `${guild.memberCount}`, inline: true },
                { name: "Bot Ping", value: `${client.ws.ping}ms`, inline: true },
                { name: "Uptime", value: `${Math.floor(client.uptime / 1000 / 60)} minutes`, inline: true }
            )
            .setColor("Green")
            .setTimestamp();

        try { await channel.send({ embeds: [embed] }); } catch {}
    }
}, 5 * 60 * 1000); // kirim tiap 5 menit
