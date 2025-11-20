module.exports = {
    name: "unlock",
    description: "Membuka channel yang terkunci",
    execute(message, args, client) {
        message.channel.permissionOverwrites.edit(message.guild.roles.everyone, { SendMessages: true })
            .then(() => message.channel.send("Channel dibuka!"))
            .catch(err => message.reply("Terjadi error saat membuka channel"));
    }
};
