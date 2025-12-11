const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("support")
        .setDescription("Get links to support server and donate for the bot."),

    async execute(interaction) {
        const supportEmoji = "<:Support:1447452228259549215>";
        const donateEmoji = "<:Support:1447452228259549215>"; // bisa diganti emoji lain jika ada

        const embed = new EmbedBuilder()
            .setColor("#2b2d31")
            .setTitle(`${supportEmoji} Zephyr Support & Donate`)
            .setDescription(`Need help or want to support Zephyr Bot?\nHere are the available options:`)
            .addFields(
                {
                    name: `${supportEmoji} Support Server`,
                    value: `[Join Support Server](https://discord.gg/FkvM362RJu)`,
                    inline: true
                },
                {
                    name: `${donateEmoji} Donate / Support`,
                    value: `[Support Me](https://sociabuzz.com/scarilyid)`,
                    inline: true
                }
            )
            .setThumbnail(interaction.client.user.displayAvatarURL({ size: 256 }))
            .setFooter({
                text: "Zephyr Utility • Support & Donate",
                iconURL: interaction.client.user.displayAvatarURL()
            })
            .setTimestamp();

        await interaction.reply({ embeds: [embed], ephemeral: false });
    }
};
