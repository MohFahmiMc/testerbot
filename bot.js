const fs = require('fs');
const path = require('path');
const { Client, GatewayIntentBits, Partials, Collection, ActivityType, EmbedBuilder } = require('discord.js');
require('dotenv').config(); // Pastikan token di .env

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMembers
    ],
    partials: [Partials.Channel]
});

// Command collection
client.commands = new Collection();
const commandFolders = ['fun','moderation','utility'];

for (const folder of commandFolders) {
    const commandFiles = fs.readdirSync(`./commands/${folder}`).filter(file => file.endsWith('.js'));
    for (const file of commandFiles) {
        const filePath = path.join(__dirname, 'commands', folder, file);
        const command = require(filePath);
        if ('name' in command && 'execute' in command) {
            client.commands.set(command.name, command);
        } else {
            console.log(`❌ Failed to load command ${file}`);
        }
    }
}

const prefix = '$';

client.once('ready', () => {
    console.log(`${client.user.tag} is online!`);

    // Auto ganti status
    const activities = [
        "ScarilyId Group",
        "ScarilyId Hosting",
        "ScarilyId Server"
    ];
    let i = 0;
    setInterval(() => {
        client.user.setActivity(activities[i % activities.length], { type: ActivityType.Playing });
        i++;
    }, 3000);
});

// Prefix commands
client.on('messageCreate', async message => {
    if (!message.content.startsWith(prefix) || message.author.bot) return;

    const args = message.content.slice(prefix.length).trim().split(/ +/);
    const commandName = args.shift().toLowerCase();

    const command = client.commands.get(commandName);
    if (!command) return;

    try {
        await command.execute(message, args, client);
    } catch (error) {
        console.error(error);
        message.reply('❌ Error executing command');
    }
});

// Slash commands
client.on('interactionCreate', async interaction => {
    if (!interaction.isChatInputCommand()) return;

    const command = client.commands.get(interaction.commandName);
    if (!command) return;

    try {
        await command.execute(interaction, null, client);
    } catch (error) {
        console.error(error);
        await interaction.reply({ content: '❌ Error executing command', ephemeral: true });
    }
});

client.login(process.env.TOKEN);
