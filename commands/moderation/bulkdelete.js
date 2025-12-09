const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require("discord.js");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("bulkdelete")
        .setDescription("Delete multiple channels and roles at once.")
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
        .addStringOption(opt =>
            opt.setName("channels")
                .setDescription("Channel IDs (separate with commas).")
        )
        .addStringOption(opt =>
            opt.setName("roles")
                .setDescription("Role IDs (separate with commas).")
        ),

    async execute(interaction, client) {
        const channelsInput = interaction.options.getString("channels");
        const rolesInput = interaction.options.getString("roles");

        if (!channelsInput && !rolesInput) {
            return interaction.reply({
                content: "<:WARN:1447849961491529770> Please provide at least one channel ID or role ID.",
                ephemeral: true
            });
        }

        let deletedChannels = [];
        let deletedRoles = [];

        // =========================
        // DELETE CHANNELS
        // =========================
        if (channelsInput) {
            const ids = channelsInput.split(",").map(id => id.trim());

            for (const id of ids) {
                const ch = interaction.guild.channels.cache.get(id);
                if (ch) {
                    await ch.delete().catch(() => null);
                    deletedChannels.push(`#${ch.name}`);
                }
            }
        }

        // =========================
        // DELETE ROLES
        // =========================
        if (rolesInput) {
            const ids = rolesInput.split(",").map(id => id.trim());

            for (const id of ids) {
                const rl = interaction.guild.roles.cache.get(id);
                if (rl) {
                    await rl.delete().catch(() => null);
                    deletedRoles.push(rl.name);
                }
            }
        }

        // =========================
        // EMBED SUMMARY
        // =========================
        const embed = new EmbedBuilder()
            .setColor("#FF4B4B")
            .setTitle("<:management:1447855811425468446> Bulk Delete Summary")
            .setThumbnail(client.user.displayAvatarURL())
            .addFields(
                {
                    name: "📁 Deleted Channels",
                    value: deletedChannels.length ? deletedChannels.join("\n") : "None",
                    inline: false,
                },
                {
                    name: "📛 Deleted Roles",
                    value: deletedRoles.length ? deletedRoles.join("\n") : "None",
                    inline: false,
                }
            )
            .setFooter({
                text: `Requested by ${interaction.user.tag}`,
                iconURL: interaction.user.displayAvatarURL(),
            })
            .setTimestamp();

        return interaction.reply({
            content: "<:blueutility4:1357261525387182251> Bulk delete completed successfully!",
            embeds: [embed]
        });
    }
};
