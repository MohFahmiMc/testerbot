const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const fs = require("fs");
const path = require("path");

const levelsFile = path.join(__dirname, "../../data/levels.json");
let levels = {};
if (fs.existsSync(levelsFile)) levels = JSON.parse(fs.readFileSync(levelsFile));

const levelRoles = {
    1: "Role1ID",
    10: "Role10ID",
    20: "Role20ID",
    30: "Role30ID",
    40: "Role40ID",
    50: "Role50ID"
};

function saveLevels() {
    fs.writeFileSync(levelsFile, JSON.stringify(levels, null, 2));
}

module.exports = {
    data: new SlashCommandBuilder()
        .setName("level")
        .setDescription("Check your level, leaderboard or claim rewards.")
        .addSubcommand(sub => sub.setName("check").setDescription("Check your level"))
        .addSubcommand(sub => sub.setName("leaderboard").setDescription("Show top levels"))
        .addSubcommand(sub => sub.setName("reward").setDescription("Claim level reward")),

    async execute(interaction) {
        const userId = interaction.user.id;
        const sub = interaction.options.getSubcommand();

        // Initialize user
        if (!levels[userId]) levels[userId] = { xp: 0, level: 1 };

        const userData = levels[userId];

        if (sub === "check") {
            const embed = new EmbedBuilder()
                .setTitle(`${interaction.user.username} Level Info`)
                .setColor("Blue")
                .addFields(
                    { name: "Level", value: `${userData.level}`, inline: true },
                    { name: "XP", value: `${userData.xp}`, inline: true }
                );
            await interaction.reply({ embeds: [embed] });
        } else if (sub === "leaderboard") {
            const sorted = Object.entries(levels)
                .sort(([, a], [, b]) => b.level - a.level)
                .slice(0, 10);
            const desc = sorted.map(([id, data], i) => `${i+1}. <@${id}> - Level ${data.level} (${data.xp} XP)`).join("\n");
            const embed = new EmbedBuilder()
                .setTitle("Leaderboard")
                .setDescription(desc || "No data yet")
                .setColor("Green");
            await interaction.reply({ embeds: [embed] });
        } else if (sub === "reward") {
            // Check level roles
            const member = interaction.guild.members.cache.get(userId);
            if (!member) return interaction.reply({ content: "Member not found", ephemeral: true });

            const roleToGive = levelRoles[userData.level];
            if (roleToGive && !member.roles.cache.has(roleToGive)) {
                await member.roles.add(roleToGive);
                let msg = `You received role for level ${userData.level}!`;
                if (userData.level === 50) msg += "\nTouch Grass 🌿";

                await interaction.reply({ content: msg, ephemeral: false });
            } else {
                await interaction.reply({ content: "No rewards available for your level.", ephemeral: true });
            }
        }
        saveLevels();
    },

    // Function untuk nambah XP tiap message (bukan command)
    async addXP(message) {
        if (message.author.bot) return;
        const userId = message.author.id;
        if (!levels[userId]) levels[userId] = { xp: 0, level: 1 };

        levels[userId].xp += 10; // tiap pesan +10 XP
        const xpForNextLevel = levels[userId].level * 100;

        if (levels[userId].xp >= xpForNextLevel) {
            levels[userId].level++;
            levels[userId].xp = 0;

            // Optional: kasih role otomatis jika ada
            const roleId = levelRoles[levels[userId].level];
            if (roleId) {
                const member = message.guild.members.cache.get(userId);
                if (member && !member.roles.cache.has(roleId)) member.roles.add(roleId);
            }

            message.channel.send(`${message.author} leveled up to ${levels[userId].level}! 🎉`);
        }
        saveLevels();
    }
};
