module.exports = {
    name: "membercount",
    description: "Menampilkan jumlah member server",
    execute(message, args, client) {
        message.channel.send(`Jumlah member di server: ${message.guild.memberCount}`);
    }
};
