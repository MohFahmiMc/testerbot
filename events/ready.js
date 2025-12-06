module.exports = {
    name: "ready",
    once: true,
    async execute(client) {
        console.log(`✅ ${client.user.tag} is online! Developer: ${process.env.GH_OWNER}`);

        // Set bot status ke Do Not Disturb
        client.user.setStatus("dnd").catch(err => console.error("SetStatus error:", err));

        // Daftar messages untuk rotating
        const messages = [
            () => `Serving ${client.guilds.cache.size} servers`, // realtime server count
            "Join our support server", // static
            "Fun, Moderation & Utility Commands",
            () => `Developer: ${process.env.GH_OWNER}`,
            "Scarily Bot is active"
        ];

        let index = 0;

        // Interval 5 detik untuk berganti status playing
        setInterval(() => {
            try {
                let msg = messages[index];
                if (typeof msg === "function") msg = msg();

                client.user.setActivity(msg, { type: 0 }) // 0 = PLAYING
                    .catch(err => console.error("SetActivity error:", err));

                index = (index + 1) % messages.length;
            } catch (e) {
                console.error("Presence interval error:", e);
            }
        }, 5000);
    }
};
