module.exports = {
    name: "lock",
    description: "Mengunci channel untuk member biasa",
    execute(message, args, client) {
        message.channel.permissionOverwrites.edit(message.guild.roles.everyone, { SendMessages: false })
            .then(() => message.channel.send("Channel dikunci!"))
            .catch(err => message.reply("Terjadi error saat mengunci channel"));
    }
};
