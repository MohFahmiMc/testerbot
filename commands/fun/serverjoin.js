const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("serverlist")
        .setDescription("Show all servers Zephyr has joined."),

    async execute(interaction, client) {
        const servers = client.guilds.cache;

        const embed = new EmbedBuilder()
            .setTitle("📊 Zephyr Server List")
            .setThumbnail(client.user.displayAvatarURL())
            .setColor("#5865F2")
            .setDescription(
                `Zephyr is in **${servers.size} servers**.\n\n` +
                servers
                    .map(g => `• **${g.name}** — \`${g.memberCount} members\``)
                    .join("\n")
            )
            .setFooter({ text: "ScarilyID • Global Server Scanner" })
            .setTimestamp();

        return interaction.reply({ embeds: [embed] });
    },
};
