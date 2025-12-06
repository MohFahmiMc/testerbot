// bot.js — FINAL FIXED VERSION
const {
    Client,
    GatewayIntentBits,
    Partials,
    Collection
} = require("discord.js");
require("dotenv").config();
const fs = require("fs");
const path = require("path");

// =============================
//  CLIENT SETUP (FIXED)
// =============================
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildPresences // <- WAJIB AGAR PLAYING MUNCUL
    ],
    partials: [Partials.Channel]
});

// Global error handler
process.on("unhandledRejection", console.error);
process.on("uncaughtException", console.error);

// Collections
client.commands = new Collection();
client.buttons = new Collection();
client.giveaways = new Collection();

// =============================
//  LOAD COMMANDS
// =============================
const commandsPath = path.join(__dirname, "commands");

for (const folder of fs.readdirSync(commandsPath)) {
    const folderPath = path.join(commandsPath, folder);

    for (const file of fs
        .readdirSync(folderPath)
        .filter((f) => f.endsWith(".js"))) {

        const command = require(path.join(folderPath, file));
        if (!command.data || !command.execute) continue;

        client.commands.set(command.data.name, command);
    }
}

// =============================
//  LOAD EVENTS
// =============================
const eventsPath = path.join(__dirname, "events");

for (const file of fs
    .readdirSync(eventsPath)
    .filter((f) => f.endsWith(".js"))) {

    const event = require(path.join(eventsPath, file));

    if (event.once) {
        client.once(event.name, (...args) => event.execute(...args, client));
    } else {
        client.on(event.name, (...args) => event.execute(...args, client));
    }
}

// =============================
//  LOGIN
// =============================
client.login(process.env.TOKEN);
