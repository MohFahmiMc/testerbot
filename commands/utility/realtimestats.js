const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");

const OWNER_ID = process.env.OWNER_ID;

module.exports = {
    data: new SlashCommandBuilder()
        .setName("realtimestats")
        .setDescription("Show live real-time stats of this server (Premium only)."),
    async execute(interaction) {
        if (interaction.user.id !== OWNER_ID) {
            return interaction.reply({ content: "❌ You cannot use this command.", ephemeral: true });
        }

        const server = interaction.guild;

        // Colors rainbow
        const rainbowColors = [0xff0000,0xff7f00,0xffff00,0x00ff00,0x0000ff,0x4b0082,0x9400d3];
        let colorIndex = 0;

        // Send initial embed
        const embed = new EmbedBuilder()
            .setTitle(`📊 Real-Time Stats: ${server.name}`)
            .setColor(rainbowColors[colorIndex])
            .setThumbnail(server.iconURL({ dynamic: true }))
            .addFields(
                { name: "Members", value: `${server.memberCount}`, inline: true },
                { name: "Humans", value: `${server.members.cache.filter(m => !m.user.bot).size}`, inline: true },
                { name: "Bots", value: `${server.members.cache.filter(m => m.user.bot).size}`, inline: true },
                { name: "Channels", value: `${server.channels.cache.size}`, inline: true },
                { name: "Server Created", value: `<t:${Math.floor(server.createdTimestamp/1000)}:R>`, inline: true }
            )
            .setFooter({ text: interaction.client.user.username, iconURL: interaction.client.user.displayAvatarURL({ dynamic: true }) })
            .setTimestamp();

        const statsMessage = await interaction.reply({ embeds: [embed], fetchReply: true });

        // Update embed tiap 5 detik
        setInterval(async () => {
            colorIndex++;
            const updatedEmbed = new EmbedBuilder()
                .setTitle(`📊 Real-Time Stats: ${server.name}`)
                .setColor(rainbowColors[colorIndex % rainbowColors.length])
                .setThumbnail(server.iconURL({ dynamic: true }))
                .addFields(
                    { name: "Members", value: `${server.memberCount}`, inline: true },
                    { name: "Humans", value: `${server.members.cache.filter(m => !m.user.bot).size}`, inline: true },
                    { name: "Bots", value: `${server.members.cache.filter(m => m.user.bot).size}`, inline: true },
                    { name: "Channels", value: `${server.channels.cache.size}`, inline: true },
                    { name: "Server Created", value: `<t:${Math.floor(server.createdTimestamp/1000)}:R>`, inline: true }
                )
                .setFooter({ text: interaction.client.user.username, iconURL: interaction.client.user.displayAvatarURL({ dynamic: true }) })
                .setTimestamp();

            try {
                await statsMessage.edit({ embeds: [updatedEmbed] });
            } catch (err) {
                console.error("Failed to update live stats:", err);
            }
        }, 5000);
    }
};
