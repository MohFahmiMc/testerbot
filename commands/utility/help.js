const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, ComponentType } = require("discord.js");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("help")
        .setDescription("Show all available commands."),

    async execute(interaction) {
        const commands = interaction.client.commands.map(cmd => `**/${cmd.data.name}** - ${cmd.data.description || "No description"}`);

        const pageSize = 10; // jumlah command per halaman
        const pages = [];
        for (let i = 0; i < commands.length; i += pageSize) {
            pages.push(commands.slice(i, i + pageSize));
        }

        let currentPage = 0;

        const embed = new EmbedBuilder()
            .setTitle("Command List")
            .setDescription(pages[currentPage].join("\n"))
            .setColor("Gray");

        const row = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setCustomId("prev")
                .setLabel("⬅️ Prev")
                .setStyle(ButtonStyle.Primary),
            new ButtonBuilder()
                .setCustomId("next")
                .setLabel("Next ➡️")
                .setStyle(ButtonStyle.Primary),
            new ButtonBuilder()
                .setCustomId("all")
                .setLabel("Show All")
                .setStyle(ButtonStyle.Secondary)
        );

        const message = await interaction.reply({ embeds: [embed], components: [row], fetchReply: true, ephemeral: true });

        const collector = message.createMessageComponentCollector({ componentType: ComponentType.Button, time: 60000 });

        collector.on("collect", i => {
            if (i.user.id !== interaction.user.id) return i.reply({ content: "You can't use this button!", ephemeral: true });

            if (i.customId === "prev") {
                currentPage = (currentPage === 0) ? pages.length - 1 : currentPage - 1;
                embed.setDescription(pages[currentPage].join("\n"));
                i.update({ embeds: [embed] });
            } else if (i.customId === "next") {
                currentPage = (currentPage + 1) % pages.length;
                embed.setDescription(pages[currentPage].join("\n"));
                i.update({ embeds: [embed] });
            } else if (i.customId === "all") {
                embed.setDescription(commands.join("\n"));
                i.update({ embeds: [embed] });
            }
        });

        collector.on("end", () => {
            // matikan tombol setelah 60 detik
            const disabledRow = new ActionRowBuilder().addComponents(
                row.components.map(btn => btn.setDisabled(true))
            );
            message.edit({ components: [disabledRow] }).catch(() => {});
        });
    }
};
