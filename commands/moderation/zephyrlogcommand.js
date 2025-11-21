const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const fs = require('fs');
const path = require('path');

// Path to store log channel config per guild
const configPath = path.join(__dirname, '../data/commandLogs.json');

// Ensure file exists
if (!fs.existsSync(configPath)) {
    fs.writeFileSync(configPath, JSON.stringify({}));
}

module.exports = {
    data: new SlashCommandBuilder()
        .setName('zephyrlogcommand')
        .setDescription('Set the channel for command usage logs.')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
        .addSubcommand(sub =>
            sub.setName('set')
                .setDescription('Set the channel where command logs will be sent.')
                .addChannelOption(opt =>
                    opt.setName('channel')
                        .setDescription('Channel to log command usage')
                        .setRequired(true)
                )
        ),

    async execute(interaction) {
        const subcommand = interaction.options.getSubcommand();

        if (subcommand === 'set') {
            const channel = interaction.options.getChannel('channel');

            // Load settings
            const config = JSON.parse(fs.readFileSync(configPath));

            // Save new configuration
            config[interaction.guild.id] = {
                logChannel: channel.id
            };

            fs.writeFileSync(configPath, JSON.stringify(config, null, 2));

            return interaction.reply({
                content: `✅ Command logs will now be sent to <#${channel.id}>`,
                ephemeral: true
            });
        }
    }
};
