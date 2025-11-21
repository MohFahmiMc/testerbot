module.exports = {
    name: "warn",
    description: "Memberikan peringatan ke user",
    execute(message, args, client) {
        // Ambil user yang di-mention
        const user = message.mentions.users.first();
        if (!user) return message.reply("Tag user yang ingin diwarn!");

        // Ambil alasan, jika ada
        const reason = args.slice(1).join(" ") || "Tidak ada alasan diberikan";

        // Kirim pesan warn
        message.channel.send(`⚠️ ${user.tag} telah diwarn!\nAlasan: ${reason}`);
    }
};
