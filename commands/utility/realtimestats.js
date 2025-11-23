const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const fs = require('fs');
const path = require('path');

const STATS_FILE = path.join(__dirname, '../../data/realtimeStats.json');
const ADMINS_FILE = path.join(__dirname, '../../data/admins.json');

if (!fs.existsSync(STATS_FILE)) fs.writeFileSync(STATS_FILE, JSON.stringify({}));

function isCommandAdmin(userId) {
    if (!fs.existsSync(ADMINS_FILE)) return false;
    const admins = JSON.parse(fs.readFileSync(ADMINS_FILE, 'utf-8'));
    return admins[userId] === true;
}

module.exports = {
    data: new SlashCommandBuilder()
        .setName('realtimestats')
        .setDescription('Menampilkan statistik server real-time.')
        .addStringOption(option =>
            option.setName('messageid')
                .setDescription('Message ID untuk refresh stats')
                .setRequired(false)
        ),

    async execute(interaction) {
        const guild = interaction.guild;
        const userId = interaction.user.id;
        const OWNER_ID = process.env.OWNER_ID;

        const isAdminCommand = isCommandAdmin(userId);
        const isOwner = userId === OWNER_ID;

        if (!isAdminCommand && !isOwner) {
            return interaction.reply({
                content: '❌ Kamu tidak punya akses. Hanya Owner atau Admin Command.',
                ephemeral: true
            });
        }

        // Ambil member stats
        const members = await guild.members.fetch();
        const humanCount = members.filter(m => !m.user.bot).size;
        const botCount = members.filter(m => m.user.bot).size;

        const embed = new EmbedBuilder()
            .setTitle(`📊 Realtime Server Stats - ${guild.name}`)
            .setColor('#808080')
            .addFields(
                { name: '👤 Humans', value: `${humanCount}`, inline: true },
                { name: '🤖 Bots', value: `${botCount}`, inline: true },
                { name: '📈 Total', value: `${humanCount + botCount}`, inline: true }
            )
            .setFooter({
                text: interaction.client.user.username,
                iconURL: interaction.client.user.displayAvatarURL()
            })
            .setTimestamp();

        const messageId = interaction.options.getString('messageid');

        // Kirim baru atau refresh
        if (!messageId) {
            const sent = await interaction.reply({ embeds: [embed], fetchReply: true });
            const data = JSON.parse(fs.readFileSync(STATS_FILE, 'utf-8'));
            data[guild.id] = { channelId: sent.channel.id, messageId: sent.id };
            fs.writeFileSync(STATS_FILE, JSON.stringify(data, null, 2));
        } else {
            // refresh pesan lama
            try {
                const data = JSON.parse(fs.readFileSync(STATS_FILE, 'utf-8'))[guild.id];
                if (!data) throw new Error('Data belum tersimpan untuk server ini.');

                const channel = await guild.channels.fetch(data.channelId);
                const msg = await channel.messages.fetch(messageId);
                await msg.edit({ embeds: [embed] });

                await interaction.reply({ content: '✅ Realtime stats berhasil direfresh.', ephemeral: true });
            } catch (err) {
                console.log(err);
                return interaction.reply({ content: '❌ Gagal refresh. Pastikan Message ID benar.', ephemeral: true });
            }
        }
    }
};
