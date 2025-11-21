const { 
    SlashCommandBuilder, 
    PermissionFlagsBits, 
    EmbedBuilder 
} = require("discord.js");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("mute")
        .setDescription("Mute a member by giving them the Muted role")
        .setDefaultMemberPermissions(PermissionFlagsBits.MuteMembers)
        .addUserOption(option =>
            option.setName("user")
                .setDescription("The user to mute")
                .setRequired(true)
        )
        .addStringOption(option =>
            option.setName("reason")
                .setDescription("Reason for the mute")
                .setRequired(false)
        ),

    async execute(interaction) {
        const target = interaction.options.getUser("user");
        const reason = interaction.options.getString("reason") || "No reason provided";

        const member = interaction.guild.members.cache.get(target.id);

        if (!member) {
            return interaction.reply({
                content: "The selected user is not in this server.",
                ephemeral: true
            });
        }

        // Cari role "Muted"
        let mutedRole = interaction.guild.roles.cache.find(role => role.name === "Muted");

        // Jika tidak ada, buat otomatis
        if (!mutedRole) {
            try {
                mutedRole = await interaction.guild.roles.create({
                    name: "Muted",
                    color: "#555555",
                    permissions: []
                });

                // Lock permission di semua channel
                interaction.guild.channels.cache.forEach(async channel => {
                    try {
                        await channel.permissionOverwrites.edit(mutedRole, { 
                            SendMessages: false,
                            Speak: false,
                            AddReactions: false
                        });
                    } catch (error) {
                        console.error(`Failed setting permissions in ${channel.name}`);
                    }
                });

            } catch (err) {
                return interaction.reply({
                    content: "Failed to create Muted role. Please check permissions.",
                    ephemeral: true
                });
            }
        }

        // Cek bisa mute atau tidak
        if (member.roles.cache.has(mutedRole.id)) {
            return interaction.reply({
                content: "This user is already muted.",
                ephemeral: true
            });
        }

        if (!member.manageable) {
            return interaction.reply({
                content: "I cannot mute this user. They may have a higher role.",
                ephemeral: true
            });
        }

        try {
            await member.roles.add(mutedRole, reason);

            const embed = new EmbedBuilder()
                .setColor("#2B2D31")
                .setTitle("Member Muted")
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
                content: "Failed to mute the user.",
                ephemeral: true
            });
        }
    }
};
