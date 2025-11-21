const fs = require("fs");
const path = require("path");
const {
    Client,
    GatewayIntentBits,
    Collection,
    ActivityType
} = require("discord.js");
require("dotenv").config();

const client = new Client({
    intents: [GatewayIntentBits.Guilds],
});

// ---------- COMMAND COLLECTION ----------
client.commands = new Collection();

// Path folder commands
const commandsPath = path.join(__dirname, "commands");
const commandFolders = fs.readdirSync(commandsPath);

for (const folder of commandFolders) {
    const folderPath = path.join(commandsPath, folder);
    if (!fs.lstatSync(folderPath).isDirectory()) continue;

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

// ---------- COMMAND LOGGER ----------
const commandLogPath = path.join(__dirname, "commands/data/commandLogs.json");

// Pastikan folder & file ada
if (!fs.existsSync(path.join(__dirname, "commands/data"))) {
    fs.mkdirSync(path.join(__dirname, "commands/data"), { recursive: true });
}
if (!fs.existsSync(commandLogPath)) {
    fs.writeFileSync(commandLogPath, "[]", "utf-8");
}

client.commandLogger = (logData) => {
    let data = [];
    try {
        const raw = fs.readFileSync(commandLogPath, "utf-8");
        data = JSON.parse(raw);
        if (!Array.isArray(data)) data = [];
    } catch {
        data = [];
    }
    data.push(logData);
    fs.writeFileSync(commandLogPath, JSON.stringify(data, null, 4), "utf-8");
};

// ---------- READY & STATUS ----------
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

// ---------- INTERACTION ----------
client.on("interactionCreate", async interaction => {
    if (!interaction.isChatInputCommand()) return;

    const command = client.commands.get(interaction.commandName);
    if (!command) return;

    try {
        await command.execute(interaction, client);

        // Log command
        client.commandLogger({
            user: interaction.user.tag,
            command: interaction.commandName,
            guild: interaction.guild?.name || "DM",
            time: new Date().toISOString()
        });

    } catch (err) {
        console.error(err);
        await interaction.reply({
            content: "❌ Error executing command.",
            flags: 64 // ephemeral di v24+
        });
    }
});

// ---------- LOGIN ----------
client.login(process.env.TOKEN);
