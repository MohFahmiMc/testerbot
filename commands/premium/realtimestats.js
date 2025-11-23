const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const fs = require('fs');
const path = require('path');

const premiumFile = path.join(__dirname, '../../premium/premium.json');
const adminsFile = path.join(__dirname, '../../data/admins.json');
const STATS_FILE = path.join(__dirname, "../../data/realtimeStats.json");

if (!fs.existsSync(statsFile)) fs.writeFileSync(statsFile, JSON.stringify({}));

function isPremium(guildId) {
    if (!fs.existsSync(premiumFile)) return false;
    const data = JSON.parse(fs.readFileSync(premiumFile));
    const guild = data[guildId];
    if (!guild) return false;
    if (guild.expires === 0) return true; // lifetime premium
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
        .setDescription('Menampilkan statistik server secara real-time (Premium atau Admin Commands)')
        .addStringOption(opt =>
            opt.setName('messageid')
                .setDescription('Message ID untuk refresh pesan lama')
                .setRequired(false)
        ),

    async execute(interaction) {
        const guild = interaction.guild;
        const guildId = guild.id;
        const userId = interaction.user.id;

        const OWNER_ID = process.env.OWNER_ID;

        // cek admin command
        const adminCommand = isCommandAdmin(userId);

        // cek premium
        const premiumServer = isPremium(guildId);

        // cek owner
        const isOwner = (userId === OWNER_ID);

        if (!adminCommand && !premiumServer && !isOwner) {
            return interaction.reply({
                content: "❌ Kamu tidak punya akses. Hanya **Owner, Admin Command, atau Premium Server**.",
                ephemeral: true
            });
        }

        // Ambil stats
        const members = await guild.members.fetch();
        const humanCount = members.filter(m => !m.user.bot).size;
        const botCount = members.filter(m => m.user.bot).size;

        const embed = new EmbedBuilder()
            .setTitle("📊 Realtime Server Stats")
            .setColor("#808080")
            .addFields(
                { name: "👤 Humans", value: `${humanCount}`, inline: true },
                { name: "🤖 Bots", value: `${botCount}`, inline: true },
                { name: "📈 Total", value: `${humanCount + botCount}`, inline: true }
            )
            .setFooter({
                text: interaction.client.user.username,
                iconURL: interaction.client.user.displayAvatarURL()
            })
            .setTimestamp();

        const messageId = interaction.options.getString('messageid');

        // Jika tidak ada messageId → kirim baru
        if (!messageId) {
            const sent = await interaction.reply({
                embeds: [embed],
                fetchReply: true
            });

            const fileData = JSON.parse(fs.readFileSync(statsFile));
            fileData[guildId] = {
                channelId: sent.channel.id,
                messageId: sent.id
            };
            fs.writeFileSync(statsFile, JSON.stringify(fileData, null, 2));

            return;
        }

        // Jika ada messageId → refresh pesan
        try {
            const fileData = JSON.parse(fs.readFileSync(statsFile));
            const data = fileData[guildId];

            if (!data) {
                return interaction.reply({
                    content: "❌ Data realtimeStats belum tersimpan untuk server ini.",
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

        } catch (err) {
            console.log(err);
            return interaction.reply({
                content: "❌ Gagal refresh. Message ID salah atau pesan tidak ditemukan.",
                ephemeral: true
            });
        }
    }
};
