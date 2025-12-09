const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("serverstats")
        .setDescription("Shows advanced and detailed server statistics"),

    async execute(interaction) {
        const guild = interaction.guild;
        await interaction.deferReply();

        const owner = await guild.fetchOwner();

        // BASIC SERVER DATA
        const totalMembers = guild.memberCount;
        const botCount = guild.members.cache.filter(m => m.user.bot).size;
        const humanCount = totalMembers - botCount;

        const textChannels = guild.channels.cache.filter(c => c.type === 0).size;
        const voiceChannels = guild.channels.cache.filter(c => c.type === 2).size;
        const categories = guild.channels.cache.filter(c => c.type === 4).size;

        const roles = guild.roles.cache.size;

        const emojiCount = guild.emojis.cache.size;
        const stickerCount = guild.stickers.cache.size;

        const boosts = guild.premiumSubscriptionCount;
        const boostTier = guild.premiumTier;

        const createdAt = `<t:${Math.floor(guild.createdTimestamp / 1000)}:R>`;

        // EXTRA FEATURES
        const afkChannel = guild.afkChannel ? `<#${guild.afkChannelId}>` : "None";
        const afkTimeout = guild.afkTimeout ? `${guild.afkTimeout}s` : "None";

        const banner = guild.bannerURL({ size: 1024 }) || "No banner";
        const vanity = guild.vanityURLCode ? `https://discord.gg/${guild.vanityURLCode}` : "None";

        const verification = guild.verificationLevel;
        const nsfwLevel = guild.nsfwLevel;
        const locale = guild.preferredLocale;

        // EMBED
        const embed = new EmbedBuilder()
            .setColor("#4A90E2")
            .setTitle(`<:utility8:1357261385947418644> Server Statistics`)
            .setThumbnail(guild.iconURL({ size: 1024 }))
            .addFields(
                // BASIC
                { name: "📛 Server Name", value: guild.name, inline: false },
                { name: "👑 Owner", value: `${owner.user.tag}`, inline: true },
                { name: "📆 Created", value: createdAt, inline: true },

                // MEMBERS
                {
                    name: "<:people:1447855732061110406> Members",
                    value:
                    `Total: **${totalMembers}**\n` +
                    `Humans: **${humanCount}**\n` +
                    `Bots: **${botCount}**`,
                    inline: true
                },

                // CHANNELS
                {
                    name: "<:box:1447855781205512245> Channels",
                    value:
                    `Text: **${textChannels}**\n` +
                    `Voice: **${voiceChannels}**\n` +
                    `Categories: **${categories}**`,
                    inline: true
                },

                // ROLES
                {
                    name: "<:management:1447855811425468446> Roles",
                    value: `**${roles}** total`,
                    inline: true
                },

                // BOOST
                {
                    name: "<a:vip:1447855725907804222> Boost",
                    value:
                    `Boosts: **${boosts}**\n` +
                    `Tier: **${boostTier}**`,
                    inline: true
                },

                // MEDIA
                {
                    name: "<:blueutility4:1357261525387182251> Media",
                    value:
                    `Emojis: **${emojiCount}**\n` +
                    `Stickers: **${stickerCount}**`,
                    inline: true
                },

                // AFK
                {
                    name: "💤 AFK Settings",
                    value:
                    `Channel: ${afkChannel}\n` +
                    `Timeout: **${afkTimeout}**`,
                    inline: true
                },

                // EXTRA SERVER SETTINGS
                {
                    name: "⚙️ Server Settings",
                    value:
                    `Verification: **${verification}**\n` +
                    `NSFW Level: **${nsfwLevel}**\n` +
                    `Locale: **${locale}**`,
                    inline: true
                },

                // VANITY + BANNER
                {
                    name: "🔗 Vanity URL",
                    value: `${vanity}`,
                    inline: false
                },
                {
                    name: "🖼️ Banner",
                    value: banner === "No banner" ? "No banner" : "[Click to view banner](" + banner + ")",
                    inline: false
                }
            )
            .setFooter({
                text: `Requested by ${interaction.user.tag}`,
                iconURL: interaction.user.displayAvatarURL()
            })
            .setTimestamp();

        return interaction.editReply({ embeds: [embed] });
    }
};
