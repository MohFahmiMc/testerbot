const { REST, Routes } = require("discord.js");
const fs = require("fs");
const path = require("path");
require("dotenv").config();

const CLIENT_ID = process.env.CLIENT_ID;
const TOKEN = process.env.TOKEN;

const commands = [];

// Path commands
const commandsPath = path.join(__dirname, "commands");
const commandFolders = fs.readdirSync(commandsPath);

// Load commands
for (const folder of commandFolders) {
    const folderPath = path.join(commandsPath, folder);
    if (!fs.statSync(folderPath).isDirectory()) continue;

    const commandFiles = fs.readdirSync(folderPath)
        .filter(f => f.endsWith(".js"));

    for (const file of commandFiles) {
        const filePath = path.join(folderPath, file);

        // Safe require: jika ada error, skip command
        try {
            const command = require(filePath);

            if (command?.data) {
                commands.push(command.data.toJSON());
            } else {
                console.log(`❌ Skipped invalid command: ${file}`);
            }
        } catch (err) {
            console.log(`❌ Failed to load command ${file}:`, err.message);
        }
    }
}

// Deploy global commands
(async () => {
    const rest = new REST({ version: "10" }).setToken(TOKEN);

    try {
        console.log(`🌐 Started refreshing ${commands.length} global commands.`);

        await rest.put(
            Routes.applicationCommands(CLIENT_ID),
            { body: commands }
        );

        console.log(`✅ Successfully reloaded ${commands.length} global commands.`);
    } catch (error) {
        console.error(error);
    }
})();
