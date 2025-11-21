const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");

const afkUsers = new Map(); // Menyimpan data AFK: userId -> { until, reason }

module.exports = {
    data: new SlashCommandBuilder()
        .setName("afk")
        .setDescription("Set yourself as AFK until a specific time.")
        .addStringOption(option =>
            option.setName("time")
                .setDescription("Until what time? Format HH:MM, 24h")
                .setRequired(true))
        .addStringOption(option =>
            option.setName("reason")
                .setDescription("Reason for AFK")
                .setRequired(false)),

    async execute(interaction) {
        const time = interaction.options.getString("time");
        const reason = interaction.options.getString("reason") || "No reason provided";

        // Convert time to today Date object
        const now = new Date();
        const [hours, minutes] = time.split(":").map(Number);
        const until = new Date(now.getFullYear(), now.getMonth(), now.getDate(), hours, minutes);

        if (until <= now) {
            return interaction.reply({
                content: "❌ The time must be in the future!",
                ephemeral: true
            });
        }

        afkUsers.set(interaction.user.id, { until, reason });

        // Reply embed
        const embed = new EmbedBuilder()
            .setTitle(`${interaction.user.username} is now AFK`)
            .setDescription(`Until: **${time}**\nReason: ${reason}`)
            .setColor("Orange")
            .setFooter({ text: "ScarilyId AFK System" })
            .setTimestamp();

        await interaction.reply({ embeds: [embed], ephemeral: true });

        // Set timeout to remove AFK automatically
        setTimeout(() => {
            if (afkUsers.has(interaction.user.id)) {
                afkUsers.delete(interaction.user.id);
            }
        }, until.getTime() - now.getTime());
    }
};

// ---------- Listener di bot.js ----------
/*
Tambahkan di bot.js:

client.on("messageCreate", message => {
    if (afkUsers.has(message.author.id)) {
        afkUsers.delete(message.author.id);
        message.reply(`✅ Welcome back ${message.author.username}, you are no longer AFK.`);
    }

    if (message.mentions.users.size > 0) {
        message.mentions.users.forEach(user => {
            if (afkUsers.has(user.id)) {
                const data = afkUsers.get(user.id);
                const embed = new EmbedBuilder()
                    .setTitle(`${user.username} is AFK`)
                    .setDescription(`Until: ${data.until.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}\nReason: ${data.reason}`)
                    .setColor("Blue")
                    .setFooter({ text: "ScarilyId AFK System" })
                    .setTimestamp();
                message.reply({ embeds: [embed] });
            }
        });
    }
});
*/
