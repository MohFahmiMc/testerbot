require('dotenv').config();
const fs = require('fs');
const { Client, GatewayIntentBits, ActivityType } = require('discord.js');

// Prefix yang dipakai
const prefixes = ['!', '$', '/'];

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

// Load semua command dari folder commands
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

    // Set initial activity
    client.user.setActivity('With ScarilyId Group', { type: ActivityType.Watching });

    // Refresh setiap 10 menit supaya status tetap muncul
    setInterval(() => {
        client.user.setActivity('With ScarilyId Group', { type: ActivityType.Watching });
    }, 600000);
});

// Event: saat ada pesan masuk
client.on('messageCreate', async (message) => {
    if (message.author.bot) return;

    // Cek prefix yang digunakan
    const usedPrefix = prefixes.find(p => message.content.startsWith(p));
    if (!usedPrefix) return;

    const args = message.content.slice(usedPrefix.length).trim().split(/ +/);
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
    console.error('ERROR: TOKEN Discord tidak ditemukan! Masukkan di .env atau Railway Environment Variables');
    process.exit(1);
}

client.login(TOKEN);
