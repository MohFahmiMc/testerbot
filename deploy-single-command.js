require("dotenv").config();
const { REST, Routes } = require('discord.js');
const fs = require('fs');
const path = require('path');

// === ENV ===
const token = process.env.TOKEN;
const clientId = process.env.CLIENT_ID;
const guildId = process.env.GUILD_ID;

// === FILE COMMAND ===
const commandName = "botstart";
const filePath = path.join(__dirname, "commands", "utility", `${commandName}.js`);

if (!fs.existsSync(filePath)) {
    console.error(`❌ Command file not found: ${filePath}`);
    process.exit(1);
}

const command = require(filePath);

const rest = new REST({ version: '10' }).setToken(token);

(async () => {
    try {
        console.log(`⏳ Deploying /${commandName} ...`);

        const res = await rest.put(
            Routes.applicationGuildCommands(clientId, guildId),
            { body: [ command.data.toJSON() ] }
        );

        console.log(`✅ Successfully deployed /${commandName} to guild ${guildId}`);
    } catch (error) {
        console.error(error);
    }
})();
