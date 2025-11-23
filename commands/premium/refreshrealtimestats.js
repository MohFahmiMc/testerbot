const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const fs = require("fs");
const path = require("path");

const CONFIG_FILE = path.join(__dirname, "../../data/realtimestats.json");
const PREMIUM_FILE = path.join(__dirname, "../../data/premium.json");

module.exports = {
    owner: true,
    premium: true,

    data: new SlashCommandBuilder()
        .setName("refreshrealtimestats")
        .setDescription("Manually refresh real-time stats (premium only)."),

    async execute(interaction, client) {
        const OWNER_ID = process.env.OWNER_ID;

        if (interaction.user.id !== OWNER_ID) {
            return interaction.reply({
                content: "❌ Only the bot owner can use this.",
                ephemeral: true
            });
        }

        if (!fs.existsSync(CONFIG_FILE)) {
            return interaction.reply({
                content: "❌ No stats message found.",
                ephemeral: true
            });
        }

        const config = JSON.parse(fs.readFileSync(CONFIG_FILE));

        const guild = interaction.guild;
        await guild.members.fetch();

        const humans = guild.members.cache.filter(m => !m.user.bot).size;
        const bots = guild.members.cache.filter(m => m.user.bot).size;

        const embed = new EmbedBuilder()
            .setTitle("📊 Real-Time Server Stats (Refreshed)")
            .setColor("#808080")
            .setThumbnail(client.user.displayAvatarURL({ size: 2048 }))
            .addFields(
                { name: "👤 Humans", value: `${humans}`, inline: true },
                { name: "🤖 Bots", value: `${bots}`, inline: true },
                { name: "🌍 Total Members", value: `${guild.memberCount}`, inline: true }
            )
            .setTimestamp();

        try {
            const channel = await guild.channels.fetch(config.channelId);
            const message = await channel.messages.fetch(config.messageId);

            await message.edit({ embeds: [embed] });

            return interaction.reply({
                content: "🔄 Stats refreshed.",
                ephemeral: true
            });
        } catch (e) {
            return interaction.reply({
                content: "❌ Failed: message deleted.",
                ephemeral: true
            });
        }
    }
};
