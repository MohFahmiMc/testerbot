const { 
    SlashCommandBuilder, 
    PermissionFlagsBits, 
    EmbedBuilder 
} = require("discord.js");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("kick")
        .setDescription("Kick a member from the server")
        .setDefaultMemberPermissions(PermissionFlagsBits.KickMembers)
        .addUserOption(option => 
            option.setName("user")
                .setDescription("The user to kick")
                .setRequired(true)
        )
        .addStringOption(option =>
            option.setName("reason")
                .setDescription("Reason for kicking the user")
                .setRequired(false)
        ),

    async execute(interaction) {
        const target = interaction.options.getUser("user");
        const reason = interaction.options.getString("reason") || "No reason provided";

        const member = interaction.guild.members.cache.get(target.id);

        // Tidak bisa kick bot atau owner
        if (!member) {
            return interaction.reply({
                content: "The selected user is not in this server.",
                ephemeral: true
            });
        }

        if (!member.kickable) {
            return interaction.reply({
                content: "I cannot kick this user. They may have a higher role or I lack permissions.",
                ephemeral: true
            });
        }

        try {
            await member.kick(reason);

            const embed = new EmbedBuilder()
                .setColor("#2B2D31")
                .setTitle("Member Kicked")
                .addFields(
                    { name: "User", value: `${target.tag}`, inline: true },
                    { name: "ID", value: `${target.id}`, inline: true },
                    { name: "Reason", value: reason }
                )
                .setFooter({
                    text: interaction.guild.name,
                    iconURL: interaction.guild.iconURL() || undefined
                })
                .setTimestamp();

            return interaction.reply({ embeds: [embed] });

        } catch (err) {
            console.error(err);
            return interaction.reply({
                content: "Failed to kick the user. Please check my permissions.",
                ephemeral: true
            });
        }
    }
};
