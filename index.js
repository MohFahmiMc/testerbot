const fs = require('fs');
const path = require('path');
const statsFile = path.join(__dirname, './premium/realtimeStats.json');
const { EmbedBuilder } = require('discord.js');

setInterval(async () => {
    if (!fs.existsSync(statsFile)) return;

    const data = JSON.parse(fs.readFileSync(statsFile));
    for (const guildId in data) {
        try {
            const config = data[guildId];
            const guild = await client.guilds.fetch(guildId);
            const channel = await guild.channels.fetch(config.channelId);
            const msg = await channel.messages.fetch(config.messageId);

            const members = await guild.members.fetch();
            const human = members.filter(m => !m.user.bot).size;
            const bots = members.filter(m => m.user.bot).size;

            const embed = new EmbedBuilder()
                .setTitle(`📊 Realtime Server Stats`)
                .setColor('#808080')
                .addFields(
                    { name: "👤 Humans", value: `${human}`, inline: true },
                    { name: "🤖 Bots", value: `${bots}`, inline: true },
                    { name: "📈 Total", value: `${human + bots}`, inline: true }
                )
                .setTimestamp()
                .setFooter({
                    text: client.user.username,
                    iconURL: client.user.displayAvatarURL()
                });

            await msg.edit({ embeds: [embed] });

        } catch {}
    }
}, 5 * 60 * 1000); // update setiap 5 menit
