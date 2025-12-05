const { Client, GatewayIntentBits, Partials, Collection } = require("discord.js");
require("dotenv").config();
const fs = require("fs");
const path = require("path");

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMembers
    ],
    partials: [Partials.Channel]
});

// Error handling global
process.on("unhandledRejection", console.error);
process.on("uncaughtException", console.error);

// Collections
client.commands = new Collection();
client.buttons = new Collection();
client.giveaways = new Collection();

// Load commands (fun, moderation, utility, giveaway)
const commandsPath = path.join(__dirname, "commands");
for (const folder of fs.readdirSync(commandsPath)) {
    const folderPath = path.join(commandsPath, folder);
    for (const file of fs.readdirSync(folderPath).filter(f => f.endsWith(".js"))) {
        const command = require(path.join(folderPath, file));
        if (!command.data || !command.execute) continue;
        client.commands.set(command.data.name, command);
    }
}

// Load events
const eventsPath = path.join(__dirname, "events");
for (const file of fs.readdirSync(eventsPath).filter(f => f.endsWith(".js"))) {
    const event = require(path.join(eventsPath, file));
    if (event.once) {
        client.once(event.name, (...args) => event.execute(...args, client));
    } else {
        client.on(event.name, (...args) => event.execute(...args, client));
    }
}

client.login(process.env.TOKEN);
