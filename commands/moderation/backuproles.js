const { SlashCommandBuilder, PermissionFlagsBits, AttachmentBuilder } = require('discord.js');
const fs = require('fs');
const path = require('path');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('backuproles')
        .setDescription('Backs up all server roles into a .json file.')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

    async execute(interaction) {
        await interaction.deferReply({ ephemeral: true });

        try {
            const guild = interaction.guild;

            const roles = guild.roles.cache
                .filter(r => r.name !== '@everyone')
                .sort((a, b) => b.position - a.position)
                .map(role => ({
                    id: role.id,
                    name: role.name,
                    color: role.color,
                    position: role.position,
                    permissions: role.permissions.bitfield.toString(),
                    mentionable: role.mentionable,
                    hoist: role.hoist
                }));

            const backupData = {
                guildId: guild.id,
                backupTime: new Date().toISOString(),
                roles
            };

            const filePath = path.join(__dirname, `roles-backup-${guild.id}.json`);
            fs.writeFileSync(filePath, JSON.stringify(backupData, null, 4));

            const file = new AttachmentBuilder(filePath);

            await interaction.editReply({
                content: `✅ Roles backup completed!`,
                files: [file]
            });

            // Delete temp file
            setTimeout(() => {
                fs.unlinkSync(filePath);
            }, 3000);

        } catch (err) {
            console.error(err);
            return interaction.editReply({
                content: '❌ Failed to back up roles.'
            });
        }
    }
};
