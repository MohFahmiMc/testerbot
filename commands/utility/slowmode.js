module.exports = {
    name: "slowmode",
    description: "Atur slowmode channel dalam detik",
    execute(message, args, client) {
        const time = parseInt(args[0]);
        if(isNaN(time) || time < 0) return message.reply("Masukkan angka detik yang valid!");
        message.channel.setRateLimitPerUser(time)
            .then(() => message.channel.send(`Slowmode di-set ke ${time} detik`))
            .catch(err => message.reply("Terjadi error saat mengatur slowmode"));
    }
};
