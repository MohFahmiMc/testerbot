module.exports = {
    name: "ready",
    once: true,
    execute(client) {

        // Set Activity
        client.user.setActivity("Zephyr Giveaway", {
            type: 0 // Playing
        });

        // Log di console
        console.log(`✅ Logged in as ${client.user.tag}`);
        console.log(`📌 Connected to ${client.guilds.cache.size} servers!`);

        // Kalau ingin tampilkan list server
        client.guilds.cache.forEach(guild => {
            console.log(`- ${guild.name} (${guild.id})`);
        });
    }
};
