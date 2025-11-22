const fs = require("fs");
const path = require("path");
const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("realtimestats")
    .setDescription("Set or show real-time stats channel")
    .addSubcommand(sub =>
      sub.setName("set")
         .setDescription("Set the channel to show stats")
         .addChannelOption(opt => opt.setName("channel").setDescription("Channel for stats").setRequired(true)))
    .addSubcommand(sub => sub.setName("show").setDescription("Show current server stats")),

  async execute(interaction) {
    const filePath = path.join(__dirname, "../data/realtimestats.json");
    const data = JSON.parse(fs.readFileSync(filePath, "utf8"));
    const subcommand = interaction.options.getSubcommand();

    if (subcommand === "set") {
      const channel = interaction.options.getChannel("channel");
      const existing = data.servers.find(s => s.guild_id === interaction.guild.id);
      if (existing) {
        existing.channel_id = channel.id;
      } else {
        data.servers.push({ guild_id: interaction.guild.id, channel_id: channel.id });
      }
      fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
      return interaction.reply(`✅ Stats channel set to ${channel}`);
    }

    if (subcommand === "show") {
      const stats = data.servers.find(s => s.guild_id === interaction.guild.id);
      if (!stats) return interaction.reply("❌ Stats channel not set yet.");
      const embed = new EmbedBuilder()
        .setTitle("Real-Time Stats")
        .addFields(
          { name: "Server Name", value: interaction.guild.name, inline: true },
          { name: "Server ID", value: interaction.guild.id, inline: true },
          { name: "Member Count", value: `${interaction.guild.memberCount}`, inline: true },
          { name: "Bot Count", value: `${interaction.guild.members.cache.filter(m => m.user.bot).size}`, inline: true }
        )
        .setTimestamp();
      return interaction.reply({ embeds: [embed] });
    }
  },
};
