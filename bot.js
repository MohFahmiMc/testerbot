require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { Client, Collection, GatewayIntentBits, ActivityType } = require('discord.js');

const client = new Client({
    intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent]
});

const prefix = "$";
client.commands = new Collection();

// ===========================
// Load all commands
// ===========================
const commandFolders = ['fun', 'moderation', 'utility'];
for (const folder of commandFolders) {
    const folderPath = path.join(__dirname, 'commands', folder);
    if (!fs.existsSync(folderPath)) {
        console.log(`❌ Folder not found: ${folderPath}`);
        continue;
    }

    const files = fs.readdirSync(folderPath).filter(f => f.endsWith('.js'));
    for (const file of files) {
        const commandPath = path.join(folderPath, file);
        try {
            const command = require(commandPath);
            if (command.name) {
                client.commands.set(command.name, command);
            } else {
                console.log(`❌ Command file has no name: ${file}`);
            }
        } catch (err) {
            console.log(`❌ Failed to load command ${file}:`, err);
        }
    }
}

// ===========================
// Ready event + Playing status
// ===========================
client.once('ready', () => {
    console.log(`${client.user.tag} is online!`);
    const activities = ["ScarilyId Group", "ScarilyId Hosting", "ScarilyId Bot"];
    let i = 0;
    setInterval(() => {
        client.user.setActivity(activities[i % activities.length], { type: ActivityType.Playing });
        i++;
    }, 3000);
});

// ===========================
// Prefix command listener
// ===========================
client.on('messageCreate', async message => {
    if (!message.content.startsWith(prefix) || message.author.bot) return;

    const args = message.content.slice(prefix.length).trim().split(/ +/);
    const cmdName = args.shift().toLowerCase();
    const command = client.commands.get(cmdName);

    if (!command) return;

    try {
        await command.execute(message, args);
    } catch (err) {
        console.error(err);
        message.reply("❌ Error executing command");
    }
});

// ===========================
// Login
// ===========================
if (!process.env.DISCORD_TOKEN) {
    console.error("❌ DISCORD_TOKEN not found in environment");
    process.exit(1);
}
client.login(process.env.DISCORD_TOKEN);
