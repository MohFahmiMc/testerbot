const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, SlashCommandBuilder } = require("discord.js");
const fs = require("fs");
const path = require("path");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("help")
        .setDescription("Display all bot commands."),

    async execute(interaction, client) {
        const commandsPath = path.join(__dirname, "..");
        const folders = fs.readdirSync(commandsPath).filter(f => fs.lstatSync(path.join(commandsPath, f)).isDirectory());
        let embeds = [];

        for (const folder of folders) {
            const commandFiles = fs.readdirSync(path.join(commandsPath, folder)).filter(f => f.endsWith(".js"));
            const descriptionList = commandFiles.map(f => {
                const cmd = require(path.join(commandsPath, folder, f));
                return `\`${cmd.data.name}\` - ${cmd.data.description || "No description"}`;
            }).join("\n");

            const embed = new EmbedBuilder()
                .setTitle(`Commands: ${folder}`)
                .setDescription(descriptionList || "No commands")
                .setColor("Blue")
                .setFooter({ text: "MyDiscordBot • Help Command" });
            embeds.push(embed);
        }

        // Pagination Buttons
        const row = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder().setCustomId("prev_page").setLabel("⬅️ Previous").setStyle(ButtonStyle.Primary),
                new ButtonBuilder().setCustomId("next_page").setLabel("Next ➡️").setStyle(ButtonStyle.Primary),
                new ButtonBuilder().setCustomId("show_all").setLabel("Show All").setStyle(ButtonStyle.Secondary)
            );

        let page = 0;
        const msg = await interaction.reply({ embeds: [embeds[page]], components: [row], fetchReply: true });

        const collector = msg.createMessageComponentCollector({ time: 60000 });

        collector.on("collect", i => {
            if (i.user.id !== interaction.user.id) return i.reply({ content: "You can't use this.", ephemeral: true });

            if (i.customId === "prev_page") page = (page > 0) ? page - 1 : embeds.length - 1;
            if (i.customId === "next_page") page = (page + 1) % embeds.length;
            if (i.customId === "show_all") {
                const allEmbed = new EmbedBuilder()
                    .setTitle("All Commands")
                    .setDescription(embeds.map(e => `**${e.title}**\n${e.data.description}`).join("\n\n"))
                    .setColor("Green")
                    .setFooter({ text: "MyDiscordBot • Help Command" });
                return i.update({ embeds: [allEmbed], components: [] });
            }
            i.update({ embeds: [embeds[page]] });
        });
    }
};
