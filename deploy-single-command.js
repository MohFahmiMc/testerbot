const { REST, Routes } = require('discord.js');
const fs = require('fs');
require('dotenv').config();

const clientId = process.env.CLIENT_ID; // ID bot
const guildId = process.env.GUILD_ID;
const token = process.env.TOKEN;

const commandPath = './commands/utility/botrestart.js';

if (!fs.existsSync(commandPath)) {
    console.error(`❌ Command file not found: ${commandPath}`);
    process.exit(1);
}

const command = require(commandPath);

(async () => {
    try {
        console.log(`🚀 Deploying command ${command.data.name} to guild ${guildId}...`);

        await new REST({ version: '10' }).setToken(token)
            .put(Routes.applicationGuildCommands(clientId, guildId), {
                body: [command.data.toJSON()],
            });

        console.log(`✅ Successfully deployed command ${command.data.name} to guild ${guildId}`);
    } catch (error) {
        console.error('❌ Error deploying command:', error);
    }
})();
