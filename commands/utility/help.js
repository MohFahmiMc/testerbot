const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require("discord.js");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("help")
        .setDescription("Show all commands with pagination"),

    async execute(interaction) {
        const commands = interaction.client.commands.map(cmd => ({
            name: cmd.data.name,
            description: cmd.data.description || "No description"
        }));

        const pageSize = 5; // Jumlah command per page
        let page = 0;

        const generateEmbed = (page) => {
            const embed = new EmbedBuilder()
                .setTitle("Bot Commands")
                .setColor("#00FFFF")
                .setFooter({ text: `Page ${page + 1} of ${Math.ceil(commands.length / pageSize)}` });

            const start = page * pageSize;
            const current = commands.slice(start, start + pageSize);

            current.forEach(cmd => {
                embed.addFields({ name: `/${cmd.name}`, value: cmd.description });
            });

            return embed;
        };

        const row = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setCustomId("prev")
                .setLabel("⬅ Previous")
                .setStyle(ButtonStyle.Primary)
                .setDisabled(page === 0),
            new ButtonBuilder()
                .setCustomId("next")
                .setLabel("Next ➡")
                .setStyle(ButtonStyle.Primary)
                .setDisabled(commands.length <= pageSize)
        );

        const msg = await interaction.reply({ embeds: [generateEmbed(page)], components: [row], fetchReply: true });

        const collector = msg.createMessageComponentCollector({ time: 60000 });

        collector.on("collect", i => {
            if (i.user.id !== interaction.user.id) return i.reply({ content: "You can't control this.", ephemeral: true });

            if (i.customId === "next") page++;
            if (i.customId === "prev") page--;

            i.update({
                embeds: [generateEmbed(page)],
                components: [
                    new ActionRowBuilder().addComponents(
                        new ButtonBuilder()
                            .setCustomId("prev")
                            .setLabel("⬅ Previous")
                            .setStyle(ButtonStyle.Primary)
                            .setDisabled(page === 0),
                        new ButtonBuilder()
                            .setCustomId("next")
                            .setLabel("Next ➡")
                            .setStyle(ButtonStyle.Primary)
                            .setDisabled(page >= Math.ceil(commands.length / pageSize) - 1)
                    )
                ]
            });
        });

        collector.on("end", () => {
            interaction.editReply({ components: [] }).catch(() => {});
        });
    }
};
