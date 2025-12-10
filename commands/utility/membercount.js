const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("membercount")
        .setDescription("Shows detailed member statistics of the server."),

    async execute(interaction) {
        const guild = interaction.guild;

        const totalMembers = guild.memberCount;
        const bots = guild.members.cache.filter(m => m.user.bot).size;
        const humans = totalMembers - bots;

        // Emoji Set mengikuti about.js
        const E = {
            title: "<:premium_crown:1357260010303918090>",
            total: "<:utility12:1357261389399593004>",
            humans: "<:utility1:1357261562938790050>",
            bots: "<:discord:1447855769000218724>"
        };

        const embed = new EmbedBuilder()
            .setColor(0x2b2d31)
            .setThumbnail(guild.iconURL({ size: 512 }))
            .setTitle(`${E.title} Member Statistics`)
            .setDescription(`Here is the current member statistics for **${guild.name}**.`)
            .addFields(
                {
                    name: `${E.total} Total Members`,
                    value: `${totalMembers}`,
                    inline: true
                },
                {
                    name: `${E.humans} Humans`,
                    value: `${humans}`,
                    inline: true
                },
                {
                    name: `${E.bots} Bots`,
                    value: `${bots}`,
                    inline: true
                }
            )
            .setFooter({
                text: `${guild.name} • Member Count`,
                iconURL: guild.iconURL()
            })
            .setTimestamp();

        await interaction.reply({ embeds: [embed] });
    }
};
