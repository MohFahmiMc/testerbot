const fs = require("fs");
const path = require("path");
const { REST, Routes } = require("discord.js");
require("dotenv").config();

const clientId = process.env.CLIENT_ID; // ID bot
const guildId = process.env.GUILD_ID;   // ID server test kamu
const token = process.env.TOKEN;

const commands = [];
const commandsPath = path.join(__dirname, "commands");
const commandFolders = fs.readdirSync(commandsPath);

for (const folder of commandFolders) {
    const folderPath = path.join(commandsPath, folder);
    const commandFiles = fs.readdirSync(folderPath).filter(f => f.endsWith(".js"));

    for (const file of commandFiles) {
        const filePath = path.join(folderPath, file);
        const command = require(filePath);

        if (command.data && typeof command.data.toJSON === "function") {
            commands.push(command.data.toJSON());
        } else {
            console.log(`❌ Command invalid: ${file}`);
        }
    }
}

const rest = new REST({ version: "10" }).setToken(token);

(async () => {
    try {
        console.log(`Started refreshing guild (/) commands for guild ${guildId}.`);

        await rest.put(
            Routes.applicationGuildCommands(clientId, guildId),
            { body: commands }
        );

        console.log("Successfully reloaded guild (/) commands.");
    } catch (error) {
        console.error(error);
    }
})();
