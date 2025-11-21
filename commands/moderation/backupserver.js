const fs = require('fs');
module.exports = {
    name: "backupserver",
    description: "Backup struktur server (roles, channels) ke JSON",
    async execute(message) {
        const serverData = {
            roles: message.guild.roles.cache.map(r => ({name:r.name,color:r.color,permissions:r.permissions.bitfield,hoist:r.hoist,mentionable:r.mentionable})),
            channels: message.guild.channels.cache.map(c => ({name:c.name,type:c.type,position:c.position,parentId:c.parentId}))
        };
        fs.writeFileSync(`backup_${message.guild.id}.json`, JSON.stringify(serverData,null,2));
        message.channel.send("✅ Backup server selesai!");
    }
};
