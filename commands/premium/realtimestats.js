const {
    SlashCommandBuilder,
    EmbedBuilder
} = require("discord.js");

const fs = require("fs");
const path = require("path");

const CONFIG_FILE = path.join(__dirname, "../../data/realtimestats.json");
const PREMIUM_FILE = path.join(__dirname, "../../data/premium.json");

module.exports = {
    owner: true,
    premium: true,

    data: new SlashCommandBuilder()
        .setName("realtimestats")
        .setDescription("Setup real-time server statistics (Premium only)."),

    async execute(interaction, client) {
        const OWNER_ID = process.env.OWNER_ID;

        if (interaction.user.id !== OWNER_ID) {
            return interaction.reply({
                content: "❌ Only the bot owner can use this command.",
                ephemeral: true
            });
        }

        if (!fs.existsSync(PREMIUM_FILE)) {
            return interaction.reply({
                content: "❌ premium.json missing.",
                ephemeral: true
            });
        }

        const premium = JSON.parse(fs.readFileSync(PREMIUM_FILE));
        if (!premium.guilds.includes(interaction.guild.id)) {
            return interaction.reply({
                content: "❌ This server is NOT premium.",
                ephemeral: true
            });
        }

        const guild = interaction.guild;
        await guild.members.fetch();

        const humans = guild.members.cache.filter(m => !m.user.bot).size;
        const bots = guild.members.cache.filter(m => m.user.bot).size;
        const total = guild.memberCount;

        const embed = new EmbedBuilder()
            .setTitle("📊 Real-Time Server Stats")
            .setColor("#808080")
            .setThumbnail(client.user.displayAvatarURL({ size: 2048 }))
            .addFields(
                { name: "👤 Humans", value: `${humans}`, inline: true },
                { name: "🤖 Bots", value: `${bots}`, inline: true },
                { name: "🌍 Total Members", value: `${total}`, inline: true }
            )
            .setFooter({ text: "Auto Updating (every 5 minutes)" })
            .setTimestamp();

        const msg = await interaction.reply({
            embeds: [embed],
            fetchReply: true
        });

        fs.writeFileSync(
            CONFIG_FILE,
            JSON.stringify({
                guildId: guild.id,
                channelId: msg.channel.id,
                messageId: msg.id
            }, null, 2)
        );

        return interaction.followUp({
            content: "✅ Real-time stats created!",
            ephemeral: true
        });
    }
};
