const fs = require('fs');
module.exports = {
    name: "backuproles",
    description: "Backup semua role server ke file JSON",
    execute(message) {
        const roles = message.guild.roles.cache.map(r => ({
            name: r.name,
            color: r.color,
            hoist: r.hoist,
            permissions: r.permissions.bitfield
        }));
        fs.writeFileSync(`roles_backup_${message.guild.id}.json`, JSON.stringify(roles, null, 2));
        message.channel.send("✅ Backup roles selesai!");
    }
};
