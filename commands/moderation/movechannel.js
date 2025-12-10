const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require("discord.js");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("movechannel")
        .setDescription("Move a channel or category to a new position.")
        .addChannelOption(option =>
            option.setName("channel")
                .setDescription("Select the channel or category to move")
                .setRequired(true)
        )
        .addIntegerOption(option =>
            option.setName("position")
                .setDescription("New position (1 = top)")
                .setRequired(true)
        )
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels),

    async execute(interaction) {
        const channel = interaction.options.getChannel("channel");
        const position = interaction.options.getInteger("position");

        // Emoji theme
        const E = {
            move: "<:Utility1:1357261430684123218>",
            done: "<:premium_crown:1357260010303918090>",
            error: "❌",
        };

        if (!channel) {
            return interaction.reply({
                content: `${E.error} Invalid channel.`,
                ephemeral: true
            });
        }

        try {
            // Discord position index dimulai dari 0
            await channel.setPosition(position - 1);

            const embed = new EmbedBuilder()
                .setColor(0x2b2d31)
                .setTitle(`${E.move} Channel Moved`)
                .setDescription(
                    `${E.done} Successfully moved **${channel.name}** to position **${position}**.`
                )
                .addFields(
                    {
                        name: "📁 Type",
                        value: channel.type === 4 ? "Category" : "Channel",
                        inline: true
                    },
                    {
                        name: "📌 New Position",
                        value: `${position}`,
                        inline: true
                    }
                )
                .setFooter({
                    text: `Requested by ${interaction.user.tag}`,
                    iconURL: interaction.user.displayAvatarURL()
                })
                .setTimestamp();

            return interaction.reply({ embeds: [embed] });

        } catch (error) {
            console.error(error);
            return interaction.reply({
                content: `${E.error} Failed to move channel: **${error.message}**`,
                ephemeral: true
            });
        }
    }
};
