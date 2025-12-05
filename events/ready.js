const fs = require("fs");
const path = require("path");
const { ActivityType } = require("discord.js");

module.exports = {
    name: "ready",
    once: true, // hanya dijalankan sekali saat bot online

    async execute(client) {
        console.log(`✅ Logged in as ${client.user.tag}`);

        // =============== STATUS ROTATION ===============
        const statuses = [
            "ScarilyId Group",
            "ScarilyId Hosting",
            "ScarilyId SMP"
        ];

        let i = 0;
        setInterval(() => {
            client.user.setActivity(
                statuses[i % statuses.length],
                { type: ActivityType.Playing }
            );
            i++;
        }, 3000);


        // =============== LOAD TRIGGERS ===============
        const triggerPath = path.join(__dirname, "../data/triggers.json");

        client.triggers = {};

        if (fs.existsSync(triggerPath)) {
            client.triggers = JSON.parse(fs.readFileSync(triggerPath, "utf-8"));
            console.log("📌 Triggers loaded");
        } else {
            fs.writeFileSync(triggerPath, JSON.stringify({}, null, 2));
        }


        // =============== LOAD GIVEAWAY DATA ===============
        const givePath = path.join(__dirname, "../giveaways/data.json");

        if (!fs.existsSync(givePath)) {
            fs.writeFileSync(givePath, JSON.stringify({ giveaways: [] }, null, 2));
        } else {
            console.log("🎁 Giveaway data loaded");
        }


        // =============== GIVEAWAY AUTO TIMER ===============
        setInterval(() => {
            const data = JSON.parse(fs.readFileSync(givePath, "utf8"));

            for (const gw of data.giveaways) {

                if (gw.ended || gw.paused) continue;

                const now = Date.now();

                if (now >= gw.endAt) {

                    // Mark ended
                    gw.ended = true;

                    // Save
                    fs.writeFileSync(givePath, JSON.stringify(data, null, 2));

                    // Execute ending logic
                    const channel = client.channels.cache.get(gw.channelId);
                    if (!channel) continue;

                    const winnerCount = gw.winners || 1;

                    if (gw.entrants.length === 0) {
                        channel.send(`❌ Giveaway Ended!\nNo participants entered.`);
                        continue;
                    }

                    // Pick winners
                    const winners = [];
                    for (let i = 0; i < winnerCount; i++) {
                        const win = gw.entrants[Math.floor(Math.random() * gw.entrants.length)];
                        if (!winners.includes(win)) winners.push(win);
                    }

                    channel.send(
                        `🎉 **Giveaway Ended!**\nWinner(s): ${winners.map(w => `<@${w}>`).join(", ")}`
                    );
                }
            }
        }, 5000); // cek setiap 5 detik

        console.log("⏱️ Giveaway timer started");
    }
};
