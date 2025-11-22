require("dotenv").config();
const fs = require("fs");
const path = require("path");
const { REST, Routes } = require("discord.js");

const TOKEN = process.env.TOKEN;
const CLIENT_ID = process.env.CLIENT_ID;
const GUILD_ID = process.env.GUILD_ID;

if (!TOKEN || !CLIENT_ID || !GUILD_ID) {
    console.error("❌ Missing TOKEN / CLIENT_ID / GUILD_ID in .env");
    process.exit(1);
}

const commandName = "botrestart"; 
const commandPath = path.join(__dirname, "commands", "utility", `${commandName}.js`);

if (!fs.existsSync(commandPath)) {
    console.error("❌ Command file not found:", commandPath);
    process.exit(1);
}

const command = require(commandPath);

const rest = new REST({ version: "10" }).setToken(TOKEN);

(async () => {
    try {
        console.log(`🔄 Deploying command /${commandName} to guild ${GUILD_ID}...`);

        await rest.put(
            Routes.applicationGuildCommands(CLIENT_ID, GUILD_ID),
            { body: [command.data.toJSON()] }
        );

        console.log("✅ Successfully deployed!");
    } catch (error) {
        console.error(error);
    }
})();
