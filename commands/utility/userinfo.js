const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("userinfo")
        .setDescription("Displays detailed information about a user.")
        .addUserOption(option =>
            option
                .setName("target")
                .setDescription("Select a user")
                .setRequired(false)
        ),

    async execute(interaction) {
        const user = interaction.options.getUser("target") || interaction.user;
        const member = await interaction.guild.members.fetch(user.id);

        const E = {
            title: "<:premium_crown:1357260010303918090>",
            user: "<:utility1:1357261562938790050>",
            id: "<:utility12:1357261389399593004>",
            created: "<:blueutility4:1357261525387182251>",
            joined: "<:verify:1357254182356385852>",
            roles: "<:Utility1:1357261430684123218>",
            highest: "<a:AttentionAnimated:1357258884162785360>",
        };

        // Roles (maksimal 20 untuk mencegah embed error)
        const allRoles = member.roles.cache
            .filter(r => r.id !== interaction.guild.id)
            .sort((a, b) => b.position - a.position)
            .map(r => r.toString());

        const rolesDisplay =
            allRoles.length > 20
                ? allRoles.slice(0, 20).join(", ") + `\n+ ${allRoles.length - 20} more`
                : allRoles.join(", ") || "No roles";

        const embed = new EmbedBuilder()
            .setColor(0x2b2d31)
            .setThumbnail(user.displayAvatarURL({ size: 256 }))
            .setTitle(`${E.title} User Information • ${user.username}`)
            .setDescription(`Here is detailed information about **${user.tag}**.`)
            .addFields(
                {
                    name: `${E.user} Username`,
                    value: `${user.tag}`,
                    inline: true
                },
                {
                    name: `${E.id} User ID`,
                    value: user.id,
                    inline: true
                },
                {
                    name: `${E.created} Account Created`,
                    value: `<t:${Math.floor(user.createdTimestamp / 1000)}:F>`,
                    inline: true
                },
                {
                    name: `${E.joined} Joined Server`,
                    value: `<t:${Math.floor(member.joinedTimestamp / 1000)}:F>`,
                    inline: true
                },
                {
                    name: `${E.highest} Highest Role`,
                    value: member.roles.highest.toString(),
                    inline: true
                },
                {
                    name: `${E.roles} Roles`,
                    value: rolesDisplay,
                }
            )
            .setFooter({
                text: `${interaction.guild.name} • User Information`,
                iconURL: interaction.guild.iconURL()
            })
            .setTimestamp();

        await interaction.reply({ embeds: [embed] });
    }
};
