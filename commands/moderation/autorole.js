const {
    SlashCommandBuilder,
    EmbedBuilder,
    PermissionFlagsBits
} = require("discord.js");
const fs = require("fs");
const path = require("path");

// === CONFIG PATH ===
const configPath = path.join(__dirname, "../../data/autorole.json");

// Create config file if not exists
if (!fs.existsSync(configPath)) {
    fs.writeFileSync(configPath, JSON.stringify({}, null, 2));
}

module.exports = {
    data: new SlashCommandBuilder()
        .setName("autorole")
        .setDescription("Manage auto role system.")
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
        .addSubcommand(sub =>
            sub.setName("set")
                .setDescription("Set the role to auto-assign on join.")
                .addRoleOption(opt =>
                    opt.setName("role")
                        .setDescription("Role to auto-assign.")
                        .setRequired(true)
                )
        )
        .addSubcommand(sub =>
            sub.setName("remove")
                .setDescription("Disable auto role.")
        )
        .addSubcommand(sub =>
            sub.setName("status")
                .setDescription("Check current autorole status.")
        ),

    async execute(interaction) {
        const sub = interaction.options.getSubcommand();
        const guildId = interaction.guild.id;
        const data = JSON.parse(fs.readFileSync(configPath, "utf8"));

        // Emojis (sesuai style about.js)
        const E = {
            title: "<:utility12:1357261389399593004>",
            check: "<:blueutility4:1357261525387182251>",
            warn: "<:WARN:1447849961491529770>",
            role: "<:utility1:1357261562938790050>",
        };

        // Make embed function (clean like about.js)
        const baseEmbed = (title) =>
            new EmbedBuilder()
                .setColor(0x2b2d31)
                .setTitle(`${E.title} ${title}`)
                .setThumbnail(interaction.client.user.displayAvatarURL())
                .setTimestamp()
                .setFooter({
                    text: `Requested by ${interaction.user.tag}`,
                    iconURL: interaction.user.displayAvatarURL()
                });

        // ========================
        // SET ROLE
        // ========================
        if (sub === "set") {
            const role = interaction.options.getRole("role");

            data[guildId] = role.id;
            fs.writeFileSync(configPath, JSON.stringify(data, null, 2));

            const embed = baseEmbed("Auto Role Updated")
                .addFields({
                    name: `${E.role} New Auto Role`,
                    value: `${role}`,
                    inline: false
                });

            return interaction.reply({
                content: `${E.check} Auto role has been successfully set!`,
                embeds: [embed]
            });
        }

        // ========================
        // REMOVE
        // ========================
        if (sub === "remove") {
            if (!data[guildId]) {
                return interaction.reply({
                    content: `${E.warn} No autorole is currently set.`,
                    ephemeral: true
                });
            }

            delete data[guildId];
            fs.writeFileSync(configPath, JSON.stringify(data, null, 2));

            const embed = baseEmbed("Auto Role Disabled")
                .setDescription("Autorole has been removed successfully.");

            return interaction.reply({
                content: `${E.check} Autorole disabled.`,
                embeds: [embed]
            });
        }

        // ========================
        // STATUS
        // ========================
        if (sub === "status") {
            const roleId = data[guildId];

            const embed = baseEmbed("Auto Role Status")
                .addFields({
                    name: `${E.role} Assigned Role`,
                    value: roleId ? `<@&${roleId}>` : "None",
                    inline: false
                });

            return interaction.reply({
                embeds: [embed]
            });
        }
    }
};
