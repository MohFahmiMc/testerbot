const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("joininfo")
        .setDescription("Show information about when a user joined the server.")
        .addUserOption(option =>
            option.setName("member")
                .setDescription("Select a user to view join info")
                .setRequired(true)
        ),

    async execute(interaction) {
        const user = interaction.options.getUser("member");
        const member = await interaction.guild.members.fetch(user.id);

        // Emojis (sesuai tema kamu)
        const E = {
            title: "<:utility12:1357261389399593004>",
            user: "<:Utility1:1357261430684123218>",
            id: "<:blueutility4:1357261525387182251>",
            join: "<:premium_crown:1357260010303918090>",
        };

        const embed = new EmbedBuilder()
            .setColor(0x2b2d31)
            .setTitle(`${E.title} Join Information`)
            .setThumbnail(user.displayAvatarURL())
            .addFields(
                {
                    name: `${E.user} User`,
                    value: `${user.tag}`,
                    inline: true
                },
                {
                    name: `${E.id} User ID`,
                    value: `${user.id}`,
                    inline: true
                },
                {
                    name: `${E.join} Joined Server`,
                    value:
                        `📅 **Full:** <t:${Math.floor(member.joinedTimestamp / 1000)}:F>\n` +
                        `⏱️ **Relative:** <t:${Math.floor(member.joinedTimestamp / 1000)}:R>`,
                    inline: false
                }
            )
            .setFooter({
                text: `${interaction.guild.name} • Member Join Info`,
                iconURL: interaction.guild.iconURL() || undefined
            })
            .setTimestamp();

        return interaction.reply({ embeds: [embed] });
    }
};
