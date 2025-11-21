module.exports = {
    name: "nick",
    description: "Mengubah nickname member",
    execute(message, args) {
        if(!message.member.permissions.has("ManageNicknames")) return message.reply("Kamu tidak punya permission!");
        const member = message.mentions.members.first();
        if(!member) return message.reply("Tolong sebutkan member!");
        const nickname = args.slice(1).join(" ");
        member.setNickname(nickname || null);
        message.channel.send(`Nickname ${member.user.tag} diubah menjadi: ${nickname || "Default"}`);
    }
};
