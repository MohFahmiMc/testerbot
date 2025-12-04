const fs = require("fs");
const path = require("path");
const { getPrefix } = require("../utils/prefixHandler");

module.exports = {
    name: "messageCreate",
    async execute(message, client) {
        if (message.author.bot) return;

        const prefix = getPrefix(message.guild?.id);

        // Trigger system
        if (client.triggers) {
            for (const t of Object.keys(client.triggers)) {
                if (message.content.toLowerCase().includes(t.toLowerCase())) {
                    await message.reply(client.triggers[t]);
                }
            }
        }

        // XP system
        const levelsPath = path.join(__dirname, "../data/levels.json");
        let levels = fs.existsSync(levelsPath)
            ? JSON.parse(fs.readFileSync(levelsPath))
            : {};

        if (!levels[message.author.id]) {
            levels[message.author.id] = { xp: 0, level: 1 };
        }

        levels[message.author.id].xp += Math.floor(Math.random() * 10) + 5;

        const needed = levels[message.author.id].level * 100;

        if (levels[message.author.id].xp >= needed) {
            levels[message.author.id].level++;
            levels[message.author.id].xp -= needed;

            message.reply(`🎉 Congrats ${message.author}, you reached level **${levels[message.author.id].level}**!`);
        }

        fs.writeFileSync(levelsPath, JSON.stringify(levels, null, 2));
    }
};
