const fs = require("fs");
const path = require("path");

const configPath = path.join(__dirname, "../data/autorole.json");

module.exports = {
    name: "guildMemberAdd",
    async execute(member) {
        if (!fs.existsSync(configPath)) return;

        const data = JSON.parse(fs.readFileSync(configPath, "utf8"));
        const roleId = data[member.guild.id];

        if (!roleId) return;

        const role = member.guild.roles.cache.get(roleId);
        if (!role) return;

        member.roles.add(role).catch(() => null);
    }
};
