const fs = require('fs');
module.exports = {
    name: "restoreserver",
    description: "Restore server dari backup JSON",
    async execute(message) {
        const file = `backup_${message.guild.id}.json`;
        if(!fs.existsSync(file)) return message.reply("Backup server tidak ditemukan!");
        const data = JSON.parse(fs.readFileSync(file));
        
        // Restore roles dulu
        for(const r of data.roles){
            await message.guild.roles.create({
                name: r.name,
                color: r.color,
                permissions: BigInt(r.permissions),
                hoist: r.hoist,
                mentionable: r.mentionable
            });
        }
        
        // Restore channels & categories
        for(const c of data.channels){
            await message.guild.channels.create({
                name: c.name,
                type: c.type,
                position: c.position,
                parent: c.parentId || null
            });
        }

        message.channel.send("✅ Restore server selesai!");
    }
};
