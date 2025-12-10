const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("serverstats")
        .setDescription("Displays detailed information about this server."),

    async execute(interaction) {
        const guild = interaction.guild;

        // Emoji set (match about.js)
        const E = {
            title: "<:premium_crown:1357260010303918090>",
            owner: "<a:Developer1:1357261458014212116>",
            members: "<:utility1:1357261562938790050>",
            boosts: "<:utility12:1357261389399593004>",
            channels: "<:Utility1:1357261430684123218>",
            roles: "<:utility1:1357261562938790050>",
            created: "<:blueutility4:1357261525387182251>",
            region: "<:discord:1447855769000218724>",
        };

        // Fetch data
        const owner = await guild.fetchOwner();
        const boostCount = guild.premiumSubscriptionCount;
        const boostLevel = guild.premiumTier;
        const roleCount = guild.roles.cache.size;
        const memberCount = guild.memberCount;

        // Channels
        const channels = guild.channels.cache;
        const textChannels = channels.filter(c => c.type === 0).size;
        const voiceChannels = channels.filter(c => c.type === 2).size;
        const threadChannels = channels.filter(c => c.isThread()).size;

        // Timestamps
        const createdTimestamp = Math.floor(guild.createdTimestamp / 1000);
        const createdAt = `<t:${createdTimestamp}:F>`;
        const createdAgo = `<t:${createdTimestamp}:R>`;

        // Region
        const region = guild.preferredLocale
            .replace(/-/g, " ")
            .toUpperCase();

        // Embed premium style
        const embed = new EmbedBuilder()
            .setColor(0x2b2d31)
            .setThumbnail(guild.iconURL({ size: 1024 }))
            .setTitle(`${E.title} Server Statistics — ${guild.name}`)
            .setDescription(`Detailed information about **${guild.name}**.\nModern, clean, and organized.`)
            .addFields(
                {
                    name: `${E.owner} Server Owner`,
                    value: `${owner} (\`${owner.user.tag}\`)`,
                    inline: true
                },
                {
                    name: `${E.members} Members`,
                    value: `${memberCount}`,
                    inline: true
                },
                {
                    name: `${E.boosts} Server Boost`,
                    value: `Level **${boostLevel}**\nBoosts: **${boostCount}**`,
                    inline: true
                },
                {
                    name: `${E.channels} Channels`,
                    value:
                        `📝 Text: **${textChannels}**\n` +
                        `🔊 Voice: **${voiceChannels}**\n` +
                        `#️⃣ Threads: **${threadChannels}**`,
                    inline: true
                },
                {
                    name: `${E.roles} Total Roles`,
                    value: `${roleCount}`,
                    inline: true
                },
                {
                    name: `${E.created} Created`,
                    value: `${createdAt}\n(${createdAgo})`,
                    inline: true
                },
                {
                    name: `${E.region} Region`,
                    value: `${region}`,
                    inline: true
                }
            )
            .setFooter({
                text: `${guild.name} • Server Information`,
                iconURL: guild.iconURL()
            })
            .setTimestamp();

        await interaction.reply({ embeds: [embed] });
    },
};
