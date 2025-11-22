const {
  SlashCommandBuilder,
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
  InteractionType,
} = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("color")
    .setDescription("Preview embed dengan warna pilihan, termasuk custom hex!"),

  async execute(interaction) {
    // Tombol preset
    const colors = [
      { name: "Red", hex: "#FF0000", style: ButtonStyle.Danger },
      { name: "Blue", hex: "#0000FF", style: ButtonStyle.Primary },
      { name: "Green", hex: "#00FF00", style: ButtonStyle.Success },
      { name: "Yellow", hex: "#FFFF00", style: ButtonStyle.Secondary },
      { name: "Purple", hex: "#800080", style: ButtonStyle.Secondary },
      { name: "Custom Hex", hex: "custom", style: ButtonStyle.Secondary }
    ];

    // Embed default
    const embed = new EmbedBuilder()
      .setTitle("Color Preview")
      .setDescription("Pilih preset tombol atau input custom hex.")
      .setColor("#808080");

    const row = new ActionRowBuilder();
    colors.forEach(c => {
      row.addComponents(
        new ButtonBuilder()
          .setCustomId(`color_${c.hex.replace("#", "")}`)
          .setLabel(c.name)
          .setStyle(c.style)
      );
    });

    const msg = await interaction.reply({ embeds: [embed], components: [row], fetchReply: true });

    const collector = msg.createMessageComponentCollector({ time: 180000 }); // 3 menit

    collector.on("collect", async i => {
      if (i.user.id !== interaction.user.id)
        return i.reply({ content: "Ini bukan untukmu!", ephemeral: true });

      if (i.customId === "color_custom") {
        // Modal input
        const modal = new ModalBuilder()
          .setCustomId("color_modal")
          .setTitle("Masukkan Hex Color")
          .addComponents(
            new ActionRowBuilder().addComponents(
              new TextInputBuilder()
                .setCustomId("customHex")
                .setLabel("Hex color (contoh: #FF5733)")
                .setStyle(TextInputStyle.Short)
                .setRequired(true)
            )
          );
        await i.showModal(modal);
        return;
      }

      const hex = "#" + i.customId.split("_")[1];
      const newEmbed = EmbedBuilder.from(embed).setColor(hex).setDescription(`Warna dipilih: **${hex}**`);
      await i.update({ embeds: [newEmbed] });
    });

    // Modal interaction
    interaction.client.on("interactionCreate", async modalInteraction => {
      if (modalInteraction.type !== InteractionType.ModalSubmit) return;
      if (modalInteraction.customId !== "color_modal") return;
      if (modalInteraction.user.id !== interaction.user.id) return;

      const hexInput = modalInteraction.fields.getTextInputValue("customHex").trim();
      // Validasi hex
      const isValidHex = /^#([0-9A-F]{6})$/i.test(hexInput);
      if (!isValidHex) {
        return modalInteraction.reply({ content: "Hex tidak valid! Gunakan format #RRGGBB", ephemeral: true });
      }

      const newEmbed = EmbedBuilder.from(embed).setColor(hexInput).setDescription(`Warna dipilih: **${hexInput}**`);
      await modalInteraction.update({ embeds: [newEmbed] });
    });

    collector.on("end", async () => {
      // disable semua tombol setelah habis waktu
      const disabledRow = new ActionRowBuilder();
      colors.forEach(c => {
        disabledRow.addComponents(
          new ButtonBuilder()
            .setCustomId(`color_${c.hex.replace("#", "")}`)
            .setLabel(c.name)
            .setStyle(c.style)
            .setDisabled(true)
        );
      });
      await msg.edit({ components: [disabledRow] });
    });
  },
};
