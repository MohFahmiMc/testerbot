module.exports = {
    name: 'pingbot',
    description: 'Check bot latency and info',
    async execute(interactionOrMessage, args, client) { // <-- terima client
        if (interactionOrMessage.isChatInputCommand?.()) {
            await interactionOrMessage.reply(`Bot is online! Name: ${client.user.tag}`);
            return;
        }
        // Prefix command
        await interactionOrMessage.reply(`Bot is online! Name: ${client.user.tag}`);
    }
};
