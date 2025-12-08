const { SlashCommandBuilder, EmbedBuilder, PermissionsBitField } = require("discord.js");
const { afkUsers } = require("../../utils/afkData");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("afk")
        .setDescription("Set your AFK status.")
        .addStringOption(option =>
            option.setName("reason")
                .setDescription("Reason for going AFK")
                .setRequired(false)
        ),

    async execute(interaction) {
        const reason = interaction.options.getString("reason") || "No reason provided.";

        // Save AFK data
        const now = Math.floor(Date.now() / 1000);
        afkUsers.set(interaction.user.id, {
            reason,
            timestamp: now
        });

        // Auto-create AFK role if missing
        let afkRole = interaction.guild.roles.cache.find(r => r.name === "AFK");

        if (!afkRole) {
            afkRole = await interaction.guild.roles.create({
                name: "AFK",
                color: "#808080",
                reason: "Automatically created AFK role"
            });
        }

        // Apply role
        if (!interaction.member.roles.cache.has(afkRole.id)) {
            await interaction.member.roles.add(afkRole.id);
        }

        // Auto nickname [AFK]
        if (interaction.guild.members.me.permissions.has(PermissionsBitField.Flags.ManageNicknames)) {
            const oldName = interaction.member.displayName;
            if (!oldName.startsWith("[AFK]")) {
                await interaction.member.setNickname(`[AFK] ${oldName}`).catch(() => {});
            }
        }

        // AFK embed
        const embed = new EmbedBuilder()
            .setColor("#808080")
            .setAuthor({
                name: `${interaction.user.username} is now AFK`,
                iconURL: interaction.user.displayAvatarURL()
            })
            .setThumbnail(interaction.user.displayAvatarURL())
            .addFields(
                { name: "Reason", value: reason },
                { name: "Since", value: `<t:${now}:F>\n(<t:${now}:R>)` }
            )
            .setFooter({ text: "AFK System Activated" })
            .setTimestamp();

        await interaction.reply({
            embeds: [embed],
            ephemeral: true
        });
    }
};
