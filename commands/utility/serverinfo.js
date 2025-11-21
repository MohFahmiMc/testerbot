const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("serverinfo")
        .setDescription("Show detailed information about this server."),

    async execute(interaction) {

        const { guild } = interaction;

        const created = `<t:${Math.floor(guild.createdTimestamp / 1000)}:R>`;
        const boostTier = guild.premiumTier ? `Level ${guild.premiumTier}` : "No Boost";
        const banner = guild.bannerURL({ size: 1024 }) ?? "No banner";

        const embed = new EmbedBuilder()
            .setColor("#3399ff")
            .setTitle("📘 Server Information")
            .setThumbnail(guild.iconURL({ size: 256 }))
            .addFields(
                {
                    name: "🏷️ Name",
                    value: guild.name,
                    inline: true
                },
                {
                    name: "🆔 Server ID",
                    value: `${guild.id}`,
                    inline: true
                },
                {
                    name: "👑 Owner",
                    value: `<@${guild.ownerId}>`,
                    inline: true
                },
                {
                    name: "👥 Members",
                    value: `${guild.memberCount}`,
                    inline: true
                },
                {
                    name: "💬 Channels",
                    value: `${guild.channels.cache.size}`,
                    inline: true
                },
                {
                    name: "🔐 Roles",
                    value: `${guild.roles.cache.size}`,
                    inline: true
                },
                {
                    name: "🚀 Boost Status",
                    value: `${boostTier}`,
                    inline: true
                },
                {
                    name: "📅 Created",
                    value: created,
                    inline: true
                },
                {
                    name: "🖼️ Banner",
                    value: banner === "No banner" ? "No banner" : "[View Banner](" + banner + ")",
                    inline: false
                }
            )
            .setFooter({ text: guild.name })
            .setTimestamp();

        await interaction.reply({ embeds: [embed] });
    }
};
