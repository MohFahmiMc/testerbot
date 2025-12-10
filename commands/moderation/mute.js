const {
    SlashCommandBuilder,
    PermissionFlagsBits,
    EmbedBuilder
} = require("discord.js");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("mute")
        .setDescription("Mute a member by assigning the Muted role.")
        .setDefaultMemberPermissions(PermissionFlagsBits.MuteMembers)
        .addUserOption(option =>
            option.setName("user")
                .setDescription("User to mute")
                .setRequired(true)
        )
        .addStringOption(option =>
            option.setName("reason")
                .setDescription("Reason for the mute")
                .setRequired(false)
        ),

    async execute(interaction) {
        const target = interaction.options.getUser("user");
        const reason = interaction.options.getString("reason") || "No reason provided.";
        const member = interaction.guild.members.cache.get(target.id);

        const E = {
            mute: "<:Utility1:1357261430684123218>",
            done: "<:premium_crown:1357260010303918090>",
            error: "❌",
        };

        if (!member) {
            return interaction.reply({
                content: `${E.error} The selected user is not in this server.`,
                ephemeral: true
            });
        }

        // ----- ROLE CHECK -----
        let mutedRole = interaction.guild.roles.cache.find(r => r.name === "Muted");

        // Auto create Muted role if not exist
        if (!mutedRole) {
            try {
                mutedRole = await interaction.guild.roles.create({
                    name: "Muted",
                    color: "#5a5a5a",
                    permissions: []
                });

                // Apply channel overwrite
                for (const channel of interaction.guild.channels.cache.values()) {
                    try {
                        await channel.permissionOverwrites.edit(mutedRole, {
                            SendMessages: false,
                            AddReactions: false,
                            Speak: false
                        });
                    } catch (e) {
                        console.error(`Failed to set permissions in ${channel.name}`);
                    }
                }
            } catch (error) {
                return interaction.reply({
                    content: `${E.error} Failed to create **Muted** role. Please check permissions.`,
                    ephemeral: true
                });
            }
        }

        // Already muted
        if (member.roles.cache.has(mutedRole.id)) {
            return interaction.reply({
                content: `${E.error} This user is already muted.`,
                ephemeral: true
            });
        }

        if (!member.manageable) {
            return interaction.reply({
                content: `${E.error} I cannot mute this user. They may have a higher role than me.`,
                ephemeral: true
            });
        }

        // ----- APPLY MUTE -----
        try {
            await member.roles.add(mutedRole, reason);

            // Optional: DM the user
            try {
                await target.send(
                    `🔇 You have been muted in **${interaction.guild.name}**.\n**Reason:** ${reason}`
                );
            } catch {}

            // Create embed
            const embed = new EmbedBuilder()
                .setColor(0x2b2d31)
                .setTitle(`${E.mute} Member Muted`)
                .setDescription(`${E.done} Successfully muted **${target.tag}**.`)
                .addFields(
                    { name: "👤 User", value: `${target.tag}`, inline: true },
                    { name: "🆔 ID", value: `${target.id}`, inline: true },
                    { name: "📝 Reason", value: `${reason}`, inline: false }
                )
                .setFooter({
                    text: `${interaction.user.tag} • Moderator`,
                    iconURL: interaction.user.displayAvatarURL()
                })
                .setTimestamp();

            return interaction.reply({ embeds: [embed] });

        } catch (err) {
            console.error(err);
            return interaction.reply({
                content: `${E.error} Failed to mute the user.`,
                ephemeral: true
            });
        }
    }
};
