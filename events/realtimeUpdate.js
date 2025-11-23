const fs = require("fs");
const path = require("path");
const { EmbedBuilder } = require("discord.js");

const CONFIG_FILE = path.join(__dirname, "../data/realtimestats.json");

module.exports = {
    name: "ready",
    once: false,

    async execute(client) {
        console.log("RealTimeStats updater loaded.");

        setInterval(async () => {
            if (!fs.existsSync(CONFIG_FILE)) return;

            const config = JSON.parse(fs.readFileSync(CONFIG_FILE));
            const guild = client.guilds.cache.get(config.guildId);

            if (!guild) return;

            await guild.members.fetch();

            const humans = guild.members.cache.filter(m => !m.user.bot).size;
            const bots = guild.members.cache.filter(m => m.user.bot).size;
            const total = guild.memberCount;

            const embed = new EmbedBuilder()
                .setTitle("📊 Real-Time Server Stats")
                .setColor("#808080")
                .setThumbnail(client.user.displayAvatarURL({ size: 2048 }))
                .addFields(
                    { name: "👤 Humans", value: `${humans}`, inline: true },
                    { name: "🤖 Bots", value: `${bots}`, inline: true },
                    { name: "🌍 Total Members", value: `${total}`, inline: true }
                )
                .setTimestamp();

            try {
                const channel = await guild.channels.fetch(config.channelId);
                const msg = await channel.messages.fetch(config.messageId);
                await msg.edit({ embeds: [embed] });
            } catch (err) {
                console.log("Stats message missing, skipping update.");
            }
        }, 300000); // 5 menit
    }
};
