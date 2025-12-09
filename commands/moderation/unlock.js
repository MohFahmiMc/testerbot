const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require("discord.js");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("unlock")
        .setDescription("Unlock the current channel so members can send messages again.")
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels),

    async execute(interaction) {
        const channel = interaction.channel;

        // Emojis
        const E = {
            title: "<:unlock1:1447862843694073937>",
            success: "<:blueutility4:1357261525387182251>",
        };

        // Remove lock
        await channel.permissionOverwrites.edit(
            interaction.guild.roles.everyone,
            { SendMessages: true }
        );

        const embed = new EmbedBuilder()
            .setColor(0x2b2d31)
            .setTitle(`${E.title} Channel Unlocked`)
            .setDescription(`Members can now send messages again.`)
            .addFields({
                name: "🔓 Status",
                value: "Message sending is now enabled.",
                inline: false
            })
            .setFooter({
                text: `Unlocked by ${interaction.user.tag}`,
                iconURL: interaction.user.displayAvatarURL()
            })
            .setTimestamp();

        await interaction.reply({
            content: `${E.success} Channel has been unlocked!`,
            embeds: [embed]
        });
    },
};
