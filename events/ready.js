const { ActivityType } = require("discord.js");
const fs = require("fs");
const path = require("path");

module.exports = {
    name: "ready",
    once: true,
    execute(client) {
        console.log(`${client.user.tag} is online!`);

        // Playing status rotation
        const statuses = [
            "ScarilyId Group",
            "ScarilyId Hosting",
            "ScarilyId SMP"
        ];
        let i = 0;
        setInterval(() => {
            client.user.setActivity(statuses[i % statuses.length], { type: ActivityType.Playing });
            i++;
        }, 3000);

        // Load triggers.json
        const triggersPath = path.join(__dirname, "../data/triggers.json");
        if (fs.existsSync(triggersPath)) {
            client.triggers = JSON.parse(fs.readFileSync(triggersPath, "utf-8"));
        } else {
            client.triggers = {};
        }
    }
};
