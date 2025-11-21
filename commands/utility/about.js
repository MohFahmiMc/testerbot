const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("about")
        .setDescription("Show information about the bot"),

    async execute(interaction) {
        const client = interaction.client;

        // Hitung total command
        const totalCommands = client.commands.size;

        // Hitung total user yang bisa dijangkau
        let totalUsers = 0;
        client.guilds.cache.forEach(g => totalUsers += g.memberCount);

        const embed = new EmbedBuilder()
            .setTitle("🤖 About This Bot")
            .setColor("Blue")
            .addFields(
                { name: "Bot Name", value: client.user.tag, inline: true },
                { name: "Creator", value: "@mizephyr", inline: true },
                { name: "Servers Joined", value: `${client.guilds.cache.size}`, inline: true },
                { name: "Total Users", value: `${totalUsers}`, inline: true },
                { name: "Total Commands", value: `${totalCommands}`, inline: true },
                { name: "Status", value: `${client.presence?.status || "Unknown"}`, inline: true }
            )
            .setFooter({ text: "Zephyr Bot • Made with ❤️" })
            .setTimestamp();

        await interaction.reply({ embeds: [embed] });
    }
};
