const { SlashCommandBuilder, PermissionFlagsBits, AttachmentBuilder } = require('discord.js');
const fs = require('fs');
const path = require('path');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('backupserver')
        .setDescription('Backs up the entire server configuration into a JSON file.')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

    async execute(interaction) {
        await interaction.deferReply({ ephemeral: true });

        try {
            const guild = interaction.guild;

            // ----- ROLES -----
            const roles = guild.roles.cache
                .filter(r => r.name !== '@everyone')
                .sort((a, b) => b.position - a.position)
                .map(role => ({
                    id: role.id,
                    name: role.name,
                    color: role.color,
                    permissions: role.permissions.bitfield.toString(),
                    hoist: role.hoist,
                    mentionable: role.mentionable,
                    position: role.position
                }));

            // ----- CATEGORIES -----
            const categories = guild.channels.cache
                .filter(ch => ch.type === 4) // Category type
                .sort((a, b) => a.position - b.position)
                .map(cat => ({
                    id: cat.id,
                    name: cat.name,
                    position: cat.position
                }));

            // ----- CHANNELS -----
            const channels = guild.channels.cache
                .filter(ch => ch.type !== 4) // Skip categories here
                .sort((a, b) => a.position - b.position)
                .map(channel => ({
                    id: channel.id,
                    name: channel.name,
                    type: channel.type,
                    position: channel.position,
                    parentId: channel.parentId || null,
                    topic: channel.topic || null,
                    nsfw: channel.nsfw || false,
                    rateLimitPerUser: channel.rateLimitPerUser || 0
                }));

            // ----- EMOJIS -----
            const emojis = guild.emojis.cache.map(emoji => ({
                id: emoji.id,
                name: emoji.name,
                animated: emoji.animated,
                url: emoji.url
            }));

            // ----- SERVER INFO -----
            const serverBackup = {
                guildId: guild.id,
                guildName: guild.name,
                description: guild.description || null,
                iconURL: guild.iconURL({ dynamic: true }),
                bannerURL: guild.bannerURL({ size: 4096 }) || null,
                backupTime: new Date().toISOString(),

                roles,
                categories,
                channels,
                emojis
            };

            // Save file
            const fileName = `server-backup-${guild.id}.json`;
            const filePath = path.join(__dirname, fileName);

            fs.writeFileSync(filePath, JSON.stringify(serverBackup, null, 4));

            // Send file back
            const file = new AttachmentBuilder(filePath);

            await interaction.editReply({
                content: `✅ Server backup completed successfully!`,
                files: [file]
            });

            // Delete temp file after sending
            setTimeout(() => {
                fs.unlinkSync(filePath);
            }, 5000);

        } catch (err) {
            console.error(err);
            return interaction.editReply({
                content: '❌ Failed to create server backup.'
            });
        }
    }
};
