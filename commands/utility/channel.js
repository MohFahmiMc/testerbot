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

        // Emoji Set (mengikuti style about.js)
        const E = {
            title: "<:premium_crown:1357260010303918090>",
            name: "<:utility1:1357261562938790050>",
            id: "<:blueutility4:1357261525387182251>",
            type: "<:Utility1:1357261430684123218>",
            created: "<:discord:1447855769000218724>",
        };

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

        const createdAt = Math.floor(channel.createdTimestamp / 1000);

        const embed = new EmbedBuilder()
            .setColor(0x2b2d31)
            .setThumbnail(interaction.guild.iconURL({ size: 512 }))
            .setTitle(`${E.title} Channel Information — #${channel.name}`)
            .setDescription(`Here is detailed information about **#${channel.name}**.`)
            .addFields(
                {
                    name: `${E.name} Channel Name`,
                    value: channel.name || "N/A",
                    inline: true
                },
                {
                    name: `${E.id} Channel ID`,
                    value: channel.id,
                    inline: true
                },
                {
                    name: `${E.type} Channel Type`,
                    value: channelTypeText[channel.type] || "Unknown",
                    inline: true
                },
                {
                    name: `${E.created} Created At`,
                    value: `<t:${createdAt}:F>\n(<t:${createdAt}:R>)`,
                    inline: true
                },
            )
            .setFooter({
                text: `${interaction.guild.name} • Channel Information`,
                iconURL: interaction.guild.iconURL()
            })
            .setTimestamp();

        await interaction.reply({ embeds: [embed] });
    }
};
