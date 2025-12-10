require("dotenv").config();
const { REST, Routes } = require("discord.js");

const rest = new REST({ version: "10" }).setToken(process.env.TOKEN);

(async () => {
    try {
        // Ambil semua command di guild
        const commands = await rest.get(Routes.applicationGuildCommands(process.env.CLIENT_ID, process.env.GUILD_ID));
        
        for (const cmd of commands) {
            if (cmd.name === "report") {
                await rest.delete(Routes.applicationGuildCommand(process.env.CLIENT_ID, process.env.GUILD_ID, cmd.id));
                console.log(`Deleted guild command: ${cmd.name}`);
            }
        }

        console.log("Done! Guild 'report' command removed, global remains.");
    } catch (err) {
        console.error(err);
    }
})();
