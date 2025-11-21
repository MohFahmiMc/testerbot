require('dotenv').config();
const fs = require('fs');
const { Client, Collection, GatewayIntentBits, ActivityType, REST, Routes } = require('discord.js');

const prefix = "$"; 
const client = new Client({
    intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent]
});

// ===========================
// Load Commands
// ===========================
client.commands = new Collection();
const commandFolders = ['fun', 'moderation', 'utility'];

for (const folder of commandFolders) {
    const files = fs.readdirSync(`./commands/${folder}`).filter(f => f.endsWith('.js'));
    for (const file of files) {
        const command = require(`./commands/${folder}/${file}`);
        if (command.name) client.commands.set(command.name, command);
        else console.log(`❌ Failed to load ${file}`);
    }
}

// ===========================
// Ready Event
// ===========================
client.once('ready', async () => {
    console.log(`${client.user.tag} is online!`);

    // Status berganti tiap 3 detik
    const activities = [
        "ScarilyId Group",
        "ScarilyId Hosting",
        "ScarilyId Bot",
        "Watching Servers"
    ];
    let i = 0;
    setInterval(() => {
        client.user.setActivity(activities[i % activities.length], { type: ActivityType.Playing });
        i++;
    }, 3000);

    // Slash commands global registration
    try {
        const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_TOKEN);
        const slashCommands = [];
        client.commands.forEach(cmd => {
            if (cmd.slash) {
                slashCommands.push({
                    name: cmd.name,
                    description: cmd.description || "No description",
                    options: cmd.options || []
                });
            }
        });
        await rest.put(Routes.applicationCommands(client.user.id), { body: slashCommands });
        console.log("✅ Slash commands registered globally");
    } catch (err) {
        console.error("❌ Failed to register slash commands:", err);
    }
});

// ===========================
// Slash Command Interaction
// ===========================
client.on('interactionCreate', async interaction => {
    if (!interaction.isChatInputCommand()) return;
    const command = client.commands.get(interaction.commandName);
    if (!command) return;
    try {
        await command.execute(interaction);
    } catch (err) {
        console.error('❌ Error executing command', err);
        await interaction.reply({ content: '❌ Error executing command', ephemeral: true });
    }
});

// ===========================
// Prefix Command
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
        message.reply('❌ Error executing command');
    }
});

// ===========================
// Login
// ===========================
if (!process.env.DISCORD_TOKEN) {
    console.error("❌ Token not found. Set DISCORD_TOKEN as Environment Variable");
    process.exit(1);
}
client.login(process.env.DISCORD_TOKEN);
