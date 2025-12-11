const {
    SlashCommandBuilder,
    EmbedBuilder,
    PermissionFlagsBits
} = require("discord.js");

module.exports = {

    data: new SlashCommandBuilder()
        .setName("createroles")
        .setDescription("Create multiple roles with optional JSON customization.")
        .addIntegerOption(o =>
            o.setName("count")
                .setDescription("How many roles to create? (1–20)")
                .setRequired(true)
        )
        .addStringOption(o =>
            o.setName("json")
                .setDescription("Optional: JSON list of roles [{ name:'x', color:'#fff' }]")
        )
        .addBooleanOption(o =>
            o.setName("hoisted")
                .setDescription("Should the roles be hoisted?")
        )
        .addBooleanOption(o =>
            o.setName("mentionable")
                .setDescription("Should the roles be mentionable?")
        )
        .addIntegerOption(o =>
            o.setName("position")
                .setDescription("Set the role position (optional)")
        )
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageRoles),

    async execute(interaction) {
        const count = interaction.options.getInteger("count");
        const hoisted = interaction.options.getBoolean("hoisted") || false;
        const mentionable = interaction.options.getBoolean("mentionable") || false;
        const position = interaction.options.getInteger("position") || null;
        const json = interaction.options.getString("json");

        if (count < 1 || count > 20) {
            return interaction.reply({
                content: "You can only create **1–20 roles**.",
                ephemeral: true
            });
        }

        let customData = [];

        // ============= JSON MODE =======================
        if (json) {
            try {
                customData = JSON.parse(json);

                if (!Array.isArray(customData))
                    throw new Error("Invalid JSON. Must be an array.");

                if (customData.length < 1 || customData.length > count)
                    throw new Error("JSON length must match count.");

            } catch (err) {
                return interaction.reply({
                    content: `❌ JSON invalid:\n\`${err.message}\``,
                    ephemeral: true
                });
            }
        }

        await interaction.deferReply();

        let created = 0;

        const progressEmbed = new EmbedBuilder()
            .setColor("#2b2d31")
            .setTitle("Creating Roles…")
            .setDescription(`Progress: **0/${count}**`)
            .setTimestamp();

        const progressMsg = await interaction.editReply({ embeds: [progressEmbed] });

        // ===============================================
        // CREATE ROLES
        // ===============================================
        for (let i = 0; i < count; i++) {
            const name = customData[i]?.name || `Role ${i + 1}`;
            const color = customData[i]?.color || "#2b2d31";

            try {
                const newRole = await interaction.guild.roles.create({
                    name,
                    color,
                    hoist: hoisted,
                    mentionable: mentionable,
                    reason: `Created by ${interaction.user.tag}`
                });

                if (position !== null) {
                    await newRole.setPosition(position).catch(() => {});
                }

                created++;

                progressEmbed.setDescription(`Progress: **${created}/${count}**`);
                await progressMsg.edit({ embeds: [progressEmbed] });

            } catch (err) {
                console.log(err);
            }
        }

        const doneEmbed = new EmbedBuilder()
            .setColor("#2b2d31")
            .setTitle("Roles Created Successfully")
            .setDescription(
                `Created **${created}** roles out of **${count}**.\n\n` +
                `Settings:\n` +
                `• Hoisted: **${hoisted}**\n` +
                `• Mentionable: **${mentionable}**\n` +
                `• Position: **${position ?? "Default"}**`
            )
            .setTimestamp();

        return interaction.editReply({ embeds: [doneEmbed] });
    }
};
