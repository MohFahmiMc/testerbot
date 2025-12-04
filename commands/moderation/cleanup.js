const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require("discord.js");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("cleanup")
        .setDescription("Hapus banyak channel atau role sekaligus.")
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
        .addStringOption(opt =>
            opt.setName("channels")
                .setDescription("List ID channel yang mau dihapus (pisahkan dengan koma).")
                .setRequired(false)
        )
        .addStringOption(opt =>
            opt.setName("roles")
                .setDescription("List ID role yang mau dihapus (pisahkan dengan koma).")
                .setRequired(false)
        ),

    async execute(interaction, client) {
        const channelsInput = interaction.options.getString("channels");
        const rolesInput = interaction.options.getString("roles");

        if (!channelsInput && !rolesInput) {
            return interaction.reply({
                content: "❌ Kamu harus memilih minimal 1 channel atau 1 role untuk dihapus.",
                ephemeral: true
            });
        }

        let deletedChannels = [];
        let deletedRoles = [];

        // ===========================
        // HAPUS CHANNEL
        // ===========================
        if (channelsInput) {
            const channelIDs = channelsInput.split(",").map(id => id.trim());

            for (const id of channelIDs) {
                const ch = interaction.guild.channels.cache.get(id);
                if (ch) {
                    await ch.delete().catch(() => null);
                    deletedChannels.push(`#${ch.name}`);
                }
            }
        }

        // ===========================
        // HAPUS ROLE
        // ===========================
        if (rolesInput) {
            const roleIDs = rolesInput.split(",").map(id => id.trim());

            for (const id of roleIDs) {
                const rl = interaction.guild.roles.cache.get(id);
                if (rl) {
                    await rl.delete().catch(() => null);
                    deletedRoles.push(rl.name);
                }
            }
        }

        // JAM REALTIME
        const timeNow = new Date().toLocaleString("id-ID", {
            timeZone: "Asia/Jakarta"
        });

        // EMBED KEREN
        const embed = new EmbedBuilder()
            .setColor("#ff4444")
            .setTitle("🧹 Cleanup Success!")
            .setThumbnail(client.user.displayAvatarURL()) // FOTO BOT DI KANAN ATAS
            .setDescription("Berhasil menghapus resource berikut:")
            .addFields(
                {
                    name: "🗑 Channel yang dihapus",
                    value: deletedChannels.length > 0 ? deletedChannels.join("\n") : "Tidak ada",
                    inline: false
                },
                {
                    name: "🗑 Role yang dihapus",
                    value: deletedRoles.length > 0 ? deletedRoles.join("\n") : "Tidak ada",
                    inline: false
                }
            )
            .setFooter({ text: `Dijalankan pada ${timeNow}` })
            .setTimestamp();

        return interaction.reply({ embeds: [embed] });
    }
};
