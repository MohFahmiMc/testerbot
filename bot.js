const fs = require("fs");
const path = require("path");
const {
    Client,
    GatewayIntentBits,
    Partials,
    Collection,
    ActivityType
} = require("discord.js");
require("dotenv").config();

const client = new Client({
    intents: [GatewayIntentBits.Guilds],
});

// Koleksi Command
client.commands = new Collection();

// ⬇⬇⬇ MASUKKAN NO.2 DI SINI!
client.commandLogger = require("./utils/commandLogger");
// ⬆⬆⬆

const commandsPath = path.join(__dirname, "commands");

// Ambil folder dalam commands
const commandFolders = fs.readdirSync(commandsPath);

for (const folder of commandFolders) {
    const folderPath = path.join(commandsPath, folder);

    const commandFiles = fs.readdirSync(folderPath).filter(f => f.endsWith(".js"));

    for (const file of commandFiles) {
        const filePath = path.join(folderPath, file);
        const command = require(filePath);

        if (!command.data || !command.execute) {
            console.log(`❌ Command invalid: ${file}`);
            continue;
        }

        client.commands.set(command.data.name, command);
    }
}

// SIAP STATUS
client.once("ready", () => {
    console.log(`${client.user.tag} is online!`);

    const statuses = [
        "ScarilyId Group",
        "ScarilyId Hosting",
        "ScarilyId SMP"
    ];
    let i = 0;

    setInterval(() => {
        client.user.setActivity(statuses[i % statuses.length], {
            type: ActivityType.Playing
        });
        i++;
    }, 3000);
});

// SLASH COMMAND
client.on("interactionCreate", async interaction => {
    if (!interaction.isChatInputCommand()) return;

    const command = client.commands.get(interaction.commandName);

    if (!command) return;

    // Log command (nomor 3)
    client.commandLogger(client, interaction, interaction.commandName);

    try {
        await command.execute(interaction, client);
    } catch (err) {
        console.error(err);
        interaction.reply({
            content: "❌ Error executing command.",
            ephemeral: true
        });
    }
});

client.login(process.env.TOKEN);
