const { SlashCommandBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder } = require("discord.js");
const fs = require("fs");
const path = require("path");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("help")
        .setDescription("Show bot commands and categories"),

    async execute(interaction) {
        const commandsPath = path.join(__dirname);
        const commandFolders = fs.readdirSync(commandsPath);

        const categories = {};
        for (const folder of commandFolders) {
            const folderPath = path.join(commandsPath, folder);
            if (!fs.lstatSync(folderPath).isDirectory()) continue;
            const commandFiles = fs.readdirSync(folderPath).filter(f => f.endsWith(".js"));
            categories[folder] = commandFiles.map(f => {
                const cmd = require(path.join(folderPath, f));
                return cmd.data?.name || f.replace(".js", "");
            });
        }

        const embed = new EmbedBuilder()
            .setTitle("Bot Commands")
            .setColor("Grey")
            .setDescription("Here are the main categories:")
            .setTimestamp();

        let desc = "";
        for (const [cat, cmds] of Object.entries(categories)) {
            desc += `**${cat.charAt(0).toUpperCase() + cat.slice(1)}**: ${cmds.length} commands\n`;
        }
        embed.setDescription(desc);

        const row = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setCustomId("show_all_commands")
                .setLabel("Show All Commands")
                .setStyle(ButtonStyle.Secondary) // abu-abu
        );

        await interaction.reply({ embeds: [embed], components: [row], ephemeral: true });

        const filter = i => i.customId === "show_all_commands" && i.user.id === interaction.user.id;
        const collector = interaction.channel.createMessageComponentCollector({ filter, time: 60000 });

        collector.on("collect", async i => {
            if (i.customId === "show_all_commands") {
                const fullEmbed = new EmbedBuilder()
                    .setTitle("All Commands")
                    .setColor("Grey")
                    .setTimestamp();

                let fullDesc = "";
                for (const [cat, cmds] of Object.entries(categories)) {
                    fullDesc += `**${cat.charAt(0).toUpperCase() + cat.slice(1)}**:\n`;
                    fullDesc += cmds.join(", ") + "\n\n";
                }

                fullEmbed.setDescription(fullDesc);
                await i.update({ embeds: [fullEmbed], components: [] });
            }
        });
    },
};
