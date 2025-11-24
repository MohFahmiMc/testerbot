const { SlashCommandBuilder } = require("discord.js");
const fs = require("fs");
const path = require("path");

const OWNER_ID = process.env.OWNER_ID;
const ADMIN_FILE = path.join(__dirname, "../../data/admins.json");
const TRIGGERS_FILE = path.join(__dirname, "../../data/triggers.json");

// Ensure files exist
if (!fs.existsSync(ADMIN_FILE)) fs.writeFileSync(ADMIN_FILE, JSON.stringify({ admins: [] }, null, 2));
if (!fs.existsSync(TRIGGERS_FILE)) fs.writeFileSync(TRIGGERS_FILE, JSON.stringify({}, null, 2));

// Utility functions
function loadAdmins() {
    return JSON.parse(fs.readFileSync(ADMIN_FILE));
}

function saveTriggers(data) {
    fs.writeFileSync(TRIGGERS_FILE, JSON.stringify(data, null, 2));
}

function loadTriggers() {
    return JSON.parse(fs.readFileSync(TRIGGERS_FILE));
}

function canManageTrigger(userId, guildOwnerId) {
    const admins = loadAdmins();
    return userId === OWNER_ID || admins.admins.includes(userId) || userId === guildOwnerId;
}

// Export command
module.exports = {
    data: new SlashCommandBuilder()
        .setName("trigger")
        .setDescription("Manage server triggers (add/remove/list)")
        .addSubcommand(sub =>
            sub.setName("add")
                .setDescription("Add a new trigger")
                .addStringOption(opt => opt.setName("trigger").setDescription("Trigger keyword").setRequired(true))
                .addStringOption(opt => opt.setName("response").setDescription("Bot response").setRequired(true))
        )
        .addSubcommand(sub =>
            sub.setName("remove")
                .setDescription("Remove a trigger")
                .addStringOption(opt => opt.setName("trigger").setDescription("Trigger keyword to remove").setRequired(true))
        )
        .addSubcommand(sub =>
            sub.setName("list")
                .setDescription("List all triggers for this server")),

    async execute(interaction) {
        const sub = interaction.options.getSubcommand();
        const guildId = interaction.guild.id;
        const userId = interaction.user.id;

        if (!canManageTrigger(userId, interaction.guild.ownerId)) {
            return interaction.reply({ content: "❌ Only Bot Owner, Admin Bot, or Server Owner can manage triggers.", ephemeral: true });
        }

        const triggers = loadTriggers();
        if (!triggers[guildId]) triggers[guildId] = {};

        if (sub === "add") {
            const keyword = interaction.options.getString("trigger");
            const response = interaction.options.getString("response");

            triggers[guildId][keyword] = response;
            saveTriggers(triggers);

            return interaction.reply({ content: `✅ Trigger \`${keyword}\` added with response \`${response}\``, ephemeral: true });
        }

        if (sub === "remove") {
            const keyword = interaction.options.getString("trigger");

            if (!triggers[guildId][keyword]) {
                return interaction.reply({ content: "❌ Trigger not found.", ephemeral: true });
            }

            delete triggers[guildId][keyword];
            saveTriggers(triggers);

            return interaction.reply({ content: `🗑️ Trigger \`${keyword}\` removed.`, ephemeral: true });
        }

        if (sub === "list") {
            const serverTriggers = triggers[guildId];
            if (!serverTriggers || Object.keys(serverTriggers).length === 0) {
                return interaction.reply({ content: "📭 No triggers set for this server.", ephemeral: true });
            }

            const list = Object.entries(serverTriggers)
                .map(([k, v]) => `**${k}** → ${v}`)
                .join("\n");

            return interaction.reply({ content: `📋 Triggers for this server:\n${list}`, ephemeral: true });
        }
    },

    // Event handler for message auto-reply
    async handleMessage(message) {
        if (!message.guild || message.author.bot) return;

        const triggers = loadTriggers();
        const guildTriggers = triggers[message.guild.id];
        if (!guildTriggers) return;

        for (const [keyword, response] of Object.entries(guildTriggers)) {
            if (message.content.toLowerCase().includes(keyword.toLowerCase())) {
                return message.channel.send(response);
            }
        }
    }
};
