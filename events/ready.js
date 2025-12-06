module.exports = {
    name: "ready",
    once: true,
    async execute(client) {
        console.log(`✅ ${client.user.tag} is online! Developer: ${process.env.GH_OWNER}`);

        // Pastikan bot DND
        client.user.setPresence({
            activities: [{ name: "Starting up...", type: 0 }],
            status: "dnd"
        }).catch(console.error);

        // Daftar messages
        const messages = [
            () => `Serving ${client.guilds.cache.size} servers`,
            "Join our support server",
            "Fun, Moderation & Utility Commands",
            () => `Developer: ${process.env.GH_OWNER}`,
            "Scarily Bot is active"
        ];

        let index = 0;

        const updateActivity = () => {
            let msg = messages[index];
            if (typeof msg === "function") msg = msg();
            client.user.setActivity(msg, { type: 0 }).catch(console.error);
            client.user.setStatus("dnd").catch(console.error);
            index = (index + 1) % messages.length;
        };

        // Update activity setiap 5 detik
        setInterval(updateActivity, 5000);
        updateActivity(); // langsung update pertama kali

        // ========================
        // Real-time server count
        // ========================
        client.on("guildCreate", () => updateActivity());
        client.on("guildDelete", () => updateActivity());

        // ========================
        // Railway keep-alive friendly
        // ========================
        if (process.env.RAILWAY) {
            console.log("✅ Running on Railway hosting, keeping presence alive.");
            // Optional: bisa ping sendiri atau pakai interval supaya Railway tidak sleep
            setInterval(() => {
                client.user.setStatus("dnd").catch(() => {});
            }, 10 * 60 * 1000); // setiap 10 menit
        }
    }
};
