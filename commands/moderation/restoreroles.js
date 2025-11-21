const fs = require('fs');
module.exports = {
    name: "restoreroles",
    description: "Restore roles server dari backup JSON",
    execute(message) {
        const file = `roles_backup_${message.guild.id}.json`;
        if(!fs.existsSync(file)) return message.reply("Backup roles tidak ditemukan!");
        const roles = JSON.parse(fs.readFileSync(file));
        roles.forEach(r => {
            message.guild.roles.create({
                name: r.name,
                color: r.color,
                hoist: r.hoist,
                permissions: BigInt(r.permissions)
            });
        });
        message.channel.send("✅ Restore roles selesai!");
    }
};
