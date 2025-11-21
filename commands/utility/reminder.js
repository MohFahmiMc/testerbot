const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");

// Map userId -> array of reminders
const reminders = new Map();

module.exports = {
    data: new SlashCommandBuilder()
        .setName("remind")
        .setDescription("Set a reminder.")
        .addStringOption(option =>
            option.setName("time")
                .setDescription("Time in minutes from now")
                .setRequired(true))
        .addStringOption(option =>
            option.setName("text")
                .setDescription("Reminder text")
                .setRequired(true)),

    async execute(interaction) {
        const timeStr = interaction.options.getString("time");
        const text = interaction.options.getString("text");
        const time = parseInt(timeStr);

        if (isNaN(time) || time <= 0) return interaction.reply({ content: "❌ Invalid time!", ephemeral: true });

        const reminder = { text, time: Date.now() + time * 60000 };

        if (!reminders.has(interaction.user.id)) reminders.set(interaction.user.id, []);
        reminders.get(interaction.user.id).push(reminder);

        const embed = new EmbedBuilder()
            .setTitle("✅ Reminder Set!")
            .setDescription(`I will remind you in **${time} minute(s)**:\n${text}`)
            .setColor("Green")
            .setFooter({ text: "Reminder System" });

        await interaction.reply({ embeds: [embed] });

        // Schedule reminder
        setTimeout(() => {
            interaction.user.send({ embeds: [
                new EmbedBuilder()
                    .setTitle("⏰ Reminder")
                    .setDescription(text)
                    .setColor("Blue")
                    .setFooter({ text: "Reminder System" })
            ]});
        }, time * 60000);
    }
};
