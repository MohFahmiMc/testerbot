// realtimestats.js const { SlashCommandBuilder, EmbedBuilder } = require('discord.js'); const fs = require('fs'); const path = require('path');

// Path untuk menyimpan data realtime const STATS_FILE = path.join(__dirname, '../../data/realtimeStats.json'); if (!fs.existsSync(STATS_FILE)) fs.writeFileSync(STATS_FILE, JSON.stringify({}));

module.exports = { data: new SlashCommandBuilder() .setName('realtimestats') .setDescription('Menampilkan statistik server real-time dengan fitur lengkap!') .addStringOption(o => o.setName('messageid') .setDescription('ID pesan untuk refresh realtime stats') .setRequired(false) ),

async execute(interaction) { const guild = interaction.guild;

// Hitung statistik server
const members = await guild.members.fetch();
const humans = members.filter(m => !m.user.bot).size;
const bots = members.filter(m => m.user.bot).size;
const total = humans + bots;

const online = members.filter(m => m.presence?.status === 'online').size;
const idle = members.filter(m => m.presence?.status === 'idle').size;
const dnd = members.filter(m => m.presence?.status === 'dnd').size;
const offline = total - (online + idle + dnd);

const embed = new EmbedBuilder()
  .setTitle('📊 Real-Time Server Statistics')
  .setColor('#00AEEF')
  .setThumbnail(interaction.client.user.displayAvatarURL())
  .addFields(
    { name: '👤 Humans', value: `${humans}`, inline: true },
    { name: '🤖 Bots', value: `${bots}`, inline: true },
    { name: '📈 Total', value: `${total}`, inline: true },
    { name: '🟢 Online', value: `${online}`, inline: true },
    { name: '🌙 Idle', value: `${idle}`, inline: true },
    { name: '⛔ DND', value: `${dnd}`, inline: true },
    { name: '⚫ Offline', value: `${offline}`, inline: true }
  )
  .setTimestamp();

const messageId = interaction.options.getString('messageid');
const json = JSON.parse(fs.readFileSync(STATS_FILE));

// Jika tidak input message ID → kirim baru
if (!messageId) {
  const msg = await interaction.reply({ embeds: [embed], fetchReply: true });

  json[guild.id] = {
    channelId: msg.channel.id,
    messageId: msg.id
  };

  fs.writeFileSync(STATS_FILE, JSON.stringify(json, null, 2));
  return;
}

// Jika ada message ID → update pesan lama
try {
  const channel = await guild.channels.fetch(json[guild.id].channelId);
  const oldMsg = await channel.messages.fetch(messageId);

  await oldMsg.edit({ embeds: [embed] });
  return interaction.reply({ content: '✅ Realtime stats berhasil diupdate!', ephemeral: true });
} catch (err) {
  console.log(err);
  return interaction.reply({ content: '❌ Tidak dapat menemukan pesan tersebut.', ephemeral: true });
}

} };

// refreshrealtimestats.js const { SlashCommandBuilder: Builder2 } = require('discord.js');

module.exports = { data: new Builder2() .setName('refreshrealtimestats') .setDescription('Refresh realtime stats secara paksa') .addStringOption(o => o.setName('messageid') .setDescription('ID pesan yang ingin direfresh') .setRequired(true) ),

async execute(interaction) { const STATS_FILE2 = path.join(__dirname, '../../data/realtimeStats.json'); const data = JSON.parse(fs.readFileSync(STATS_FILE2));

const guildId = interaction.guild.id;
const id = interaction.options.getString('messageid');

if (!data[guildId])
  return interaction.reply({ content: '❌ Belum ada realtime stats di server ini.', ephemeral: true });

try {
  const guild = interaction.guild;
  const channel = await guild.channels.fetch(data[guildId].channelId);
  const msg = await channel.messages.fetch(id);

  // Trigger /realtimestats
  const command = interaction.client.commands.get('realtimestats');
  interaction.options._hoistedOptions = []; // hapus messageId supaya kirim baru

  await command.execute(interaction);

} catch (e) {
  console.log(e);
  return interaction.reply({ content: '❌ Error saat refresh.', ephemeral: true });
}

} };

// ========================== // refreshrealtimestats.js // ==========================

const { SlashCommandBuilder, EmbedBuilder } = require("discord.js"); const fs = require("fs"); const path = require("path");

const STATS_FILE = path.join(__dirname, "../../data/realtimeStats.json");

module.exports = { data: new SlashCommandBuilder() .setName("refreshrealtimestats") .setDescription("Refresh pesan realtime stats sebelumnya"),

async execute(interaction) {
    if (!fs.existsSync(STATS_FILE)) {
        return interaction.reply({ content: "❌ Belum ada data realtime stats.", ephemeral: true });
    }

    const stats = JSON.parse(fs.readFileSync(STATS_FILE));
    const guildId = interaction.guild.id;

    if (!stats[guildId]) {
        return interaction.reply({ content: "❌ Tidak menemukan data untuk server ini.", ephemeral: true });
    }

    try {
        const { channelId, messageId } = stats[guildId];
        const channel = await interaction.guild.channels.fetch(channelId);
        const msg = await channel.messages.fetch(messageId);

        const members = await interaction.guild.members.fetch();
        const humanCount = members.filter(m => !m.user.bot).size;
        const botCount = members.filter(m => m.user.bot).size;

        const embed = new EmbedBuilder()
            .setTitle("📊 Realtime Server Stats (Refreshed)")
            .setColor("#ffffff")
            .addFields(
                { name: "👤 Humans", value: `${humanCount}`, inline: true },
                { name: "🤖 Bots", value: `${botCount}`, inline: true },
                { name: "📈 Total", value: `${humanCount + botCount}`, inline: true }
            )
            .setTimestamp();

        await msg.edit({ embeds: [embed] });

        return interaction.reply({ content: "✅ Berhasil refresh realtime stats!", ephemeral: true });
    } catch (err) {
        console.log(err);
        return interaction.reply({ content: "❌ Gagal refresh. Pesan tidak ditemukan atau sudah terhapus.", ephemeral: true });
    }
}

};
