const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require("discord.js");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("lock")
        .setDescription("Mengunci channel agar tidak bisa mengirim pesan")
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels),

    async execute(interaction) {
        const channel = interaction.channel;

        try {
            // Disable SEND_MESSAGES for @everyone
            await channel.permissionOverwrites.edit(interaction.guild.id, {
                SendMessages: false
            });

            const embed = new EmbedBuilder()
                .setColor("#d9534f")
                .setTitle("🔒 Channel Locked")
                .setDescription(`Channel **${channel.name}** telah dikunci.\nSekarang hanya staff yang bisa mengirim pesan.`)
                .setTimestamp();

            await interaction.reply({ embeds: [embed] });

        } catch (err) {
            console.error(err);
            return interaction.reply({
                content: "❌ Terjadi error saat mengunci channel.",
                ephemeral: true
            });
        }
    }
};
