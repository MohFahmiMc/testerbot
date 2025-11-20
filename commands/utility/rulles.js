module.exports = {
    name: "serverroles",
    description: "Menampilkan semua role di server",
    execute(message, args, client) {
        const roles = message.guild.roles.cache.map(r => r.name).join(", ");
        message.channel.send(`Roles di server: ${roles}`);
    }
};
