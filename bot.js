require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { Client, Collection, GatewayIntentBits, ActivityType } = require('discord.js');

const prefix = "$";
const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent] });

// Load semua command
client.commands = new Collection();
const commandFolders = ['fun', 'moderation', 'utility'];
for (const folder of commandFolders) {
    const commandFiles = fs.readdirSync(`./commands/${folder}`).filter(f => f.endsWith('.js'));
    for (const file of commandFiles) {
        const command = require(`./commands/${folder}/${file}`);
        if (command.name) client.commands.set(command.name, command);
    }
}

// Ready event
client.once('ready', () => {
    console.log(`${client.user.tag} is online!`);

    const activities = [
        "ScarilyId Group",
        "ScarilyId Hosting",
        "ScarilyId Bot",
        "Watching Servers",
    ];
    let i = 0;

    // Set interval untuk ganti-ganti status
    setInterval(() => {
        client.user.setActivity(activities[i % activities.length], { type: ActivityType.Playing });
        i++;
    }, 3000); // 3 detik
});

// Slash command
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

// Prefix command
client.on('messageCreate', async message => {
    if (!message.content.startsWith(prefix) || message.author.bot) return;
    const args = message.content.slice(prefix.length).trim().split(/ +/);
    const cmdName = args.shift().toLowerCase();
    const command = client.commands.get(cmdName);
    if (!command) return;
    try {
        await command.execute(message);
    } catch (err) {
        console.error(err);
        message.reply('❌ Error executing command');
    }
});

// Login bot
if (!process.env.DISCORD_TOKEN) {
    console.error("❌ Token tidak ditemukan. Gunakan: export DISCORD_TOKEN='TOKEN_BOT'");
    process.exit(1);
}

client.login(process.env.DISCORD_TOKEN);
