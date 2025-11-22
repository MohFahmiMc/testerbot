const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const fs = require("fs");
const path = require("path");

const premiumFile = path.join(__dirname, "../data/premium.json");
const settingsFile = path.join(__dirname, "../data/realtimestats.json");

// Pastikan file data ada
if (!fs.existsSync(premiumFile)) fs.writeFileSync(premiumFile, JSON.stringify([]));
if (!fs.existsSync(settingsFile)) fs.writeFileSync(settingsFile, JSON.stringify({}));

module.exports = {
  data: new SlashCommandBuilder()
    .setName("realtimestats")
    .setDescription("View real-time bot & server statistics (premium)")
    .addSubcommand(sub =>
      sub.setName("show")
        .setDescription("Show real-time statistics"))
    .addSubcommand(sub =>
      sub.setName("set")
        .setDescription("Set the channel to post stats")
        .addChannelOption(option =>
          option.setName("channel")
            .setDescription("Select a text channel")
            .setRequired(true))
    ),

  async execute(interaction) {
    const premiumUsers = JSON.parse(fs.readFileSync(premiumFile, "utf8"));
    if (!premiumUsers.includes(interaction.user.id)) {
      return interaction.reply({ content: "❌ You do not have access to this premium command.", ephemeral: true });
    }

    const settings = JSON.parse(fs.readFileSync(settingsFile, "utf8"));

    if (interaction.options.getSubcommand() === "set") {
      const channel = interaction.options.getChannel("channel");
      settings[interaction.guild.id] = channel.id;
      fs.writeFileSync(settingsFile, JSON.stringify(settings, null, 2));
      return interaction.reply({ content: `✅ Real-time stats channel set to ${channel}.`, ephemeral: true });
    }

    // show stats
    const guildCount = interaction.client.guilds.cache.size;
    const memberCount = interaction.client.guilds.cache.reduce((acc, g) => acc + g.memberCount, 0);
    const botCount = interaction.client.users.cache.filter(u => u.bot).size;

    const embed = new EmbedBuilder()
      .setTitle("📊 Real-Time Bot Statistics")
      .setColor("Blue")
      .addFields(
        { name: "Servers", value: `${guildCount}`, inline: true },
        { name: "Total Members", value: `${memberCount}`, inline: true },
        { name: "Bots Online", value: `${botCount}`, inline: true },
        { name: "Owner", value: `<@${interaction.client.application.owner.id}>`, inline: false }
      )
      .setFooter({ text: "ScarilyId Premium Stats" })
      .setTimestamp();

    // kirim ke channel yg diset atau reply di interaction
    const channelId = settings[interaction.guild.id];
    if (channelId) {
      const targetChannel = interaction.client.channels.cache.get(channelId);
      if (targetChannel) {
        targetChannel.send({ embeds: [embed] });
        return interaction.reply({ content: "✅ Real-time stats posted in the configured channel.", ephemeral: true });
      }
    }

    return interaction.reply({ embeds: [embed], ephemeral: true });
  },
};
