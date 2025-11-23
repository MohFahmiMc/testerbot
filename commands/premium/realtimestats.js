const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const fs = require('fs');
const path = require('path');

const premiumFile = path.join(__dirname, '../../premium/premium.json');
const adminsFile = path.join(__dirname, '../../data/admins.json');
const statsFile = path.join(__dirname, '../../data/realtimeStats.json');

// buat file realtimeStats.json jika belum ada
if (!fs.existsSync(statsFile)) {
    fs.writeFileSync(statsFile, JSON.stringify({}, null, 2));
}

function isPremium(guildId) {
    if (!fs.existsSync(premiumFile)) return false;
    const data = JSON.parse(fs.readFileSync(premiumFile));

    const guild = data[guildId];
    if (!guild) return false;

    if (guild.expires === 0) return true;
    return Date.now() < guild.expires;
}

function isCommandAdmin(userId) {
    if (!fs.existsSync(adminsFile)) return false;
    const admins = JSON.parse(fs.readFileSync(adminsFile));
    return admins[userId] === true;
}

module.exports = {
    data: new SlashCommandBuilder()
        .setName('realtimestats')
        .setDescription('Menampilkan statistik server secara real-time (premium/admin command)')
        .addStringOption(opt =>
            opt.setName('messageid')
                .setDescription('Message ID untuk refresh pesan')
                .setRequired(false)
        ),

    async execute(interaction) {
        const guild = interaction.guild;
        const guildId = guild.id;
        const userId = interaction.user.id;

        const OWNER_ID = process.env.OWNER_ID;

        const adminCommand = isCommandAdmin(userId);
        const premiumServer = isPremium(guildId);
        const isOwner = (userId === OWNER_ID);

        if (!adminCommand && !premiumServer && !isOwner) {
            return interaction.reply({
                content: "❌ Kamu tidak punya akses. Hanya Owner, Admin Command, atau Premium Server.",
                ephemeral: true
            });
        }

        const members = await guild.members.fetch();
        const humans = members.filter(m => !m.user.bot).size;
        const bots = members.filter(m => m.user.bot).size;

        const embed = new EmbedBuilder()
            .setTitle("📊 Realtime Server Stats")
            .setColor("#3498db")
            .addFields(
                { name: "👤 Humans", value: `${humans}`, inline: true },
                { name: "🤖 Bots", value: `${bots}`, inline: true },
                { name: "📈 Total", value: `${humans + bots}`, inline: true },
            )
            .setTimestamp();

        const messageId = interaction.options.getString("messageid");

        const fileData = JSON.parse(fs.readFileSync(statsFile));

        // jika tidak ada messageId → buat baru
        if (!messageId) {
            const sent = await interaction.reply({ embeds: [embed], fetchReply: true });

            fileData[guildId] = {
                channelId: sent.channel.id,
                messageId: sent.id
            };

            fs.writeFileSync(statsFile, JSON.stringify(fileData, null, 2));

            return;
        }

        // refresh pesan lama
        try {
            const data = fileData[guildId];
            if (!data) {
                return interaction.reply({
                    content: "❌ Belum ada data realtime untuk server ini.",
                    ephemeral: true
                });
            }

            const channel = await guild.channels.fetch(data.channelId);
            const msg = await channel.messages.fetch(messageId);

            await msg.edit({ embeds: [embed] });

            return interaction.reply({
                content: "✅ Realtime stats berhasil direfresh.",
                ephemeral: true
            });

        } catch (e) {
            return interaction.reply({
                content: "❌ Gagal refresh. Message ID salah atau pesan tidak ditemukan.",
                ephemeral: true
            });
        }
    }
};
