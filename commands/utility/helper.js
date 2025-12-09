const {
    SlashCommandBuilder,
    EmbedBuilder,
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle
} = require("discord.js");
const fs = require("fs");
const path = require("path");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("help")
        .setDescription("Show all bot commands separated with categories.")
        .addStringOption(option =>
            option.setName("command")
                .setDescription("Optional: show specific command usage.")
                .setRequired(false)
        ),

    async execute(interaction) {
        const baseDir = path.join(__dirname, "..");
        const categories = ["fun", "moderation", "utility", "music"];
        let page = 0;

        const selectedCommand = interaction.options.getString("command")?.toLowerCase();

        // Load commands of a category
        function loadCategoryCommands(category) {
            const categoryPath = path.join(baseDir, category);
            let cmds = [];

            if (fs.existsSync(categoryPath)) {
                const files = fs.readdirSync(categoryPath).filter(f => f.endsWith(".js"));
                for (const file of files) {
                    const command = require(path.join(categoryPath, file));
                    if (!command?.data) continue;

                    cmds.push({
                        name: command.data.name,
                        description: command.data.description || "No description provided.",
                        options: command.data.options || []
                    });
                }
            }
            return cmds;
        }

        // Load all commands
        const allCommands = categories.flatMap(cat => loadCategoryCommands(cat).map(cmd => ({ ...cmd, category: cat })));

        // If user wants a specific command
        if (selectedCommand) {
            const cmd = allCommands.find(c => c.name.toLowerCase() === selectedCommand);
            if (!cmd) return interaction.reply({ content: `❌ Command \`${selectedCommand}\` not found.`, ephemeral: true });

            const embed = new EmbedBuilder()
                .setTitle(`🔹 /${cmd.name}`)
                .setColor("#2B2D31")
                .setDescription(cmd.description)
                .addFields(
                    { name: "Category", value: cmd.category.toUpperCase(), inline: true },
                    { name: "Usage", value: `\`/${cmd.name}${cmd.options.map(o => o.required ? ` <${o.name}>` : ` [${o.name}]`).join('')}\``, inline: true }
                )
                .setFooter({ text: `Requested by ${interaction.user.tag}`, iconURL: interaction.user.displayAvatarURL() })
                .setTimestamp();

            return interaction.reply({ embeds: [embed], ephemeral: true });
        }

        // Pagination embed
        function generateEmbed() {
            const category = categories[page];
            const commands = loadCategoryCommands(category);

            const embed = new EmbedBuilder()
                .setTitle(`<a:enchantbook:1447855833789763775> Help Menu`)
                .setColor("#2B2D31")
                .setDescription(`**Category:** \`${category.toUpperCase()}\`\nUse the buttons to navigate.`)
                .setFooter({ text: `Page ${page + 1} / ${categories.length}` });

            if (commands.length === 0) {
                embed.addFields({ name: "No Commands", value: "This category has no commands.", inline: false });
            } else {
                for (const cmd of commands) {
                    embed.addFields({
                        name: `🔹 /${cmd.name}`,
                        value: cmd.description,
                        inline: false
                    });
                }
            }

            return embed;
        }

        const getButtons = () => new ActionRowBuilder().addComponents(
            new ButtonBuilder().setCustomId("first").setLabel("⏮ First").setStyle(ButtonStyle.Secondary).setDisabled(page === 0),
            new ButtonBuilder().setCustomId("prev").setLabel("◀ Page --").setStyle(ButtonStyle.Secondary).setDisabled(page === 0),
            new ButtonBuilder().setCustomId("next").setLabel("Page ++ ▶").setStyle(ButtonStyle.Secondary).setDisabled(page === categories.length - 1),
            new ButtonBuilder().setCustomId("last").setLabel("⏭ Last").setStyle(ButtonStyle.Secondary).setDisabled(page === categories.length - 1),
            new ButtonBuilder().setCustomId("show_all").setLabel("📄 Show All Commands").setStyle(ButtonStyle.Primary)
        );

        await interaction.reply({
            embeds: [generateEmbed()],
            components: [getButtons()],
            ephemeral: true
        });

        const collector = interaction.channel.createMessageComponentCollector({ time: 60000 });

        collector.on("collect", async i => {
            if (i.user.id !== interaction.user.id)
                return i.reply({ content: "<:utility8:1357261385947418644> This menu is not for you.", ephemeral: true });

            if (i.customId === "first") page = 0;
            if (i.customId === "prev" && page > 0) page--;
            if (i.customId === "next" && page < categories.length - 1) page++;
            if (i.customId === "last") page = categories.length - 1;

            if (i.customId === "show_all") {
                const all = [];
                for (const category of categories) {
                    const cmds = loadCategoryCommands(category);
                    all.push(`**${category.toUpperCase()}**`);
                    all.push(cmds.map(c => `• \`/${c.name}\` - ${c.description}`).join("\n") || "_No commands_");
                    all.push("");
                }

                return i.update({ embeds: [new EmbedBuilder().setTitle("📋 All Commands").setColor("#2B2D31").setDescription(all.join("\n"))], components: [] });
            }

            await i.update({ embeds: [generateEmbed()], components: [getButtons()] });
        });
    }
};
