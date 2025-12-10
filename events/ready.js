module.exports = {
    name: "ready",
    once: true,
    async execute(client) {
        const developer = process.env.GH_OWNER || "Unknown Developer";

        console.log(`Bot is now online as ${client.user.tag}`);
        console.log(`Developer: ${developer}`);

        // Mode DND
        await client.user.setPresence({
            status: "dnd",
            activities: [{ name: "Starting Zephyr....", type: 0 }]
        });

        const activities = [
            () => `Developer ${developer}`,
            () => `Playing ${client.guilds.cache.size} Servers`,
            () => `Powered by Scarily`,
            () => `Support For Add Me`,
        ];

        let i = 0;

        setInterval(async () => {
            try {
                let text = activities[i];
                if (typeof text === "function") text = text(); // auto evaluate

                await client.user.setPresence({
                    status: "dnd",
                    activities: [{ name: text, type: 0 }]
                });

                i = (i + 1) % activities.length;
            } catch (err) {
                console.log("Activity Error:", err.message);
            }
        }, 3000);
    }
};
