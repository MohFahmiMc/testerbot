module.exports = {
    name: "clientReady",
    once: true,
    async execute(client) {
        console.log(`${client.user.tag} is online!`);

        // Ambil jumlah guild
        const guildCount = client.guilds.cache.size;

        // Nama developer (misal dari .env)
        const developer = process.env.DEVELOPER_NAME || "GitHub:YourName";

        // Status dinamis
        client.user.setActivity({
            name: `🎉 Giveaway | ${guildCount} servers | Dev: ${developer}`,
            type: 3 // PLAYING
        });

        console.log(`Status set: Playing Giveaway | ${guildCount} servers | Dev: ${developer}`);
    }
};
