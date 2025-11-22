const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("help")
    .setDescription("Show all commands."),

  async execute(interaction) {
    const embeds = [
      new EmbedBuilder().setTitle("Help Page 1").setDescription("Fun Commands").setColor("#0099ff"),
      new EmbedBuilder().setTitle("Help Page 2").setDescription("Moderation Commands").setColor("#00ff99"),
    ];

    let page = 0;

    const row = new ActionRowBuilder()
      .addComponents(
        new ButtonBuilder().setCustomId("prev").setLabel("Previous").setStyle(ButtonStyle.Primary),
        new ButtonBuilder().setCustomId("next").setLabel("Next").setStyle(ButtonStyle.Primary)
      );

    const msg = await interaction.reply({ embeds: [embeds[page]], components: [row], fetchReply: true });

    const collector = msg.createMessageComponentCollector({ time: 60000 });

    collector.on("collect", i => {
      if (i.user.id !== interaction.user.id) return i.reply({ content: "Not for you", ephemeral: true });

      if (i.customId === "next") page++;
      if (i.customId === "prev") page--;

      if (page < 0) page = embeds.length - 1;
      if (page >= embeds.length) page = 0;

      i.update({ embeds: [embeds[page]], components: [row] });
    });
  },
};
