const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require("discord.js");
const fs = require("fs");
const path = require("path");

const WELCOME_FILE = path.join(__dirname, "../../data/welcome.json");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("setwelcome")
        .setDescription("Set the welcome channel for this server.")
        .addChannelOption(option =>
            option.setName("channel")
                .setDescription("The channel to send welcome messages.")
                .setRequired(true)
        )
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

    async execute(interaction) {
        const channel = interaction.options.getChannel("channel");

        // Load existing data
        let data = {};
        if (fs.existsSync(WELCOME_FILE)) {
            data = JSON.parse(fs.readFileSync(WELCOME_FILE, "utf8"));
        }

        // Save new channel
        data[interaction.guild.id] = channel.id;
        fs.writeFileSync(WELCOME_FILE, JSON.stringify(data, null, 4));

        // Emoji set ala about.js
        const E = {
            title: "<:premium_crown:1357260010303918090>",
            channel: "<:utility12:1357261389399593004>",
            done: "<:blueutility4:1357261525387182251>"
        };

        const embed = new EmbedBuilder()
            .setColor(0x2b2d31)
            .setTitle(`${E.title} Welcome Channel Set`)
            .setDescription(`${E.channel} Welcome messages will now be sent in ${channel}`)
            .setFooter({ text: `Set by ${interaction.user.tag}`, iconURL: interaction.user.displayAvatarURL() })
            .setTimestamp();

        await interaction.reply({ embeds: [embed], ephemeral: true });
    }
};
