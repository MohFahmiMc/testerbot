const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require("discord.js");
const fs = require("fs");
const path = require("path");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("warn")
        .setDescription("Warn a member and save the warning record.")
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages)
        .addUserOption(option =>
            option
                .setName("user")
                .setDescription("The user you want to warn.")
                .setRequired(true)
        )
        .addStringOption(option =>
            option
                .setName("reason")
                .setDescription("Reason for the warning.")
                .setRequired(false)
        ),

    async execute(interaction) {
        const user = interaction.options.getUser("user");
        const member = interaction.guild.members.cache.get(user.id);
        const reason = interaction.options.getString("reason") || "No reason provided.";

        if (!member) {
            return interaction.reply({
                content: "❌ User not found in this server.",
                ephemeral: true
            });
        }

        if (member.id === interaction.user.id) {
            return interaction.reply({
                content: "❌ You cannot warn yourself.",
                ephemeral: true
            });
        }

        // Path to warnings.json
        const warningFile = path.join(__dirname, "../../data/warnings.json");

        // Read DB
        let db = {};
        if (fs.existsSync(warningFile)) {
            db = JSON.parse(fs.readFileSync(warningFile, "utf8"));
        }

        // Ensure guild entry
        if (!db[interaction.guild.id]) db[interaction.guild.id] = {};
        if (!db[interaction.guild.id][user.id]) db[interaction.guild.id][user.id] = [];

        // Add warning
        db[interaction.guild.id][user.id].push({
            moderator: interaction.user.id,
            reason: reason,
            date: Date.now()
        });

        // Save DB
        fs.writeFileSync(warningFile, JSON.stringify(db, null, 4));

        // Embed
        const embed = new EmbedBuilder()
            .setColor("#ef4444")
            .setTitle("⚠️ Warning Issued")
            .setThumbnail(user.displayAvatarURL({ size: 256 }))
            .addFields(
                { name: "User", value: `${user.tag} (${user.id})`, inline: false },
                { name: "Moderator", value: interaction.user.tag, inline: false },
                { name: "Reason", value: reason, inline: false },
                { name: "Total Warnings", value: `${db[interaction.guild.id][user.id].length}`, inline: false }
            )
            .setFooter({ text: interaction.guild.name })
            .setTimestamp();

        return interaction.reply({ embeds: [embed] });
    }
};
