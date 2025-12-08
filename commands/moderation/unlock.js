const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require("discord.js");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("unlock")
        .setDescription("Unlock this channel so everyone can chat again.")
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels),

    async execute(interaction) {
        const channel = interaction.channel;

        try {

            await channel.permissionOverwrites.edit(interaction.guild.roles.everyone, {
                SendMessages: true
            });

            const embed = new EmbedBuilder()
                .setColor("#33cc66")
                .setTitle("🔓 Channel Unlocked")
                .setDescription(`This channel has been successfully **unlocked**. Members can now chat again.`)
                .addFields({
                    name: "📌 Channel",
                    value: `${channel}`,
                    inline: true
                })
                .setThumbnail(interaction.guild.iconURL({ size: 256 }))
                .setFooter({ text: interaction.guild.name })
                .setTimestamp();

            await interaction.reply({ embeds: [embed] });

        } catch (err) {
            console.error(err);
            return interaction.reply({
                content: "❌ An error occurred while trying to unlock this channel.",
                ephemeral: true
            });
        }
    }
};
