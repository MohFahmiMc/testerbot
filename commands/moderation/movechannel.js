const { SlashCommandBuilder, PermissionFlagsBits } = require("discord.js");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("movechannel")
        .setDescription("Move a channel or category to a new position")
        .addStringOption(option => 
            option.setName("type")
                  .setDescription("channel or category")
                  .setRequired(true)
                  .addChoices(
                      { name: "Channel", value: "channel" },
                      { name: "Category", value: "category" }
                  ))
        .addChannelOption(option => 
            option.setName("target")
                  .setDescription("The channel or category to move")
                  .setRequired(true))
        .addIntegerOption(option => 
            option.setName("position")
                  .setDescription("New position (1 = top)")
                  .setRequired(true))
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
    
    async execute(interaction) {
        const type = interaction.options.getString("type");
        const target = interaction.options.getChannel("target");
        const position = interaction.options.getInteger("position");

        if (!target || !position) return interaction.reply({ content: "❌ Invalid options.", ephemeral: true });

        try {
            await target.setPosition(position - 1); // Discord counts from 0
            await interaction.reply(`✅ Successfully moved ${type} **${target.name}** to position **${position}**.`);
        } catch (error) {
            console.error(error);
            await interaction.reply({ content: `❌ Failed to move ${type}: ${error.message}`, ephemeral: true });
        }
    },
};
