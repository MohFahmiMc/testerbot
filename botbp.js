const fs = require("fs");
const path = require("path");
const {
    Client,
    GatewayIntentBits,
    Partials,
    Collection,
    ActivityType,
    EmbedBuilder
} = require("discord.js");
require("dotenv").config();

// Buat client
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMembers
    ],
    partials: [Partials.Channel]
});

// Koleksi commands
client.commands = new Collection();

// Load commands
const commandsPath = path.join(__dirname, "commands");
const commandFolders = fs.readdirSync(commandsPath);

for (const folder of commandFolders) {
    const folderPath = path.join(commandsPath, folder);
    const commandFiles = fs.readdirSync(folderPath).filter(f => f.endsWith(".js"));

    for (const file of commandFiles) {
        const filePath = path.join(folderPath, file);
        const command = require(filePath);

        if (!command.data || !command.execute) {
            console.log(`Command invalid: ${file}`);
            continue;
        }

        client.commands.set(command.data.name, command);
    }
}

// Prefix handler
const { getPrefix } = require("./utils/prefixHandler");

// Event: ready
client.once("ready", async () => {
    console.log(`${client.user.tag} is online!`);

    const statuses = [
        "ScarilyId Group",
        "ScarilyId Hosting",
        "ScarilyId SMP"
    ];
    let i = 0;
    setInterval(() => {
        client.user.setActivity(statuses[i % statuses.length], { type: ActivityType.Playing });
        i++;
    }, 3000);

    // Trigger reload triggers.json
    client.triggers = {};
    const triggersPath = path.join(__dirname, "data/triggers.json");
    if (fs.existsSync(triggersPath)) {
        client.triggers = JSON.parse(fs.readFileSync(triggersPath, "utf-8"));
    }
});

// Event: messageCreate untuk XP & trigger
client.on("messageCreate", async message => {
    if (message.author.bot) return;

    const prefix = getPrefix(message.guild?.id);

    // Check trigger
    if (client.triggers && Object.keys(client.triggers).length > 0) {
        for (const trig of Object.keys(client.triggers)) {
            if (message.content.toLowerCase().includes(trig.toLowerCase())) {
                await message.reply({ content: client.triggers[trig] });
            }
        }
    }

    // Level system
    const levelsPath = path.join(__dirname, "data/levels.json");
    let levelsData = {};
    if (fs.existsSync(levelsPath)) levelsData = JSON.parse(fs.readFileSync(levelsPath, "utf-8"));

    if (!levelsData[message.author.id]) {
        levelsData[message.author.id] = { xp: 0, level: 1 };
    }

    levelsData[message.author.id].xp += Math.floor(Math.random() * 10) + 5; // XP random 5-15
    const xpNeeded = levelsData[message.author.id].level * 100;
    if (levelsData[message.author.id].xp >= xpNeeded) {
        levelsData[message.author.id].xp -= xpNeeded;
        levelsData[message.author.id].level += 1;

        message.reply({ content: `🎉 Congrats ${message.author}, you reached level ${levelsData[message.author.id].level}!` });
    }

    fs.writeFileSync(levelsPath, JSON.stringify(levelsData, null, 2));
});

// Event: interactionCreate untuk slash command
client.on("interactionCreate", async interaction => {
    if (!interaction.isChatInputCommand()) return;

    const command = client.commands.get(interaction.commandName);
    if (!command) return;

    try {
        await command.execute(interaction, client);
    } catch (err) {
        console.error(err);
        if (interaction.replied || interaction.deferred) {
            await interaction.editReply({ content: "❌ Error executing command.", ephemeral: true });
        } else {
            await interaction.reply({ content: "❌ Error executing command.", ephemeral: true });
        }
    }
});

// Login
client.login(process.env.TOKEN);
