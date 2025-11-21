const {
    SlashCommandBuilder,
    EmbedBuilder,
    ChannelType
} = require("discord.js");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("channel")
        .setDescription("Show detailed information about a channel.")
        .addChannelOption(option =>
            option
                .setName("target")
                .setDescription("Select a channel to inspect")
                .setRequired(false)
        ),

    async execute(interaction) {
        const channel = interaction.options.getChannel("target") || interaction.channel;

        const channelTypeText = {
            [ChannelType.GuildText]: "Text Channel",
            [ChannelType.GuildVoice]: "Voice Channel",
            [ChannelType.GuildCategory]: "Category",
            [ChannelType.GuildAnnouncement]: "Announcement Channel",
            [ChannelType.AnnouncementThread]: "Announcement Thread",
            [ChannelType.PublicThread]: "Public Thread",
            [ChannelType.PrivateThread]: "Private Thread",
            [ChannelType.GuildStageVoice]: "Stage Channel",
            [ChannelType.GuildForum]: "Forum"
        };

        const embed = new EmbedBuilder()
            .setTitle("Channel Information")
            .setColor("#4A90E2")
            .addFields(
                {
                    name: "Name",
                    value: channel.name || "N/A",
                    inline: true
                },
                {
                    name: "ID",
                    value: channel.id,
                    inline: true
                },
                {
                    name: "Type",
                    value: channelTypeText[channel.type] || "Unknown",
                    inline: true
                },
                {
                    name: "Created At",
                    value: `<t:${Math.floor(channel.createdTimestamp / 1000)}:F>`,
                    inline: true
                }
            )
            .setFooter({ text: interaction.guild.name })
            .setTimestamp();

        await interaction.reply({ embeds: [embed] });
    }
};
