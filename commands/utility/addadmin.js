const { SlashCommandBuilder } = require("discord.js");
const fs = require("fs");
const path = require("path");

module.exports = {
    adminOnly: true,
    data: new SlashCommandBuilder()
        .setName("addadmin")
        .setDescription("Add a user to admin list")
        .addUserOption(opt => opt.setName("user").setDescription("Select user").setRequired(true)),

    async execute(interaction) {
        // Cek owner dulu
        if (interaction.user.id !== process.env.OWNER_ID) {
            return interaction.reply({ content: "❌ Only the bot owner can add admins.", ephemeral: true });
        }

        const user = interaction.options.getUser("user");
        const filePath = path.join(__dirname, "..", "data", "admins.json");
        const data = JSON.parse(fs.readFileSync(filePath, "utf8"));

        if (data.admins.includes(user.id)) {
            return interaction.reply({ content: `❌ ${user.tag} is already an admin.`, ephemeral: true });
        }

        data.admins.push(user.id);
        fs.writeFileSync(filePath, JSON.stringify(data, null, 2));

        return interaction.reply({ content: `✅ ${user.tag} added as admin.`, ephemeral: true });
    }
};
