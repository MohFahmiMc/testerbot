module.exports = {
    name: "rolehierarchy",
    description: "Menampilkan hierarki role server",
    execute(message) {
        const roles = message.guild.roles.cache
            .filter(r => r.id !== message.guild.id)
            .sort((a,b)=>b.position - a.position)
            .map(r => r.name).join(" → ");
        message.channel.send(`Hierarki roles: ${roles}`);
    }
};
