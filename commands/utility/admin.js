const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const fs = require("fs");
const path = require("path");

const adminFile = path.join(__dirname, "../data/admins.json");

// Pastikan file admins.json ada
if (!fs.existsSync(adminFile)) fs.writeFileSync(adminFile, JSON.stringify([]));

module.exports = {
    data: new SlashCommandBuilder()
        .setName("admin")
        .setDescription("Manage bot admins (Owner only)")
        .addSubcommand(sub =>
            sub.setName("add")
                .setDescription("Add a user as admin")
                .addUserOption(option => option.setName("user").setDescription("User to add").setRequired(true))
        )
        .addSubcommand(sub =>
            sub.setName("remove")
                .setDescription("Remove a user from admin")
                .addUserOption(option => option.setName("user").setDescription("User to remove").setRequired(true))
        )
        .addSubcommand(sub =>
            sub.setName("list")
                .setDescription("List all admins")
        ),

    async execute(interaction) {
        const ownerId = process.env.OWNER_ID;

        // Hanya owner yang bisa kelola admin
        if (interaction.user.id !== ownerId) {
            return interaction.reply({ content: "❌ Only the bot owner can manage admins.", ephemeral: true });
        }

        const admins = JSON.parse(fs.readFileSync(adminFile));

        if (interaction.options.getSubcommand() === "add") {
            const user = interaction.options.getUser("user");
            if (admins.includes(user.id)) {
                return interaction.reply({ content: `${user.tag} is already an admin.`, ephemeral: true });
            }
            admins.push(user.id);
            fs.writeFileSync(adminFile, JSON.stringify(admins, null, 2));
            return interaction.reply({ content: `✅ ${user.tag} has been added as admin.` });
        }

        if (interaction.options.getSubcommand() === "remove") {
            const user = interaction.options.getUser("user");
            if (!admins.includes(user.id)) {
                return interaction.reply({ content: `${user.tag} is not an admin.`, ephemeral: true });
            }
            const index = admins.indexOf(user.id);
            admins.splice(index, 1);
            fs.writeFileSync(adminFile, JSON.stringify(admins, null, 2));
            return interaction.reply({ content: `✅ ${user.tag} has been removed from admin.` });
        }

        if (interaction.options.getSubcommand() === "list") {
            if (!admins.length) return interaction.reply("No admins yet.");
            const embed = new EmbedBuilder()
                .setTitle("Bot Admins")
                .setDescription(admins.map(id => `<@${id}>`).join("\n"))
                .setColor("Blue")
                .setTimestamp();
            return interaction.reply({ embeds: [embed] });
        }
    },
};
