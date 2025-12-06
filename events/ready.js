module.exports = {
    name: "ready", // HARUS ready
    once: true,
    async execute(client) {
        console.log(`✅ ${client.user.tag} is online! Developer: ${process.env.GH_OWNER}`);

        const messages = [
            () => `Serving ${client.guilds.cache.size} servers 🌐`,
            "Join our support server!",
            "Fun, Moderation & Utility Commands",
            `Developer: ${process.env.GH_OWNER}`,
            "Scarily Bot is active 👻"
        ];

        let index = 0;

        // Update presence setiap 5 detik
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
