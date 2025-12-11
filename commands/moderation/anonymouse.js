const {
    SlashCommandBuilder,
    PermissionFlagsBits,
    EmbedBuilder,
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    ModalBuilder,
    TextInputBuilder,
    TextInputStyle
} = require("discord.js");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("setup-anonymous")
        .setDescription("Setup the anonymous chat system.")
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

    async execute(interaction) {
        await interaction.deferReply({ ephemeral: true });

        // Check if channel already exists
        let anonChannel = interaction.guild.channels.cache.find(
            ch => ch.name === "anonymous-chat"
        );

        if (!anonChannel) {
            anonChannel = await interaction.guild.channels.create({
                name: "anonymous-chat",
                type: 0, // Text
                permissionOverwrites: [
                    {
                        id: interaction.guild.roles.everyone.id,
                        allow: ["ViewChannel", "SendMessages", "ReadMessageHistory"]
                    }
                ]
            });
        }

        // Embed setup
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

        await anonChannel.send({ embeds: [setupEmbed], components: [row] });

        await interaction.editReply({
            content: `Anonymous system has been set up in ${anonChannel}.`
        });
    }
};
