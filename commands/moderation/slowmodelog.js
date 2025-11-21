const {
    SlashCommandBuilder,
    PermissionFlagsBits,
    EmbedBuilder,
} = require("discord.js");
const fs = require("fs");
const path = require("path");

const dataPath = path.join(__dirname, "../../data/slowmodelog.json");

// Buat file jika belum ada
if (!fs.existsSync(dataPath)) {
    fs.writeFileSync(dataPath, JSON.stringify({}, null, 2));
}

module.exports = {
    data: new SlashCommandBuilder()
        .setName("slowmodelog")
        .setDescription("Configure the slowmode logging channel")
        .addSubcommand(sub =>
            sub
                .setName("set")
                .setDescription("Set the channel for slowmode logs")
                .addChannelOption(opt =>
                    opt
                        .setName("channel")
                        .setDescription("The channel to send slowmode logs to")
                        .setRequired(true)
                )
        )
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels),

    async execute(interaction) {
        const sub = interaction.options.getSubcommand();

        if (sub === "set") {
            const selectedChannel = interaction.options.getChannel("channel");

            // Read existing data
            const jsonData = JSON.parse(fs.readFileSync(dataPath, "utf8"));

            // Save guild configuration
            jsonData[interaction.guild.id] = {
                logChannel: selectedChannel.id,
            };

            fs.writeFileSync(dataPath, JSON.stringify(jsonData, null, 2));

            const embed = new EmbedBuilder()
                .setTitle("Slowmode Logging Updated")
                .setDescription(
                    `Slowmode changes will now be logged in **${selectedChannel}**.`
                )
                .setColor("#4A90E2")
                .setTimestamp()
                .setFooter({ text: interaction.guild.name });

            return interaction.reply({ embeds: [embed], ephemeral: true });
        }
    },
};
