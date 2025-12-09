const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("announcement")
        .setDescription("Send an announcement in this server.")
        .addStringOption(option =>
            option.setName("type")
                .setDescription("Choose the announcement type.")
                .setRequired(true)
                .addChoices(
                    { name: "Embed", value: "embed" },
                    { name: "Chat", value: "chat" }
                )
        )
        .addStringOption(option =>
            option.setName("message")
                .setDescription("The announcement content.")
                .setRequired(true)
        )
        .addRoleOption(option =>
            option.setName("role")
                .setDescription("Ping a role (optional).")
                .setRequired(false)
        ),

    async execute(interaction) {
        const type = interaction.options.getString("type");
        const messageContent = interaction.options.getString("message");
        const role = interaction.options.getRole("role");

        const announceIcon = "<:utility8:1357261385947418644>";
        const footerIcon = "<:management:1447855811425468446>";

        if (type === "embed") {
            const embed = new EmbedBuilder()
                .setTitle(`${announceIcon} Announcement`)
                .setDescription(messageContent)
                .setColor("#2B7BFF")
                .setTimestamp()
                .setFooter({
                    text: `Announcement by ${interaction.user.tag}`,
                    iconURL: interaction.user.displayAvatarURL()
                });

            if (role) {
                await interaction.channel.send({
                    content: `${role}`,
                    embeds: [embed]
                });
            } else {
                await interaction.channel.send({ embeds: [embed] });
            }

            await interaction.reply({
                content: "<:blueutility4:1357261525387182251> Your announcement has been sent!",
                ephemeral: true
            });

        } else if (type === "chat") {
            if (role) {
                await interaction.channel.send(`${role} ${messageContent}`);
            } else {
                await interaction.channel.send(messageContent);
            }

            await interaction.reply({
                content: "<:blueutility4:1357261525387182251> Your announcement has been sent!",
                ephemeral: true
            });
        }
    }
};
