const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require("discord.js");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("color")
        .setDescription("Pick a color and show its hex code."),

    async execute(interaction) {
        const colors = [
            { label: "Red", value: "#FF0000" },
            { label: "Green", value: "#00FF00" },
            { label: "Blue", value: "#0000FF" },
            { label: "Random", value: `#${Math.floor(Math.random()*16777215).toString(16).padStart(6,'0')}` }
        ];

        const buttons = new ActionRowBuilder();
        colors.forEach(c => {
            buttons.addComponents(new ButtonBuilder()
                .setCustomId(c.value)
                .setLabel(c.label)
                .setStyle(ButtonStyle.Primary));
        });

        const embed = new EmbedBuilder()
            .setTitle("Color Picker")
            .setDescription("Click a button to see the color.")
            .setColor("#ffffff");

        const msg = await interaction.reply({ embeds: [embed], components: [buttons], fetchReply: true });

        const collector = msg.createMessageComponentCollector({ time: 60000 });
        collector.on("collect", i => {
            const colorHex = i.customId;
            const colorEmbed = new EmbedBuilder()
                .setTitle(`Selected Color: ${colorHex}`)
                .setColor(colorHex)
                .setDescription(`Hex code: \`${colorHex}\``);
            i.update({ embeds: [colorEmbed] });
        });
    }
};
