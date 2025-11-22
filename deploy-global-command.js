const fs = require("fs");
const path = require("path");
const { REST, Routes } = require("discord.js");
require("dotenv").config();

const commands = [];
const commandsPath = path.join(__dirname, "commands");
const commandFolders = fs.readdirSync(commandsPath);

for (const folder of commandFolders) {
    const folderPath = path.join(commandsPath, folder);
    const commandFiles = fs.readdirSync(folderPath).filter(file => file.endsWith(".js"));

    for (const file of commandFiles) {
        // Skip botrestart.js
        if (file === "botrestart.js") continue;

        const filePath = path.join(folderPath, file);
        const command = require(filePath);

        if (command.data && typeof command.data.toJSON === "function") {
            commands.push(command.data.toJSON());
        } else {
            console.log(`❌ Invalid command: ${file}`);
        }
    }
}

const rest = new REST({ version: "10" }).setToken(process.env.TOKEN);

(async () => {
    try {
        console.log(`🌐 Started refreshing ${commands.length} global commands.`);

        await rest.put(
            Routes.applicationCommands(process.env.CLIENT_ID),
            { body: commands }
        );

        console.log(`✅ Successfully reloaded global commands.`);
    } catch (error) {
        console.error(error);
    }
})();
