require('dotenv').config();
const { Client, Collection, GatewayIntentBits, EmbedBuilder } = require('discord.js');
const fs = require('fs');
const path = require('path');

// ------------------ CLIENT ------------------
const client = new Client({ 
    intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent] 
});

// ------------------ LOAD COMMANDS ------------------
client.commands = new Collection();
const commandFolders = ['commands/fun', 'commands/moderation', 'commands/utility'];

console.log("Loading commands...");
for (const folder of commandFolders) {
    const fullFolderPath = path.join(__dirname, folder);
    if (!fs.existsSync(fullFolderPath)) continue;

    const files = fs.readdirSync(fullFolderPath).filter(f => f.endsWith('.js'));
    for (const file of files) {
        const filePath = path.join(fullFolderPath, file);
        try {
            const command = require(filePath);

            if (!command.name || !command.execute) {
                console.warn(`⚠️ Command ${file} missing properties, skipped.`);
                continue;
            }

            client.commands.set(command.name.toLowerCase(), command);
            console.log(`✅ Loaded command: ${command.name} from ${folder}`);
        } catch (error) {
            console.error(`❌ Failed to load command ${file}:`, error.message);
        }
    }
}

// ------------------ READY EVENT ------------------
client.once('ready', () => {
    console.log(`${client.user.tag} is online!`);

    const updateWatching = () => {
        const serverCount = client.guilds.cache.size;
        client.user.setActivity(`ScarilyId Group | ${serverCount} Servers`, { type: 'WATCHING' });
        console.log(`👀 Watching updated: ScarilyId Group | ${serverCount} Servers`);
    };

    updateWatching();
    setInterval(updateWatching, 600000); // update tiap 10 menit
});

// ------------------ PREFIX COMMAND HANDLER ------------------
client.on('messageCreate', message => {
    if (message.author.bot) return;

    const prefixes = ['!', '$'];
    const prefixUsed = prefixes.find(p => message.content.startsWith(p));
    if (!prefixUsed) return;

    const args = message.content.slice(prefixUsed.length).trim().split(/ +/);
    const cmdName = args.shift().toLowerCase();
    const command = client.commands.get(cmdName);

    if (!command) return;

    try {
        command.execute(message, args, client);
        console.log(`🟢 Executed command: ${command.name} by ${message.author.tag}`);
    } catch (error) {
        console.error(`❌ Error executing command ${command.name}:`, error.message);
        message.reply("⚠️ Terjadi error saat menjalankan command!");
    }
});

// ------------------ LOGIN ------------------
client.login(process.env.TOKEN).catch(err => {
    console.error("❌ Failed to login. Periksa TOKEN di .env", err.message);
});
