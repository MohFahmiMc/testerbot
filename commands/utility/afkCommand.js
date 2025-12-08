const { SlashCommandBuilder } = require("discord.js");
const { setAFK } = require("../../utils/afk.js");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("afk")
        .setDescription("Set yourself as AFK")
        .addStringOption(option => 
            option.setName("reason")
                .setDescription("Reason for being AFK")
                .setRequired(false)
        ),

    async execute(interaction) {
        const reason = interaction.options.getString("reason") || "AFK";
        const member = interaction.member;

        const result = await setAFK(member, reason, interaction.client);

        if (result.error) return interaction.reply({ content: result.error, ephemeral: true, flags: 64 });
        if (result.embed) return interaction.reply({ embeds: [result.embed], flags: 64 });
    }
};
