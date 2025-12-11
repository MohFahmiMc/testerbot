const {
    SlashCommandBuilder,
    EmbedBuilder,
    PermissionFlagsBits
} = require("discord.js");

module.exports = {
    data: (() => {
        const cmd = new SlashCommandBuilder()
            .setName("createroles")
            .setDescription("Create multiple roles with custom names, colors, and settings.")
            .addIntegerOption(option =>
                option.setName("count")
                    .setDescription("How many roles to create? (1–20)")
                    .setRequired(true)
            )
            .addBooleanOption(option =>
                option.setName("hoisted")
                    .setDescription("Should the roles be hoisted? (Default: False)")
            )
            .addBooleanOption(option =>
                option.setName("mentionable")
                    .setDescription("Should the roles be mentionable? (Default: False)")
            )
            .addIntegerOption(option =>
                option.setName("position")
                    .setDescription("Set the role position (optional)")
            )
            .setDefaultMemberPermissions(PermissionFlagsBits.ManageRoles);

        // Auto-generate 20 name + color options
        for (let i = 1; i <= 20; i++) {
            cmd.addStringOption(o =>
                o.setName(`name${i}`)
                    .setDescription(`Role ${i} name`)
            );
            cmd.addStringOption(o =>
                o.setName(`color${i}`)
                    .setDescription(`Role ${i} color (#hex or color name)`)
            );
        }

        return cmd;
    })(),

    async execute(interaction) {
        const count = interaction.options.getInteger("count");
        const hoisted = interaction.options.getBoolean("hoisted") || false;
        const mentionable = interaction.options.getBoolean("mentionable") || false;
        const position = interaction.options.getInteger("position") || null;

        if (count < 1 || count > 20) {
            return interaction.reply({
                content: "You can only create **1–20 roles**.",
                ephemeral: true
            });
        }

        await interaction.deferReply();

        let created = 0;
        const progressEmbed = new EmbedBuilder()
            .setColor("#2b2d31")
            .setTitle("Creating Roles…")
            .setDescription(`Progress: **0/${count}**`)
            .setTimestamp()
            .setFooter({
                text: interaction.client.user.username,
                iconURL: interaction.client.user.displayAvatarURL()
            });

        const progressMsg = await interaction.editReply({ embeds: [progressEmbed] });

        for (let i = 1; i <= count; i++) {
            const name = interaction.options.getString(`name${i}`) || `Role ${i}`;
            const color = interaction.options.getString(`color${i}`) || "#2b2d31";

            try {
                const newRole = await interaction.guild.roles.create({
                    name,
                    color,
                    hoist: hoisted,
                    mentionable: mentionable,
                    reason: `Created by ${interaction.user.tag}`
                });

                // Move role if position given
                if (position !== null) {
                    await newRole.setPosition(position).catch(() => {});
                }

                created++;

                progressEmbed.setDescription(`Progress: **${created}/${count}**`);
                await progressMsg.edit({ embeds: [progressEmbed] });

            } catch (err) {
                console.error(err);
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
            .setTimestamp()
            .setFooter({
                text: `Requested by ${interaction.user.tag}`,
                iconURL: interaction.user.displayAvatarURL()
            });

        return interaction.editReply({ embeds: [doneEmbed] });
    }
};
