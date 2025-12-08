const { Client, GatewayIntentBits, Partials, Collection, PermissionsBitField } = require("discord.js");
require("dotenv").config();
const fs = require("fs");
const path = require("path");

// =============================
//  CLIENT SETUP
// =============================
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildPresences,  
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMessageReactions,
        GatewayIntentBits.GuildVoiceStates
    ],
    partials: [
        Partials.Channel,
        Partials.Message,
        Partials.Reaction,
        Partials.User
    ]
});

// Error handler global
process.on("unhandledRejection", console.error);
process.on("uncaughtException", console.error);

// =============================
//  COLLECTIONS
// =============================
client.commands = new Collection();
client.buttons = new Collection();
client.giveaways = new Collection();

// =============================
//  LOAD COMMANDS
// =============================
const commandsPath = path.join(__dirname, "commands");
for (const folder of fs.readdirSync(commandsPath)) {
    const folderPath = path.join(commandsPath, folder);
    const files = fs.readdirSync(folderPath).filter(f => f.endsWith(".js"));

    for (const file of files) {
        const filePath = path.join(folderPath, file);
        const command = require(filePath);

        if (!command.data || !command.execute) {
            console.warn(`Command ${file} missing "data" or "execute". Skipped.`);
            continue;
        }

        command.filePath = filePath; // simpan path untuk global handler
        client.commands.set(command.data.name, command);
    }
}

// =============================
//  LOAD EVENTS
// =============================
const eventsPath = path.join(__dirname, "events");
for (const file of fs.readdirSync(eventsPath).filter(f => f.endsWith(".js"))) {
    const event = require(path.join(eventsPath, file));

    if (event.once) {
        client.once(event.name, (...args) => event.execute(...args, client));
    } else {
        client.on(event.name, (...args) => event.execute(...args, client));
    }
}

// =============================
//  GLOBAL HANDLER FOR INTERACTIONCREATE
// =============================
client.on("interactionCreate", async (interaction) => {
    if (!interaction.isChatInputCommand()) return;

    const command = client.commands.get(interaction.commandName);
    if (!command) return;

    const commandPath = command.filePath || "";
    const isModeration = commandPath.includes("moderation");

    // 🔹 moderation only admin
    if (isModeration) {
        if (!interaction.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
            return interaction.reply({
                content: "<:utility8:1357261385947418644> You need Administrator permission to use this command.",
                ephemeral: true
            });
        }
    }

    // 🔹 execute command
    try {
        await command.execute(interaction, client);
    } catch (err) {
        console.error(err);
        if (!interaction.replied)
            await interaction.reply({ content: "❌ Error executing this command.", ephemeral: true });
    }
});

// =============================
//  LOGIN
// =============================
client.login(process.env.TOKEN);
