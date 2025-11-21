const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("serverstats")
        .setDescription("Shows detailed statistics about the server"),

    async execute(interaction) {
        const guild = interaction.guild;

        await interaction.deferReply();

        // SERVER DATA
        const totalMembers = guild.memberCount;
        const botCount = guild.members.cache.filter(m => m.user.bot).size;
        const humanCount = totalMembers - botCount;

        const textChannels = guild.channels.cache.filter(c => c.type === 0).size;
        const voiceChannels = guild.channels.cache.filter(c => c.type === 2).size;
        const categories = guild.channels.cache.filter(c => c.type === 4).size;

        const roles = guild.roles.cache.size;

        const createdAt = `<t:${Math.floor(guild.createdTimestamp / 1000)}:R>`;

        const boosts = guild.premiumSubscriptionCount;
        const boostTier = guild.premiumTier;

        const owner = await guild.fetchOwner();

        // EMBED
        const embed = new EmbedBuilder()
            .setTitle("SERVER STATISTICS")
            .setColor("#4A90E2")
            .setThumbnail(guild.iconURL({ size: 1024 }))
            .addFields(
                { name: "Server Name", value: guild.name, inline: false },
                { name: "Owner", value: `${owner.user.tag}`, inline: false },
                { name: "Created", value: createdAt, inline: false },

                { name: "Members", value: 
                    `Total: ${totalMembers}\n` +
                    `Humans: ${humanCount}\n` +
                    `Bots: ${botCount}`, inline: true },

                { name: "Channels", value: 
                    `Text: ${textChannels}\n` +
                    `Voice: ${voiceChannels}\n` +
                    `Categories: ${categories}`, inline: true },

                { name: "Roles", value: `${roles}`, inline: true },

                { name: "Boost Status", value: 
                    `Boosts: ${boosts}\nTier: ${boostTier}`, inline: true }
            )
            .setFooter({ text: guild.name })
            .setTimestamp();

        return interaction.editReply({ embeds: [embed] });
    }
};
