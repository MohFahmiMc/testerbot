require("dotenv").config();
const { REST, Routes } = require("discord.js");

const TOKEN = process.env.TOKEN;
const GUILD_ID = process.env.GUILD_ID;
const CLIENT_ID = process.env.CLIENT_ID;

(async () => {
    try {
        console.log("⚠ Deploying guild commands, but list is EMPTY...");

        const commands = []; // <- kosong di sini

        const rest = new REST({ version: "10" }).setToken(TOKEN);

        await rest.put(
            Routes.applicationGuildCommands(CLIENT_ID, GUILD_ID),
            { body: commands } // <- register 0 commands
        );

        console.log("✓ Guild commands cleared (0 command deployed).");
    } catch (err) {
        console.error("❌ Error clearing guild commands", err);
    }
})();
