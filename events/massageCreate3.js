const fs = require("fs");
const path = require("path");

const prefixesPath = path.join(__dirname, "../prefixes.json");

module.exports = {
    name: "messageCreate",

    async execute(message, client) {

        if (message.author.bot || !message.guild) return;

        let prefixes = {};
        if (fs.existsSync(prefixesPath)) {
            prefixes = JSON.parse(fs.readFileSync(prefixesPath, "utf8"));
        }

        const prefix = prefixes[message.guild.id] || "!";

        if (!message.content.startsWith(prefix)) return;

        const args = message.content.slice(prefix.length).trim().split(/ +/g);
        const cmdName = args.shift().toLowerCase();

        const command = client.commands.get(cmdName);
        if (!command) return;

        try {
            command.executePrefix(message, args, client);
        } catch (error) {
            console.log(error);
            message.reply("❌ Something went wrong!");
        }
    }
};
