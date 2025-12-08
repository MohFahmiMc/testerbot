const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const { afkUsers } = require("../utils/afkData"); // <-- AFK storage global

module.exports = {
    data: new SlashCommandBuilder()
        .setName("afk")
        .setDescription("Set yourself as AFK until a specific time.")
        .addStringOption(option =>
            option.setName("time")
                .setDescription("Time to return (HH:MM, 24h format).")
                .setRequired(true))
        .addStringOption(option =>
            option.setName("reason")
                .setDescription("Reason for AFK")
                .setRequired(false)
        ),

    async execute(interaction) {
        const time = interaction.options.getString("time");
        const reason = interaction.options.getString("reason") || "No reason provided";

        // Parse HH:MM
        const now = new Date();
        const [h, m] = time.split(":").map(Number);

        // Build target date
        const until = new Date(
            now.getFullYear(),
            now.getMonth(),
            now.getDate(),
            h, m, 0
        );

        if (isNaN(h) || isNaN(m)) {
            return interaction.reply({
                content: "❌ Time format must be **HH:MM** (24-hour).",
                ephemeral: true
            });
        }

        if (until <= now) {
            return interaction.reply({
                content: "❌ Time must be **in the future**.",
                ephemeral: true
            });
        }

        afkUsers.set(interaction.user.id, {
            until,
            reason,
            setAt: now
        });

        const unix = Math.floor(until.getTime() / 1000);

        const embed = new EmbedBuilder()
            .setTitle(`🚨 You are now AFK`)
            .setColor("#2b2d31")
            .setDescription(
                `**Return at:** <t:${unix}:t>\n` +
                `**Local time:** <t:${unix}:F>\n\n` +
                `**Reason:** ${reason}`
            )
            .setFooter({ text: "ScarilyId AFK System" })
            .setTimestamp();

        await interaction.reply({ embeds: [embed], ephemeral: true });

        // Auto remove AFK when time reached
        setTimeout(() => {
            if (afkUsers.has(interaction.user.id)) {
                afkUsers.delete(interaction.user.id);
            }
        }, until.getTime() - now.getTime());
    }
};
