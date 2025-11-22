const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const fs = require("fs");
const path = require("path");

const levelsFile = path.join(__dirname, "../../data/levels.json");
const roleBackupFile = path.join(__dirname, "../../data/roleBackup.json");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("level")
    .setDescription("Check your level and XP."),

  async execute(interaction) {
    const userId = interaction.user.id;
    const guildId = interaction.guild.id;

    let levels = {};
    if (fs.existsSync(levelsFile)) levels = JSON.parse(fs.readFileSync(levelsFile, "utf8"));

    if (!levels[guildId]) levels[guildId] = {};
    if (!levels[guildId][userId]) levels[guildId][userId] = { xp: 0, level: 0 };

    const userData = levels[guildId][userId];

    const embed = new EmbedBuilder()
      .setTitle(`${interaction.user.username}'s Level`)
      .addFields(
        { name: "Level", value: `${userData.level}`, inline: true },
        { name: "XP", value: `${userData.xp}`, inline: true }
      )
      .setColor("#00FFFF");

    await interaction.reply({ embeds: [embed] });

    // Save data
    fs.writeFileSync(levelsFile, JSON.stringify(levels, null, 2));
  },
};

// --- Event handler (messageCreate) ---
module.exports.messageCreate = async (message, client) => {
  if (message.author.bot) return;

  const levelsFile = path.join(__dirname, "../data/levels.json");
  let levels = {};
  if (fs.existsSync(levelsFile)) levels = JSON.parse(fs.readFileSync(levelsFile, "utf8"));

  const guildId = message.guild.id;
  const userId = message.author.id;

  if (!levels[guildId]) levels[guildId] = {};
  if (!levels[guildId][userId]) levels[guildId][userId] = { xp: 0, level: 0 };

  levels[guildId][userId].xp += 10; // Bisa ubah sesuai rate

  const neededXp = 100 + levels[guildId][userId].level * 50;

  if (levels[guildId][userId].xp >= neededXp) {
    levels[guildId][userId].level += 1;
    levels[guildId][userId].xp = 0;

    // Auto-create role jika belum ada
    const roleName = `Level ${levels[guildId][userId].level}`;
    let role = message.guild.roles.cache.find(r => r.name === roleName);
    if (!role) {
      role = await message.guild.roles.create({
        name: roleName,
        color: "Random",
        reason: "Auto level role"
      });
    }

    await message.channel.send(`${message.author} reached level ${levels[guildId][userId].level} and got role ${role.name}!`);
  }

  fs.writeFileSync(levelsFile, JSON.stringify(levels, null, 2));
};
