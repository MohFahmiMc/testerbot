require('dotenv').config();
const fs = require('fs');
const { Client, GatewayIntentBits } = require('discord.js');

// Inisialisasi client
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent
    ]
});

// Map untuk menyimpan semua command
client.commands = new Map();

// Load command dari folder commands
const commandFolders = fs.readdirSync('./commands');

for (const folder of commandFolders) {
    const commandFiles = fs.readdirSync(`./commands/${folder}`).filter(f => f.endsWith('.js'));
    for (const file of commandFiles) {
        const command = require(`./commands/${folder}/${file}`);
        command.category = folder.charAt(0).toUpperCase() + folder.slice(1);
        client.commands.set(command.name, command);
    }
}

// Event: bot siap
client.once('ready', () => {
    console.log(`Bot aktif sebagai ${client.user.tag}`);
    client.user.setActivity('With ScarilyId Group', { type: 'WATCHING' });
    setInterval(() => {
        client.user.setActivity('With ScarilyId Group', { type: 'WATCHING' });
    }, 600000); // refresh setiap 10 menit
});

// Event: saat ada pesan masuk
client.on('messageCreate', async (message) => {
    if (!message.content.startsWith('$') || message.author.bot) return;

    const args = message.content.slice(1).trim().split(/ +/);
    const commandName = args.shift().toLowerCase();
    const command = client.commands.get(commandName);
    if (!command) return;

    try {
        await command.execute(message, args, client);
    } catch (error) {
        console.error(error);
        message.reply('Terjadi error saat menjalankan command.');
    }
});

// Login pakai token dari environment
const TOKEN = process.env.TOKEN;
if (!TOKEN) {
    console.error('ERROR: TOKEN Discord tidak ditemukan!');
    process.exit(1);
}

client.login(TOKEN);
