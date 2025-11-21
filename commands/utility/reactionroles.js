const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const fs = require("fs");
const path = require("path");

const dataPath = path.join(__dirname, "../data/reactionRoles.json");

// Pastikan file data ada
if (!fs.existsSync(dataPath)) fs.writeFileSync(dataPath, JSON.stringify([]));

module.exports = {
    data: new SlashCommandBuilder()
        .setName("reactionrole")
        .setDescription("Create a reaction role")
        .addRoleOption(option =>
            option.setName("role")
                .setDescription("The role to assign")
                .setRequired(true))
        .addStringOption(option =>
            option.setName("emoji")
                .setDescription("The emoji to react with")
                .setRequired(true))
        .addChannelOption(option =>
            option.setName("channel")
                .setDescription("The channel to send the message")
                .setRequired(true))
        .addStringOption(option =>
            option.setName("message")
                .setDescription("The message to display")
                .setRequired(true)),

    async execute(interaction) {
        const role = interaction.options.getRole("role");
        const emoji = interaction.options.getString("emoji");
        const channel = interaction.options.getChannel("channel");
        const text = interaction.options.getString("message");

        // Kirim embed message
        const embed = new EmbedBuilder()
            .setTitle("Reaction Role")
            .setDescription(text)
            .setColor("Blue")
            .setFooter({ text: "React to get the role!" });

        const msg = await channel.send({ embeds: [embed] });
        await msg.react(emoji);

        // Simpan di file JSON
        const data = JSON.parse(fs.readFileSync(dataPath));
        data.push({
            messageId: msg.id,
            channelId: channel.id,
            roleId: role.id,
            emoji: emoji
        });
        fs.writeFileSync(dataPath, JSON.stringify(data, null, 2));

        await interaction.reply({ content: `✅ Reaction role created!`, ephemeral: true });
    }
};
