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
                .setDescription("User to kick")
                .setRequired(true)
        )
        .addStringOption(option =>
            option.setName("reason")
                .setDescription("Reason for kicking")
                .setRequired(false)
        ),

    async execute(interaction) {
        const target = interaction.options.getUser("user");
        const reason = interaction.options.getString("reason") || "No reason provided";
        const member = interaction.guild.members.cache.get(target.id);

        // ================ VALIDASI =================
        if (!member) {
            return interaction.reply({
                content: "❌ That user is not in this server.",
                ephemeral: true
            });
        }

        if (!member.kickable) {
            return interaction.reply({
                content: "❌ I can't kick this user. They may have a higher role or I lack permissions.",
                ephemeral: true
            });
        }

        // Tidak bisa kick pemilik server
        if (target.id === interaction.guild.ownerId) {
            return interaction.reply({
                content: "❌ You cannot kick the server owner.",
                ephemeral: true
            });
        }

        // ============================================
        // DM USER sebelum di-kick
        // ============================================
        const dmEmbed = new EmbedBuilder()
            .setColor(0xE74C3C)
            .setTitle("🚫 You Have Been Kicked")
            .setDescription(
                `You were kicked from **${interaction.guild.name}**.\n\n**Reason:** ${reason}`
            )
            .setTimestamp();

        await target.send({ embeds: [dmEmbed] }).catch(() => {});

        // ============================================
        // KICK USER
        // ============================================
        await member.kick(reason).catch(err => {
            console.log(err);
            return interaction.reply({
                content: "❌ Failed to kick the user.",
                ephemeral: true
            });
        });

        // ============================================
        // EMBED RESPONSE (seperti about.js style)
        // ============================================
        const embed = new EmbedBuilder()
            .setColor(0x2B2D31)
            .setAuthor({
                name: "Member Kicked",
                iconURL: interaction.guild.iconURL({ size: 1024 }) || undefined
            })
            .addFields(
                { name: "👤 User", value: `${target} \`${target.tag}\``, inline: false },
                { name: "🆔 User ID", value: `\`${target.id}\``, inline: true },
                { name: "📄 Reason", value: reason, inline: false },
                { name: "👮‍♂️ Moderator", value: `${interaction.user}`, inline: false }
            )
            .setFooter({
                text: interaction.guild.name,
                iconURL: interaction.guild.iconURL() || undefined
            })
            .setTimestamp();

        return interaction.reply({ embeds: [embed] });
    }
};
