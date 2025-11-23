const { SlashCommandBuilder } = require('discord.js');
const fs = require('fs');
const path = require('path');

const statsFile = path.join(__dirname, '../../premium/realtimeStats.json');
const adminsPath = path.join(__dirname, '../../data/admins.json');
const premiumPath = path.join(__dirname, '../../premium/premium.json');

function isAdminCommands(userId) {
    if (!fs.existsSync(adminsPath)) return false;
    const admins = JSON.parse(fs.readFileSync(adminsPath));
    return admins[userId] === true;
}

function isPremium(guildId) {
    if (!fs.existsSync(premiumPath)) return false;
    const premium = JSON.parse(fs.readFileSync(premiumPath));
    const data = premium[guildId];
    if (!data) return false;
    if (data.expires === 0) return true;
    return Date.now() < data.expires;
}

module.exports = {
    data: new SlashCommandBuilder()
        .setName("refreshrealtimestats")
        .setDescription("Refresh pesan realtime stats yang sudah ada (Owner/Admin Commands/Premium)")
        .addStringOption(opt =>
            opt.setName("messageid")
                .setDescription("Message ID realtime stats")
                .setRequired(true)
        ),

    async execute(interaction) {
        const guild = interaction.guild;
        const userId = interaction.user.id;
        const guildId = guild.id;

        const OWNER_ID = process.env.OWNER_ID;

        // Permission system
        const allowed =
            userId === OWNER_ID ||
            isAdminCommands(userId) ||
            isPremium(guildId);

        if (!allowed) {
            return interaction.reply({
                content: "❌ Hanya **Owner**, **Admin Commands**, atau **Premium Server** yang bisa memakai command ini.",
                ephemeral: true
            });
        }

        // get messageId
        const messageId = interaction.options.getString("messageid");

        // load saved realtime data
        if (!fs.existsSync(statsFile))
            return interaction.reply({ content: "❌ Stats file tidak ditemukan.", ephemeral: true });

        const saved = JSON.parse(fs.readFileSync(statsFile));
        const savedData = saved[guildId];

        if (!savedData)
            return interaction.reply({
                content: "❌ Server ini belum memiliki realtime stats tersimpan.",
                ephemeral: true
            });

        const channelId = savedData.channelId;

        try {
            const channel = await guild.channels.fetch(channelId);
            const msg = await channel.messages.fetch(messageId);

            // fetch member stats lagi
            const members = await guild.members.fetch();
            const humans = members.filter(m => !m.user.bot).size;
            const bots = members.filter(m => m.user.bot).size;

            await msg.edit({
                embeds: [{
                    title: "📊 Realtime Server Stats (REFRESHED)",
                    color: 0x808080,
                    fields: [
                        { name: "👤 Humans", value: `${humans}`, inline: true },
                        { name: "🤖 Bots", value: `${bots}`, inline: true },
                        { name: "📈 Total", value: `${humans + bots}`, inline: true }
                    ],
                    timestamp: new Date()
                }]
            });

            return interaction.reply({
                content: "✅ **Realtime stats berhasil direfresh!**",
                ephemeral: true
            });

        } catch (err) {
            console.error(err);
            return interaction.reply({
                content: "❌ Gagal refresh. Pastikan Message ID benar dan pesan belum dihapus.",
                ephemeral: true
            });
        }
    }
};
