const { 
    SlashCommandBuilder,
    EmbedBuilder,
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    ComponentType
} = require("discord.js");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("help")
        .setDescription("Show all bot commands with categories."),

    async execute(interaction, client) {
        await interaction.deferReply();

        // Ambil semua command dan kategorinya
        const categories = {};
        client.commands.forEach(cmd => {
            const folder = cmd.folder || "Uncategorized";
            if (!categories[folder]) categories[folder] = [];
            categories[folder].push(cmd.data.name);
        });

        const categoryNames = Object.keys(categories);
        let page = 0;

        const generateEmbed = (pageIndex) => {
            const category = categoryNames[pageIndex];
            const cmds = categories[category].map(c => `\`${c}\``).join(", ");

            return new EmbedBuilder()
                .setTitle(`Help - ${category}`)
                .setDescription(cmds || "No commands in this category.")
                .setColor(0x2f3136)
                .setFooter({ text: "Zephyr Bot", iconURL: client.user.displayAvatarURL() });
        };

        // Tombol navigasi
        const row = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId("prev")
                    .setLabel("◀ Prev")
                    .setStyle(ButtonStyle.Primary)
                    .setDisabled(categoryNames.length <= 1),
                new ButtonBuilder()
                    .setCustomId("next")
                    .setLabel("Next ▶")
                    .setStyle(ButtonStyle.Primary)
                    .setDisabled(categoryNames.length <= 1),
                new ButtonBuilder()
                    .setCustomId("showall")
                    .setLabel("📃 Show All")
                    .setStyle(ButtonStyle.Secondary)
            );

        const helpMessage = await interaction.editReply({
            embeds: [generateEmbed(page)],
            components: [row]
        });

        const collector = helpMessage.createMessageComponentCollector({
            componentType: ComponentType.Button,
            time: 15 * 60 * 1000 // 15 menit
        });

        collector.on("collect", async i => {
            if (i.user.id !== interaction.user.id) {
                return i.reply({ content: "❌ You cannot use these buttons.", ephemeral: true });
            }

            if (i.customId === "prev") {
                page = (page === 0) ? categoryNames.length - 1 : page - 1;
                await i.update({ embeds: [generateEmbed(page)] });
            } 
            else if (i.customId === "next") {
                page = (page + 1) % categoryNames.length;
                await i.update({ embeds: [generateEmbed(page)] });
            } 
            else if (i.customId === "showall") {
                const allCmds = [];
                for (const cat of categoryNames) {
                    allCmds.push(`**${cat}**\n${categories[cat].map(c => `\`${c}\``).join(", ")}`);
                }

                const embedAll = new EmbedBuilder()
                    .setTitle("All Commands")
                    .setDescription(allCmds.join("\n\n"))
                    .setColor(0x2f3136)
                    .setFooter({ text: "Zephyr Bot", iconURL: client.user.displayAvatarURL() });

                await i.update({ embeds: [embedAll], components: [] });
            }
        });

        collector.on("end", async () => {
            if (!helpMessage.deleted) {
                const disabledRow = new ActionRowBuilder()
                    .addComponents(
                        row.components.map(button => button.setDisabled(true))
                    );
                await interaction.editReply({ components: [disabledRow] });
            }
        });
    }
};
