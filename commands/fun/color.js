const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");

const COLORS = {
    red: "#FF0000",
    green: "#00FF00",
    blue: "#0000FF",
    yellow: "#FFFF00",
    purple: "#800080",
    pink: "#FFC0CB",
    orange: "#FFA500",
    cyan: "#00FFFF",
    random: () => `#${Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0')}`
};

function capitalize(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
}

module.exports = {
    data: new SlashCommandBuilder()
        .setName("color")
        .setDescription("Pick a color and see its hex code.")
        .addStringOption(option =>
            option.setName("color")
                .setDescription("Choose a color")
                .setRequired(true)
                .addChoices(
                    { name: "Red", value: "red" },
                    { name: "Green", value: "green" },
                    { name: "Blue", value: "blue" },
                    { name: "Yellow", value: "yellow" },
                    { name: "Purple", value: "purple" },
                    { name: "Pink", value: "pink" },
                    { name: "Orange", value: "orange" },
                    { name: "Cyan", value: "cyan" },
                    { name: "Random", value: "random" }
                )
        ),

    async execute(interaction) {
        const colorName = interaction.options.getString("color");
        const hexCode = colorName === "random" ? COLORS.random() : COLORS[colorName];

        const embed = new EmbedBuilder()
            .setTitle(`${capitalize(colorName)} Color`)
            .setDescription(`Hex code: \`${hexCode}\``)
            .setColor(hexCode)
            .setThumbnail("https://upload.wikimedia.org/wikipedia/commons/thumb/1/14/Color_icon_blue.svg/120px-Color_icon_blue.svg.png") // optional
            .setFooter({ text: `Color Picker | Requested by ${interaction.user.username}`, iconURL: interaction.user.displayAvatarURL() })
            .setTimestamp();

        await interaction.reply({ embeds: [embed] });
    }
};
