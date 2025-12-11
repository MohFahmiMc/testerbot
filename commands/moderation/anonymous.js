const {
    SlashCommandBuilder,
    PermissionFlagsBits,
    EmbedBuilder,
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle
} = require("discord.js");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("setup-anonymous")
        .setDescription("Setup the anonymous chat system.")
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

    async execute(interaction) {
        await interaction.deferReply({ ephemeral: true });

        let anonChannel = interaction.guild.channels.cache.find(
            ch => ch.name === "anonymous-chat"
        );

        // Create channel if not exists
        if (!anonChannel) {
            try {
                anonChannel = await interaction.guild.channels.create({
                    name: "anonymous-chat",
                    type: 0, // Text channel
                    permissionOverwrites: [
                        {
                            id: interaction.guild.roles.everyone.id,
                            allow: [
                                PermissionFlagsBits.ViewChannel,
                                PermissionFlagsBits.SendMessages,
                                PermissionFlagsBits.ReadMessageHistory
                            ]
                        }
                    ]
                });
            } catch (err) {
                console.error(err);
                return interaction.editReply({
                    content: "❌ Failed to create anonymous-chat channel. Check bot permissions."
                });
            }
        }

        // Create embed + button
        const setupEmbed = new EmbedBuilder()
            .setColor(0x2b2d31)
            .setTitle("🔒 Anonymous Chat System")
            .setDescription(
                "Click the button below to create an anonymous message.\n" +
                "Your identity will remain **hidden**."
            )
            .setTimestamp()
            .setFooter({
                text: interaction.client.user.username,
                iconURL: interaction.client.user.displayAvatarURL()
            });

        const row = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setCustomId("anon_create")
                .setLabel("Create Anonymous Chat")
                .setStyle(ButtonStyle.Secondary)
        );

        // Send to channel with error handling
        try {
            await anonChannel.send({ embeds: [setupEmbed], components: [row] });
        } catch (err) {
            console.error(err);
            return interaction.editReply({
                content: "❌ Cannot send anonymous chat panel. Bot might lack permissions."
            });
        }

        await interaction.editReply({
            content: `Anonymous system has been set up in <#${anonChannel.id}>.`
        });
    }
};
