module.exports = {
    name: "serverstats",
    description: "Menampilkan statistik server",
    execute(message) {
        const members = message.guild.members.cache;
        const online = members.filter(m => m.presence?.status === "online").size;
        const offline = members.size - online;
        const channels = message.guild.channels.cache.size;
        const roles = message.guild.roles.cache.size;
        message.channel.send(
            `Server: ${message.guild.name}\n` +
            `Total member: ${members.size}\nOnline: ${online}\nOffline: ${offline}\n` +
            `Channels: ${channels}\nRoles: ${roles}`
        );
    }
};
