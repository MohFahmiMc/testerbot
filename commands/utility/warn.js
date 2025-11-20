module.exports = {
    name: "warn",
    description: "Memberikan peringatan ke member",
    execute(message, args, client) {
        const member = message.mentions.members.first();
        if(!member) return message.reply("Tandai member yang ingin di-warn!");
        const reason = args.slice(1).join(" ") || "Tidak ada alasan";
        message.channel.send(`${member.user.tag} telah di-warn. Alasan: ${reason}`);
    }
};
