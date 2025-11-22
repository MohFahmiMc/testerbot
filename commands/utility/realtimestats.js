const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const fs = require('fs');
require('dotenv').config();

const OWNER_ID = process.env.OWNER_ID; // Set owner ID di .env
const PREMIUM_USERS = JSON.parse(fs.readFileSync('./commands/data/premium.json', 'utf8') || '[]');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('realtimestats')
        .setDescription('Show live server and bot stats. (Premium only)'),

    async execute(interaction) {
        // Cek akses premium/owner
        if (interaction.user.id !== OWNER_ID && !PREMIUM_USERS.includes(interaction.user.id)) {
            return interaction.reply({ content: '❌ You are not allowed to use this command.', ephemeral: true });
        }

        const guild = interaction.guild;
        if (!guild) return interaction.reply({ content: '❌ This command can only be used in a server.', ephemeral: true });

        const sent = await interaction.reply({ content: 'Loading live stats...', fetchReply: true });

        const updateStats = async () => {
            await guild.members.fetch(); // Pastikan member list ter-update
            const totalMembers = guild.members.cache.size;
            const totalBots = guild.members.cache.filter(m => m.user.bot).size;
            const onlineMembers = guild.members.cache.filter(m => m.presence?.status === 'online').size;

            const embed = new EmbedBuilder()
                .setTitle(`${guild.name} - Live Stats`)
                .setColor('#808080') // abu-abu
                .setThumbnail(guild.iconURL({ dynamic: true }))
                .addFields(
                    { name: 'Server Name', value: guild.name, inline: true },
                    { name: 'Total Members', value: totalMembers.toString(), inline: true },
                    { name: 'Online Members', value: onlineMembers.toString(), inline: true },
                    { name: 'Total Bots', value: totalBots.toString(), inline: true },
                    { name: 'Server Owner', value: `<@${guild.ownerId}>`, inline: true },
                    { name: 'Bot Join Date', value: `<t:${Math.floor(interaction.client.user.createdTimestamp / 1000)}:R>`, inline: true }
                )
                .setFooter({ text: 'Live stats powered by your bot', iconURL: interaction.client.user.displayAvatarURL({ dynamic: true }) })
                .setTimestamp();

            try {
                await sent.edit({ embeds: [embed] });
            } catch (err) {
                console.error('Failed to update stats:', err);
            }
        };

        // Update setiap 5 detik
        const interval = setInterval(updateStats, 5000);

        // Hentikan interval jika message dihapus
        const collector = sent.channel.createMessageComponentCollector({ time: 60 * 60 * 1000 }); // 1 jam
        collector.on('end', () => clearInterval(interval));

        // Jalankan pertama kali
        updateStats();
    },
};
