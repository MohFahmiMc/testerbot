module.exports = {
    name: "pingbot",
    description: "Check bot latency",
    options: [],
    async execute(interaction) {
        const ping = Math.round(client.ws.ping);
        if (interaction.isChatInputCommand()) {
            await interaction.reply(`Bot latency: ${ping}ms`);
        } else {
            interaction.channel.send(`Bot latency: ${ping}ms`);
        }
    }
};
