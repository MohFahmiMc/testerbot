const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require("discord.js");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("slowmode")
        .setDescription("Set or disable slowmode for this channel.")
        .addIntegerOption(opt =>
            opt.setName("seconds")
                .setDescription("Slowmode duration in seconds (0 to disable). Maximum 21600.")
                .setRequired(true)
        )
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels),

    async execute(interaction) {
        const seconds = interaction.options.getInteger("seconds");
        const channel = interaction.channel;

        // Validation
        if (seconds < 0 || seconds > 21600) {
            return interaction.reply({
                content: "<:utility8:1357261385947418644> Slowmode must be between **0 – 21600 seconds**.",
                ephemeral: true
            });
        }

        try {
            await channel.setRateLimitPerUser(seconds);

            const embed = new EmbedBuilder()
                .setColor("#2b2d31") // dark premium
                .setAuthor({
                    name: "Slowmode Updated",
                    iconURL: interaction.guild.iconURL({ size: 256 })
                })
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
                .setFooter({
                    text: `Requested by ${interaction.user.tag}`,
                    iconURL: interaction.user.displayAvatarURL({ size: 256 })
                })
                .setTimestamp();

            await interaction.reply({ embeds: [embed] });

        } catch (err) {
            console.error(err);

            return interaction.reply({
                content: "<:utility8:1357261385947418644> Failed to update slowmode.",
                ephemeral: true
            });
        }
    }
};
