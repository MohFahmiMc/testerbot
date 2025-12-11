const {
    SlashCommandBuilder,
    EmbedBuilder
} = require("discord.js");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("timestamp")
        .setDescription("Generate a Discord timestamp format.")
        .addStringOption(option =>
            option.setName("date")
                .setDescription("Enter date (YYYY-MM-DD)")
                .setRequired(true)
        )
        .addStringOption(option =>
            option.setName("time")
                .setDescription("Enter time (HH:MM, 24h format)")
                .setRequired(true)
        )
        .addStringOption(option =>
            option.setName("format")
                .setDescription("Choose timestamp format")
                .addChoices(
                    { name: "Short Time (t)", value: "t" },
                    { name: "Long Time (T)", value: "T" },
                    { name: "Short Date (d)", value: "d" },
                    { name: "Long Date (D)", value: "D" },
                    { name: "Short Date & Time (f)", value: "f" },
                    { name: "Long Date & Time (F)", value: "F" },
                    { name: "Relative Time (R)", value: "R" }
                )
                .setRequired(true)
        ),

    async execute(interaction) {
        const date = interaction.options.getString("date");    // YYYY-MM-DD
        const time = interaction.options.getString("time");    // HH:MM
        const format = interaction.options.getString("format"); // t,d,f,R etc.

        // Convert to UNIX timestamp
        const fullString = `${date} ${time}`;
        const unix = Math.floor(new Date(fullString).getTime() / 1000);

        if (!unix || isNaN(unix)) {
            return interaction.reply({
                content: "❌ Invalid date or time format.",
                ephemeral: true
            });
        }

        const timestamp = `<t:${unix}:${format}>`;

        const embed = new EmbedBuilder()
            .setColor(0x2b2d31)
            .setTitle("⏱ Discord Timestamp Generator")
            .setDescription(
                `**Generated Timestamp:**\n\`\`\`${timestamp}\`\`\`\n` +
                `**Preview:** ${timestamp}\n\n` +
                `**Input:**\n- Date: **${date}**\n- Time: **${time}**\n- Format: **${format}**`
            )
            .setFooter({
                text: interaction.client.user.username,
                iconURL: interaction.client.user.displayAvatarURL()
            })
            .setTimestamp();

        await interaction.reply({ embeds: [embed] });
    }
};
