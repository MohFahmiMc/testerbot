const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("membercount")
        .setDescription("Shows total member count of the server."),

    async execute(interaction) {
        const { guild } = interaction;

        const totalMembers = guild.memberCount;
        const bots = guild.members.cache.filter(m => m.user.bot).size;
        const humans = totalMembers - bots;

        const embed = new EmbedBuilder()
            .setColor("#3498db")
            .setTitle("📊 Server Member Count")
            .setThumbnail(guild.iconURL({ size: 256 }))
            .addFields(
                { name: "👥 Total Members", value: `${totalMembers}`, inline: true },
                { name: "🧑 Humans", value: `${humans}`, inline: true },
                { name: "🤖 Bots", value: `${bots}`, inline: true }
            )
            .setFooter({ text: guild.name })
            .setTimestamp();

        await interaction.reply({ embeds: [embed] });
    }
};
