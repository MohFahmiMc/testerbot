module.exports = {
    name: "ready", // <- WAJIB 'ready' BUKAN 'clientReady'
    once: true,

    async execute(client) {
        console.log(`✅ ${client.user.tag} is online! Developer: ${process.env.GH_OWNER}`);

        const messages = [
            "Scarily Bot is active 👻",
            "Join our support server!",
            () => `Serving over ${client.guilds.cache.size} servers 🌐`,
            "Fun, Moderation & Utility Commands",
            `Developer: ${process.env.GH_OWNER}`
        ];

        let index = 0;

        // Rotating presence every 5 seconds
        setInterval(() => {
            let msg = messages[index];
            if (typeof msg === "function") msg = msg();

            client.user.setActivity(msg, { type: 0 }) // 0 = Playing
                .catch(err => console.error("Presence error:", err));

            index = (index + 1) % messages.length;
        }, 5000);
    }
};
