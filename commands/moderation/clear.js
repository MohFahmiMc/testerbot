const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require("discord.js");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("clear")
        .setDescription("Clear a number of messages in this channel")
        .addIntegerOption(option =>
            option.setName("amount")
                  .setDescription("Number of messages to delete")
                  .setRequired(true)
        )
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages),

    async execute(interaction) {
        const amount = interaction.options.getInteger("amount");

        if (amount < 1 || amount > 100) {
            return interaction.reply({
                content: "❌ You can only delete **1–100 messages** at once.",
                ephemeral: true
            });
        }

        await interaction.deferReply({ ephemeral: false });

        try {
            const deleted = await interaction.channel.bulkDelete(amount, true);

            const embed = new EmbedBuilder()
                .setColor("Blue")
                .setTitle("🧹 Messages Cleared")
                .setDescription(`Successfully deleted **${deleted.size}** messages.`)
                .setFooter({
                    text: interaction.guild.name,
                    iconURL: interaction.guild.iconURL() || undefined
                })
                .setTimestamp();

            await interaction.editReply({ embeds: [embed] });

        } catch (err) {
            console.error(err);

            return interaction.editReply({
                content: "❌ I couldn't delete messages in this channel. (Maybe messages are older than 14 days.)"
            });
        }
    }
};
