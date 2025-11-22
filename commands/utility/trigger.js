const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const fs = require("fs");
const path = require("path");

const triggersPath = path.join(__dirname, "../data/triggers.json");

// Pastikan file triggers.json ada
if (!fs.existsSync(triggersPath)) fs.writeFileSync(triggersPath, "{}");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("trigger")
        .setDescription("Manage triggers for automatic replies")
        .addStringOption(option => 
            option.setName("action")
                .setDescription("Action: add, rm, list")
                .setRequired(true))
        .addStringOption(option => 
            option.setName("trigger")
                .setDescription("Trigger text (required for add/rm)"))
        .addStringOption(option => 
            option.setName("chat")
                .setDescription("Chat reply (required for add)")),

    async execute(interaction) {
        const action = interaction.options.getString("action").toLowerCase();
        const triggerText = interaction.options.getString("trigger");
        const chatText = interaction.options.getString("chat");

        const data = JSON.parse(fs.readFileSync(triggersPath));

        const guildId = interaction.guild.id;
        if (!data[guildId]) data[guildId] = {};

        if (action === "add") {
            if (!triggerText || !chatText) return interaction.reply({ content: "❌ Please provide both trigger and chat.", ephemeral: true });
            data[guildId][triggerText] = chatText;
            fs.writeFileSync(triggersPath, JSON.stringify(data, null, 2));
            return interaction.reply({ content: `✅ Trigger added: "${triggerText}" → "${chatText}"`, ephemeral: true });
        }

        if (action === "rm") {
            if (!triggerText) return interaction.reply({ content: "❌ Please provide trigger to remove.", ephemeral: true });
            if (!data[guildId][triggerText]) return interaction.reply({ content: "❌ Trigger not found.", ephemeral: true });
            delete data[guildId][triggerText];
            fs.writeFileSync(triggersPath, JSON.stringify(data, null, 2));
            return interaction.reply({ content: `✅ Trigger removed: "${triggerText}"`, ephemeral: true });
        }

        if (action === "list") {
            const triggers = Object.keys(data[guildId]);
            if (!triggers.length) return interaction.reply({ content: "⚠️ No triggers found.", ephemeral: true });

            const embed = new EmbedBuilder()
                .setTitle(`Trigger List for ${interaction.guild.name}`)
                .setDescription(triggers.map(t => `**Trigger:** ${t} → **Reply:** ${data[guildId][t]}`).join("\n"))
                .setColor("Green")
                .setTimestamp();

            return interaction.reply({ embeds: [embed], ephemeral: true });
        }

        return interaction.reply({ content: "❌ Invalid action. Use add, rm, or list.", ephemeral: true });
    }
};

// Listening messages for triggers (paste this in bot.js)
module.exports.listenTrigger = (client) => {
    const triggersData = JSON.parse(fs.readFileSync(triggersPath));

    client.on("messageCreate", async message => {
        if (message.author.bot) return;
        const guildId = message.guild.id;
        if (!triggersData[guildId]) return;

        const triggers = triggersData[guildId];
        for (const key in triggers) {
            if (message.content.toLowerCase().includes(key.toLowerCase())) {
                await message.reply({ content: triggers[key] });
                break; // hanya trigger pertama yang cocok
            }
        }
    });
};
