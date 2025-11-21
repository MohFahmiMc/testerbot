const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const fs = require("fs");
const path = require("path");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("restoreserver")
        .setDescription("Restore server settings from backup file"),

    async execute(interaction) {
        await interaction.deferReply({ ephemeral: false });

        if (!interaction.member.permissions.has("Administrator")) {
            return interaction.editReply("❌ You must be an Administrator to use this.");
        }

        const backupPath = path.join(__dirname, "../../data/serverBackup.json");

        if (!fs.existsSync(backupPath)) {
            return interaction.editReply("❌ No backup found. Use `/backupserver` first.");
        }

        const backupData = JSON.parse(fs.readFileSync(backupPath));

        const guild = interaction.guild;

        // ==========================
        // RESTORE BASIC GUILD INFO
        // ==========================
        try {
            await guild.setName(backupData.name);
            if (backupData.icon) {
                await guild.setIcon(backupData.icon);
            }
            if (backupData.banner) {
                await guild.setBanner(backupData.banner);
            }
            if (backupData.description) {
                await guild.setDescription(backupData.description);
            }
        } catch (err) {
            console.error("Error while restoring guild info:", err);
        }

        // ==========================
        // RESTORE ROLES
        // ==========================
        try {
            for (const roleData of backupData.roles) {
                const existingRole = guild.roles.cache.find(r => r.name === roleData.name);

                if (!existingRole) {
                    await guild.roles.create({
                        name: roleData.name,
                        color: roleData.color,
                        hoist: roleData.hoist,
                        permissions: roleData.permissions,
                        mentionable: roleData.mentionable
                    });
                }
            }
        } catch (err) {
            console.error("Error restoring roles:", err);
        }

        // ==========================
        // RESTORE CHANNELS
        // ==========================
        try {
            for (const category of backupData.categories) {
                let cat = guild.channels.cache.find(c => c.name === category.name && c.type === 4);

                if (!cat) {
                    cat = await guild.channels.create({
                        name: category.name,
                        type: 4
                    });
                }

                for (const ch of category.channels) {
                    let existing = guild.channels.cache.find(c => c.name === ch.name);

                    if (!existing) {
                        await guild.channels.create({
                            name: ch.name,
                            type: ch.type,
                            parent: cat.id
                        });
                    }
                }
            }
        } catch (err) {
            console.error("Error restoring channels:", err);
        }

        // ==========================
        // FINISH MESSAGE
        // ==========================
        const embed = new EmbedBuilder()
            .setTitle("✅ Server Restore Complete")
            .setDescription("Your server has been successfully restored from backup.")
            .addFields(
                { name: "Restored", value: "• Server Info\n• Roles\n• Categories\n• Channels", inline: false }
            )
            .setThumbnail(guild.iconURL({ size: 256 }))
            .setColor("#2ECC71")
            .setTimestamp();

        interaction.editReply({ embeds: [embed] });
    }
};
