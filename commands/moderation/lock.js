const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require("discord.js");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("lock")
        .setDescription("Lock the current channel so members cannot send messages.")
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels),

    async execute(interaction) {
        const channel = interaction.channel;

        // Emojis
        const E = {
            title: "<:lock1:1447862841448589323>",
            success: "<:blueutility4:1357261525387182251>",
            warn: "<:WARN:1447849961491529770>",
        };

        // Apply lock
        await channel.permissionOverwrites.edit(
            interaction.guild.roles.everyone,
            { SendMessages: false }
        );

        const embed = new EmbedBuilder()
            .setColor(0x2b2d31)
            .setTitle(`${E.title} Channel Locked`)
            .setDescription(`This channel has been locked for all members.`)
            .addFields({
                name: "🔒 Status",
                value: "Members can no longer send messages.",
                inline: false
            })
            .setFooter({
                text: `Locked by ${interaction.user.tag}`,
                iconURL: interaction.user.displayAvatarURL()
            })
            .setTimestamp();

        await interaction.reply({
            content: `${E.success} Channel locked successfully!`,
            embeds: [embed]
        });
    },
};
