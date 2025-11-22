const { SlashCommandBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder, ComponentType } = require("discord.js");

const COLORS = [
    { name: "Blue", hex: "#3498db", style: ButtonStyle.Primary },
    { name: "Red", hex: "#e74c3c", style: ButtonStyle.Danger },
    { name: "Green", hex: "#2ecc71", style: ButtonStyle.Success },
    { name: "Yellow", hex: "#f1c40f", style: ButtonStyle.Secondary },
    { name: "Purple", hex: "#9b59b6", style: ButtonStyle.Primary },
];

module.exports = {
    data: new SlashCommandBuilder()
        .setName("color")
        .setDescription("Select a color to show an embed with that color."),

    async execute(interaction) {
        const row = new ActionRowBuilder();

        COLORS.forEach(color => {
            row.addComponents(
                new ButtonBuilder()
                    .setCustomId(color.name)
                    .setLabel(color.name)
                    .setStyle(color.style)
            );
        });

        await interaction.reply({
            content: "Select a color:",
            components: [row],
            ephemeral: true
        });

        const filter = i => COLORS.map(c => c.name).includes(i.customId) && i.user.id === interaction.user.id;
        const collector = interaction.channel.createMessageComponentCollector({ filter, componentType: ComponentType.Button, time: 60000 });

        collector.on("collect", async i => {
            const selected = COLORS.find(c => c.name === i.customId);
            if (!selected) return;

            const embed = new EmbedBuilder()
                .setTitle(`${selected.name} Color`)
                .setDescription(`Hex code: \`${selected.hex}\``)
                .setColor(selected.hex)
                .setImage(`https://singlecolorimage.com/get/${selected.hex.replace("#","")}/400x100`)
                .setFooter({ text: `Color selected by ${interaction.user.tag}`, iconURL: interaction.user.displayAvatarURL() });

            await i.update({ content: "Here is your color embed:", embeds: [embed], components: [] });
            collector.stop();
        });

        collector.on("end", collected => {
            if (collected.size === 0) {
                interaction.editReply({ content: "No color was selected.", components: [] }).catch(() => {});
            }
        });
    }
};
