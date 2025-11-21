require('dotenv').config();
const { Client, Collection, GatewayIntentBits } = require('discord.js');
const fs = require('fs');

// Create client
const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent] });

// ------------------ LOAD COMMANDS ------------------
client.commands = new Collection();
const commandFiles = fs.readdirSync('./commands').filter(f => f.endsWith('.js'));

for (const file of commandFiles) {
    const command = require(`./commands/${file}`);
    client.commands.set(command.name, command);
}

// ------------------ READY EVENT ------------------
client.once('ready', () => {
    console.log(`${client.user.tag} is online!`);

    // Status Watching ScarilyId Group + jumlah server
    const updateWatching = () => {
        const serverCount = client.guilds.cache.size;
        client.user.setActivity(`ScarilyId Group | ${serverCount} Servers`, { type: 'WATCHING' });
    };

    updateWatching();
    setInterval(updateWatching, 600000); // update setiap 10 menit
});

// ------------------ PREFIX HANDLER ------------------
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
    } catch (error) {
        console.error(error);
        message.reply("Terjadi error saat menjalankan command!");
    }
});

// ------------------ LOGIN ------------------
client.login(process.env.TOKEN);
