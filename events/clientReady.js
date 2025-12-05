module.exports = {
    name: "clientReady",
    once: true,
    async execute(client) {
        console.log(`✅ ${client.user.tag} is online! Developer: ${process.env.GH_OWNER}`);

        const messages = [
            "Scarily Bot is active 👻",
            "Join our support server!",
            () => `Serving over ${client.guilds.cache.size} servers 🌐`,
            "Fun, Moderation & Utility",
            `Developer: ${process.env.GH_OWNER}`
        ];

        let index = 0;

        setInterval(() => {
            let msg = messages[index];
            if (typeof msg === "function") msg = msg();
            client.user.setActivity(msg, { type: "PLAYING" }).catch(console.error);
            index = (index + 1) % messages.length;
        }, 5000);
    }
};
