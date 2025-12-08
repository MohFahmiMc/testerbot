const { SlashCommandBuilder } = require("discord.js");
const fs = require("fs");
const path = require("path");
const { pushFile } = require("../../utils/github");

const prefixesPath = path.join(__dirname, "../../data/prefixes.json");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("setprefix")
        .setDescription("Set a custom prefix for this server")
        .addStringOption(option =>
            option.setName("prefix")
                .setDescription("New prefix for this server")
                .setRequired(true)
        ),
    folder: "moderation",

    async execute(interaction) {
        if (!interaction.member.permissions.has("Administrator")) {
            return interaction.reply({ content: "❌ You need Administrator permission.", ephemeral: true });
        }

        const newPrefix = interaction.options.getString("prefix").trim();
        let prefixes = {};

        if (fs.existsSync(prefixesPath)) {
            prefixes = JSON.parse(fs.readFileSync(prefixesPath, "utf8"));
        }

        prefixes[interaction.guild.id] = newPrefix;
        fs.writeFileSync(prefixesPath, JSON.stringify(prefixes, null, 2));

        // Push ke GitHub
        try {
            await pushFile("data/prefixes.json", JSON.stringify(prefixes, null, 2), `Update prefix for ${interaction.guild.id}`);
        } catch (err) {
            console.error("Failed to push prefix to GitHub:", err);
        }

        interaction.reply({ content: `✅ Prefix set to \`${newPrefix}\` for this server.`, ephemeral: true });
    }
};
