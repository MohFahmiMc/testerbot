const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("serverinfo")
        .setDescription("Show detailed information about this server."),

    async execute(interaction) {

        const { guild } = interaction;

        const created = `<t:${Math.floor(guild.createdTimestamp / 1000)}:R>`;
        const banner = guild.bannerURL({ size: 1024 });

        const embed = new EmbedBuilder()
            .setColor("#1e1f22") // dark elegant like about.js
            .setAuthor({
                name: `${guild.name} — Server Information`,
                iconURL: guild.iconURL({ size: 256 })
            })
            .setThumbnail(guild.iconURL({ size: 256 }))
            .addFields(
                {
                    name: "Name",
                    value: guild.name,
                    inline: true
                },
                {
                    name: "Server ID",
                    value: guild.id,
                    inline: true
                },
                {
                    name: "Owner",
                    value: `<@${guild.ownerId}>`,
                    inline: true
                },
                {
                    name: "Members",
                    value: `${guild.memberCount}`,
                    inline: true
                },
                {
                    name: "Channels",
                    value: `${guild.channels.cache.size}`,
                    inline: true
                },
                {
                    name: "Roles",
                    value: `${guild.roles.cache.size}`,
                    inline: true
                },
                {
                    name: "Boost Level",
                    value: guild.premiumTier ? `Level ${guild.premiumTier}` : "None",
                    inline: true
                },
                {
                    name: "Created",
                    value: created,
                    inline: true
                },
                {
                    name: "Banner",
                    value: banner ? `[Click to view](${banner})` : "No banner uploaded",
                    inline: false
                }
            )
            .setFooter({
                text: `Requested by ${interaction.user.username}`,
                iconURL: interaction.user.displayAvatarURL()
            })
            .setTimestamp();

        await interaction.reply({ embeds: [embed] });
    }
};
