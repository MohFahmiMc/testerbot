const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const fs = require("fs");
const path = require("path");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("help")
        .setDescription("Show the list of all available commands"),

    async execute(interaction) {
        const commandsPath = path.join(__dirname, "..");
        const categories = fs.readdirSync(commandsPath);

        let helpText = "";

        for (const category of categories) {
            const categoryPath = path.join(commandsPath, category);
            if (!fs.lstatSync(categoryPath).isDirectory()) continue;

            const commandFiles = fs
                .readdirSync(categoryPath)
                .filter(file => file.endsWith(".js"));

            if (commandFiles.length === 0) continue;

            helpText += `**${category.toUpperCase()}**\n`;

            for (const file of commandFiles) {
                const filePath = path.join(categoryPath, file);
                const cmd = require(filePath);

                if (cmd.data && cmd.data.name) {
                    helpText += `• **/${cmd.data.name}** — ${cmd.data.description || "No description"}\n`;
                }
            }

            helpText += "\n";
        }

        const embed = new EmbedBuilder()
            .setColor("#2B2D31")
            .setTitle("Command List")
            .setDescription(helpText || "No commands found.")
            .setFooter({
                text: `${interaction.guild.name}`,
                iconURL: interaction.guild.iconURL() || undefined
            })
            .setTimestamp();

        return interaction.reply({ embeds: [embed], ephemeral: false });
    }
};
