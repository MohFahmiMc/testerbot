const fs = require("fs");
const path = require("path");
const levelsFile = path.join(__dirname, "../data/levels.json");

// Load levels data
let levels = {};
if (fs.existsSync(levelsFile)) {
    levels = JSON.parse(fs.readFileSync(levelsFile, "utf8"));
}

module.exports = {
    name: "messageCreate",
    execute: async (message, client) => {
        if (message.author.bot) return;

        const userId = message.author.id;
        if (!levels[userId]) {
            levels[userId] = { xp: 0, level: 1 };
        }

        // Add XP per message
        const xpGain = Math.floor(Math.random() * 10) + 5;
        levels[userId].xp += xpGain;

        // Level up
        const nextLevelXp = levels[userId].level * 100;
        if (levels[userId].xp >= nextLevelXp) {
            levels[userId].level++;
            levels[userId].xp = 0;

            message.channel.send({
                content: `🎉 ${message.author.tag} leveled up to **Level ${levels[userId].level}**!`
            });

            // Auto role assignment example
            // You can customize levels and roles here
            const guildMember = message.guild.members.cache.get(userId);
            if (guildMember) {
                if (levels[userId].level === 1) {
                    let role = message.guild.roles.cache.find(r => r.name === "Level 1");
                    if (role) guildMember.roles.add(role).catch(() => {});
                }
                if (levels[userId].level === 10) {
                    let role = message.guild.roles.cache.find(r => r.name === "Level 10");
                    if (role) guildMember.roles.add(role).catch(() => {});
                }
            }
        }

        // Save levels
        fs.writeFileSync(levelsFile, JSON.stringify(levels, null, 2));
    }
};
