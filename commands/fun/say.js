module.exports = {
    name: "say",
    description: "Bot will repeat your text",
    options: [
        { name: "text", type: 3, description: "Text to say", required: true }
    ],
    async execute(interaction) {
        if (interaction.isChatInputCommand()) {
            const text = interaction.options.getString("text");
            await interaction.reply(text);
        } else {
            const message = interaction;
            const args = message.content.split(/ +/).slice(1);
            await message.channel.send(args.join(" "));
        }
    }
};
