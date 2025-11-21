module.exports = {
    name: "auditlog",
    description: "Menampilkan 5 log terakhir dari server",
    async execute(message) {
        const logs = await message.guild.fetchAuditLogs({ limit: 5 });
        const entries = logs.entries.map(e => `${e.executor.tag} → ${e.action}`).join("\n");
        message.channel.send("5 Log terakhir:\n" + entries);
    }
};
