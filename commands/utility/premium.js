const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const fs = require("fs");
const path = require("path");

const premiumFile = path.join(__dirname, "../data/premium.json");

// Pastikan file premium.json ada
if (!fs.existsSync(premiumFile)) fs.writeFileSync(premiumFile, JSON.stringify([]));

module.exports = {
    data: new SlashCommandBuilder()
        .setName("premium")
        .setDescription("Manage premium access (Owner only)")
        .addSubcommand(sub =>
            sub.setName("add")
                .setDescription("Add a user to premium")
                .addUserOption(option => option.setName("user").setDescription("User to add").setRequired(true))
        )
        .addSubcommand(sub =>
            sub.setName("remove")
                .setDescription("Remove a user from premium")
                .addUserOption(option => option.setName("user").setDescription("User to remove").setRequired(true))
        )
        .addSubcommand(sub =>
            sub.setName("list")
                .setDescription("List all premium users")
        ),

    async execute(interaction) {
        const ownerId = process.env.OWNER_ID;
        if (interaction.user.id !== ownerId) {
            return interaction.reply({ content: "❌ Only the bot owner can use this command.", ephemeral: true });
        }

        const premiumUsers = JSON.parse(fs.readFileSync(premiumFile));

        if (interaction.options.getSubcommand() === "add") {
            const user = interaction.options.getUser("user");
            if (premiumUsers.includes(user.id)) {
                return interaction.reply({ content: `${user.tag} already has premium.`, ephemeral: true });
            }
            premiumUsers.push(user.id);
            fs.writeFileSync(premiumFile, JSON.stringify(premiumUsers, null, 2));
            return interaction.reply({ content: `✅ ${user.tag} has been added to premium.` });
        }

        if (interaction.options.getSubcommand() === "remove") {
            const user = interaction.options.getUser("user");
            if (!premiumUsers.includes(user.id)) {
                return interaction.reply({ content: `${user.tag} does not have premium.`, ephemeral: true });
            }
            const index = premiumUsers.indexOf(user.id);
            premiumUsers.splice(index, 1);
            fs.writeFileSync(premiumFile, JSON.stringify(premiumUsers, null, 2));
            return interaction.reply({ content: `✅ ${user.tag} has been removed from premium.` });
        }

        if (interaction.options.getSubcommand() === "list") {
            if (!premiumUsers.length) return interaction.reply("No premium users yet.");
            const usersList = premiumUsers.map(id => `<@${id}>`).join("\n");
            const embed = new EmbedBuilder()
                .setTitle("Premium Users")
                .setDescription(usersList)
                .setColor("Gold")
                .setTimestamp();
            return interaction.reply({ embeds: [embed] });
        }
    },
};
