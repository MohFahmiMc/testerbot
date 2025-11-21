module.exports = {
    name: "topinviter",
    description: "Menampilkan top inviter di server",
    async execute(message) {
        const invites = await message.guild.invites.fetch();
        const data = {};
        invites.forEach(i => {
            data[i.inviter.id] = (data[i.inviter.id] || 0) + i.uses;
        });
        const sorted = Object.entries(data).sort((a,b)=>b[1]-a[1]).slice(0,5);
        const text = sorted.map(([id,uses])=>`${message.guild.members.cache.get(id)?.user.tag || id}: ${uses} invite`).join("\n");
        message.channel.send(`Top inviter:\n${text}`);
    }
};
