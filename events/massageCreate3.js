const fs = require("fs");
const path = require("path");
const prefixesPath = path.join(__dirname, "../data/prefixes.json");

module.exports = {
    name: "messageCreate",
    async execute(message, client) {
        if (!message.guild || message.author.bot) return;

        // Load prefixes
        let prefixes = {};
        if (fs.existsSync(prefixesPath)) {
            prefixes = JSON.parse(fs.readFileSync(prefixesPath, "utf8"));
        }
        const prefix = prefixes[message.guild.id] || "!";

        if (!message.content.startsWith(prefix)) return;

        const args = message.content.slice(prefix.length).trim().split(/ +/g);
        const commandName = args.shift().toLowerCase();

        const command = client.commands.get(commandName);
        if (!command) return;

        // Permission check
        if (command.folder === "moderation" && !message.member.permissions.has("Administrator")) {
            return message.reply("❌ You need Administrator permission to use this command.");
        }
        if (command.ownerOnly && message.author.id !== process.env.OWNER_ID) {
            return message.reply("❌ Only bot owner can use this command.");
        }

        try {
            if (typeof command.executePrefix === "function") {
                await command.executePrefix(message, args, client);
            } else if (typeof command.execute === "function") {
                await command.execute({ message, args, client });
            }
        } catch (err) {
            console.error(err);
            message.reply("❌ Something went wrong!");
        }
    }
};
