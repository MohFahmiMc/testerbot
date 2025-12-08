const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require("discord.js");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("slowmode")
        .setDescription("Set or disable slowmode for this channel.")
        .addIntegerOption(opt =>
            opt.setName("seconds")
                .setDescription("Slowmode duration in seconds (0 to disable). Max 21600.")
                .setRequired(true)
        )
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels),

    async execute(interaction) {
        const seconds = interaction.options.getInteger("seconds");
        const channel = interaction.channel;

        if (seconds < 0 || seconds > 21600) {
            return interaction.reply({
                content: "❌ Slowmode must be between **0 – 21600 seconds**.",
                ephemeral: true
            });
        }

        await channel.setRateLimitPerUser(seconds);

        const embed = new EmbedBuilder()
            .setColor("#3399ff")
            .setTitle("⏳ Slowmode Updated")
            .setThumbnail(interaction.guild.iconURL({ size: 256 }))
            .addFields(
                {
                    name: "📌 Channel",
                    value: `${channel}`,
                    inline: true
                },
                {
                    name: "⏱️ Duration",
                    value: seconds === 0 ? "Disabled" : `${seconds} seconds`,
                    inline: true
                }
            )
            .setFooter({ text: interaction.guild.name })
            .setTimestamp();

        await interaction.reply({ embeds: [embed] });
    }
};
