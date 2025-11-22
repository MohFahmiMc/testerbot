const fs = require("fs");
const { Collection } = require("discord.js");

module.exports = (client) => {
    client.prefixes = new Collection();

    client.on("messageCreate", async (message) => {
        if (message.author.bot) return;

        // Load prefix per server dari JSON
        const prefixes = JSON.parse(fs.readFileSync("./data/prefixes.json", "utf8"));
        const prefix = prefixes[message.guild?.id] || "!"; // default "!"

        if (!message.content.startsWith(prefix)) return;

        const args = message.content.slice(prefix.length).trim().split(/ +/g);
        const commandName = args.shift().toLowerCase();

        const command = client.commands.get(commandName);
        if (!command) return;

        try {
            await command.execute(message, args, client);
        } catch (err) {
            console.error(err);
            message.reply("❌ Error executing command.");
        }
    });
};
