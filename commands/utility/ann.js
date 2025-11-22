const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("announcement")
        .setDescription("Send an announcement in this server")
        .addStringOption(option =>
            option.setName("type")
                .setDescription("Choose type: embed or chat")
                .setRequired(true)
                .addChoices(
                    { name: "embed", value: "embed" },
                    { name: "chat", value: "chat" }
                ))
        .addStringOption(option =>
            option.setName("message")
                .setDescription("Message content")
                .setRequired(true))
        .addRoleOption(option =>
            option.setName("role")
                .setDescription("Ping a role (optional)")
                .setRequired(false)),

    async execute(interaction) {
        const type = interaction.options.getString("type");
        const messageContent = interaction.options.getString("message");
        const role = interaction.options.getRole("role");

        if (type === "embed") {
            const embed = new EmbedBuilder()
                .setTitle("📢 Announcement")
                .setDescription(messageContent)
                .setColor("Blue")
                .setFooter({ text: `Announcement by ${interaction.user.tag}`, iconURL: interaction.user.displayAvatarURL() })
                .setTimestamp();

            if (role) {
                await interaction.channel.send({ content: `${role}`, embeds: [embed] });
            } else {
                await interaction.channel.send({ embeds: [embed] });
            }

            await interaction.reply({ content: "✅ Announcement sent!", ephemeral: true });
        } else if (type === "chat") {
            if (role) {
                await interaction.channel.send(`${role} ${messageContent}`);
            } else {
                await interaction.channel.send(messageContent);
            }

            await interaction.reply({ content: "✅ Announcement sent!", ephemeral: true });
        }
    }
};
