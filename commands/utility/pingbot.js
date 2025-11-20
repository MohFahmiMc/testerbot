module.exports = {
    name: "pingbot",
    description: "Menampilkan ping bot",
    execute(message, args, client) {
        message.channel.send(`Ping bot: ${client.ws.ping}ms`);
    }
};
